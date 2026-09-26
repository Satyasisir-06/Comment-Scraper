"""
Comment Scraper - Backend API Entrypoint
Follows contract defined in docs/API_CONTRACT.md
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime, timezone
import uuid

app = FastAPI(
    title="Comment Scraper & Idea Catalyst API",
    version="1.0.0",
    description="Extracts questions and generates ideas from audience comments.",
)

# Enable CORS for Frontend (Vite running on localhost:5173 or localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class AnalyzeRequest(BaseModel):
    source_type: str = "youtube"
    url: Optional[str] = None
    raw_text: Optional[str] = None
    max_comments: int = 100
    generate_ideas: bool = True


class QuestionItem(BaseModel):
    id: str
    author: str
    text: str
    likes: int
    published_at: str


class GeneratedIdea(BaseModel):
    id: str
    title: str
    format: str
    target_audience: str
    description: str


class ThemeCluster(BaseModel):
    theme_id: str
    name: str
    summary: str
    sentiment: str
    questions: List[QuestionItem]
    generated_ideas: List[GeneratedIdea]


class AnalysisMetadata(BaseModel):
    source_type: str
    source_title: str
    total_comments_scanned: int
    questions_found: int
    themes_count: int


class AnalyzeResponse(BaseModel):
    job_id: str
    timestamp: str
    metadata: AnalysisMetadata
    themes: List[ThemeCluster]


@app.get("/api/health")
def health_check():
    """Health status endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "llm_connected": True,
    }


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_comments(request: AnalyzeRequest):
    """
    Main analysis endpoint.
    Currently returns contract-compliant mock data until scraper and LLM services are connected.
    """
    if not request.url and not request.raw_text:
        raise HTTPException(
            status_code=400,
            detail="Either 'url' or 'raw_text' must be provided.",
        )

    # Stubbed response matching docs/API_CONTRACT.md
    return AnalyzeResponse(
        job_id=f"job_{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        metadata=AnalysisMetadata(
            source_type=request.source_type,
            source_title="Sample Source Video (Analysis Stub)",
            total_comments_scanned=request.max_comments,
            questions_found=24,
            themes_count=2,
        ),
        themes=[
            ThemeCluster(
                theme_id="theme_1",
                name="Getting Started & Prerequisites",
                summary="Users asking how to set up their environment and troubleshoot initial configuration errors.",
                sentiment="curious",
                questions=[
                    QuestionItem(
                        id="q_1",
                        author="@dev_alex",
                        text="What dependencies do I need before running this project on Windows 11?",
                        likes=15,
                        published_at="2026-09-20T10:00:00Z",
                    ),
                    QuestionItem(
                        id="q_2",
                        author="@coder_sam",
                        text="Is Python 3.11 required or does it also work with 3.12?",
                        likes=8,
                        published_at="2026-09-21T12:00:00Z",
                    ),
                ],
                generated_ideas=[
                    GeneratedIdea(
                        id="idea_1",
                        title="Zero-to-Hero Environment Setup Checklist",
                        format="Article / Checklist",
                        target_audience="Beginner Developers",
                        description="A step-by-step setup guide resolving the 5 most common Windows setup pitfalls.",
                    ),
                    GeneratedIdea(
                        id="idea_2",
                        title="5-Minute Quickstart Video",
                        format="Short Form Video",
                        target_audience="Newcomers",
                        description="A rapid overview demonstrating repository cloning, virtualenv setup, and running the dev servers.",
                    ),
                ],
            ),
            ThemeCluster(
                theme_id="theme_2",
                name="Performance & Scalability",
                summary="Questions centered around rate limits, handling large batches of comments, and reducing AI API latency.",
                sentiment="analytical",
                questions=[
                    QuestionItem(
                        id="q_3",
                        author="@scale_engineer",
                        text="How do we handle YouTube API quota limits when scanning thousands of comments?",
                        likes=32,
                        published_at="2026-09-22T08:30:00Z",
                    ),
                ],
                generated_ideas=[
                    GeneratedIdea(
                        id="idea_3",
                        title="Architecting Resilient Web Scraping with Async Queues",
                        format="Technical Deep-Dive",
                        target_audience="Senior Engineers",
                        description="Exploration of token bucket rate-limiting and Celery/Redis background task queues for scraping.",
                    ),
                ],
            ),
        ],
    )
