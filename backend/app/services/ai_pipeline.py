import json
import logging
from typing import List, Optional
from pydantic import BaseModel
from app.config import settings
from app.schemas import QuestionItem, ThemeCluster, GeneratedIdea

logger = logging.getLogger("uvicorn.error")

try:
    from google import genai
    from google.genai import types
    HAS_GOOGLE_GENAI = True
except ImportError:
    HAS_GOOGLE_GENAI = False


# Schema for structured output from Gemini
class LLMGeneratedIdea(BaseModel):
    id: str
    title: str
    format: str
    target_audience: str
    description: str


class LLMThemeCluster(BaseModel):
    theme_id: str
    name: str
    summary: str
    sentiment: str
    question_ids: List[str]
    generated_ideas: List[LLMGeneratedIdea]


class LLMAnalysisOutput(BaseModel):
    themes: List[LLMThemeCluster]


def fallback_heuristic_clustering(
    questions: List[QuestionItem],
    source_title: str,
    generate_ideas: bool = True,
) -> List[ThemeCluster]:
    """
    Intelligent local heuristic clustering used when Gemini API key is not configured or fails.
    Categories questions into logical topic buckets and synthesizes actionable ideas.
    """
    if not questions:
        return [
            ThemeCluster(
                theme_id="theme_general",
                name="General Discussion & Feedback",
                summary="Overall audience inquiries regarding topic fundamentals and concepts.",
                sentiment="curious",
                questions=[],
                generated_ideas=[
                    GeneratedIdea(
                        id="idea_1",
                        title=f"Complete Guide: {source_title}",
                        format="Comprehensive Guide",
                        target_audience="General Audience",
                        description="A foundational overview answering top audience questions.",
                    )
                ] if generate_ideas else [],
            )
        ]

    # Keyword rules for clustering
    clusters_map = {
        "setup": {
            "name": "Installation, Setup & Setup Issues",
            "keywords": ["install", "setup", "error", "windows", "mac", "version", "config", "require", "download", "dependency"],
            "questions": [],
            "ideas": [
                ("Zero-to-One Setup & Troubleshooting Guide", "Step-by-Step Tutorial", "Beginners", "A clear guide resolving common environment setup and installation friction."),
                ("5-Minute Quickstart Cheat Sheet", "Interactive Checklist", "Developers", "Rapid reference card for getting started without errors."),
            ]
        },
        "performance": {
            "name": "Performance, Scaling & Optimization",
            "keywords": ["scale", "performance", "fast", "slow", "memory", "speed", "optimize", "limit", "batch", "latency", "rate"],
            "questions": [],
            "ideas": [
                ("High Performance & Optimization Masterclass", "Video / Deep-Dive", "Intermediate Devs", "In-depth benchmarks and strategies for zero-latency operations."),
                ("Resource & Rate Limit Survival Guide", "Architecture Spec", "System Architects", "Practical patterns to handle high throughput and avoid API limits."),
            ]
        },
        "architecture": {
            "name": "Architecture, Best Practices & Alternatives",
            "keywords": ["architecture", "difference", "compare", "versus", "vs", "framework", "best practice", "pattern", "design", "redux", "state", "react"],
            "questions": [],
            "ideas": [
                ("Decision Matrix & Framework Comparison", "Infographic / Comparison", "Engineers & Leads", "Objective breakdown comparing alternative architectures and trade-offs."),
                ("Production Design Blueprint", "Code Blueprint", "Full-Stack Devs", "Clean, battle-tested boilerplate implementation."),
            ]
        },
        "general": {
            "name": "Core Concepts & Practical Usage",
            "keywords": [],
            "questions": [],
            "ideas": [
                ("Practical Hands-on Walkthrough", "Actionable Workshop", "Learners", "Step-by-step practical demonstration solving real-world challenges."),
                ("Top 10 Viewer Questions Answered", "Q&A Video / Blog", "Broader Audience", "Directly answering the most requested questions from the comment section."),
            ]
        }
    }

    # Categorize questions into clusters
    for q in questions:
        text_lower = q.text.lower()
        matched = False
        for key in ["setup", "performance", "architecture"]:
            if any(kw in text_lower for kw in clusters_map[key]["keywords"]):
                clusters_map[key]["questions"].append(q)
                matched = True
                break
        if not matched:
            clusters_map["general"]["questions"].append(q)

    result_clusters: List[ThemeCluster] = []
    cluster_counter = 1

    for cat_key, cat_data in clusters_map.items():
        q_list = cat_data["questions"]
        if not q_list:
            continue

        theme_id = f"theme_{cluster_counter}"
        cluster_counter += 1

        ideas: List[GeneratedIdea] = []
        if generate_ideas:
            for idea_idx, (t, fmt, aud, desc) in enumerate(cat_data["ideas"], 1):
                ideas.append(
                    GeneratedIdea(
                        id=f"idea_{theme_id}_{idea_idx}",
                        title=t,
                        format=fmt,
                        target_audience=aud,
                        description=desc,
                    )
                )

        result_clusters.append(
            ThemeCluster(
                theme_id=theme_id,
                name=cat_data["name"],
                summary=f"Audience questions focusing on {cat_data['name'].lower()}.",
                sentiment="curious" if cat_key != "setup" else "frustrated",
                questions=q_list,
                generated_ideas=ideas,
            )
        )

    return result_clusters


def analyze_with_gemini(
    questions: List[QuestionItem],
    source_title: str,
    generate_ideas: bool = True,
) -> Optional[List[ThemeCluster]]:
    """
    Uses Google Gemini 1.5/2.5 Flash structured output to cluster questions and generate ideas.
    """
    if not HAS_GOOGLE_GENAI or not settings.GEMINI_API_KEY:
        return None

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # Prepare text representation of questions for prompt
        questions_payload = [
            {"id": q.id, "author": q.author, "text": q.text, "likes": q.likes}
            for q in questions
        ]

        prompt = f"""
You are an expert Audience Intelligence Analyst.
Analyze the following viewer questions collected from the video titled "{source_title}".

Task:
1. Group these questions into 2 to 4 distinct thematic clusters.
2. For each cluster:
   - Provide a concise name and summary of viewer sentiments/intent.
   - Set sentiment to one of: "curious", "confused", "frustrated", "enthusiastic".
   - Include the exact `id`s of all questions belonging to this theme in `question_ids`.
   - {"Generate 2 high-impact, actionable content or product ideas." if generate_ideas else "Leave `generated_ideas` empty."}

Questions Data:
{json.dumps(questions_payload, indent=2)}
        """

        # Call Gemini API with structured JSON output
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LLMAnalysisOutput,
                temperature=0.3,
            ),
        )

        if not response.text:
            return None

        parsed_data = LLMAnalysisOutput.model_validate_json(response.text)
        
        # Map back question objects from question_ids
        q_dict = {q.id: q for q in questions}
        
        final_themes: List[ThemeCluster] = []
        for t in parsed_data.themes:
            theme_questions = [q_dict[qid] for qid in t.question_ids if qid in q_dict]
            
            theme_ideas = []
            if generate_ideas:
                for idx, idea in enumerate(t.generated_ideas, 1):
                    theme_ideas.append(
                        GeneratedIdea(
                            id=f"idea_{t.theme_id}_{idx}",
                            title=idea.title,
                            format=idea.format,
                            target_audience=idea.target_audience,
                            description=idea.description,
                        )
                    )

            final_themes.append(
                ThemeCluster(
                    theme_id=t.theme_id,
                    name=t.name,
                    summary=t.summary,
                    sentiment=t.sentiment,
                    questions=theme_questions,
                    generated_ideas=theme_ideas,
                )
            )

        return final_themes

    except Exception as e:
        logger.warning(f"Gemini API analysis failed: {e}. Falling back to heuristic clustering.")
        return None


def analyze_and_cluster(
    questions: List[QuestionItem],
    source_title: str,
    generate_ideas: bool = True,
) -> List[ThemeCluster]:
    """
    Main entrypoint for clustering questions and generating ideas.
    Tries Gemini LLM first, falling back to local heuristic clustering if unavailable.
    """
    # 1. Try Gemini LLM
    gemini_result = analyze_with_gemini(questions, source_title, generate_ideas)
    if gemini_result:
        return gemini_result

    # 2. Fallback to Heuristic Clustering
    return fallback_heuristic_clustering(questions, source_title, generate_ideas)
