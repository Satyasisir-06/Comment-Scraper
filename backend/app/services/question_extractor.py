import re
from typing import List, Dict, Any
from app.schemas import QuestionItem

# Keywords indicating genuine questions
QUESTION_STARTERS = [
    r"\bhow\b",
    r"\bwhat\b",
    r"\bwhy\b",
    r"\bwhere\b",
    r"\bwhen\b",
    r"\bwho\b",
    r"\bwhich\b",
    r"\bcan\s+(?:you|i|we|anyone)\b",
    r"\bcould\s+(?:you|i|we|anyone)\b",
    r"\bwould\s+(?:you|i|we|anyone)\b",
    r"\bshould\s+(?:you|i|we|anyone)\b",
    r"\bis\s+it\b",
    r"\bis\s+there\b",
    r"\bare\s+there\b",
    r"\bdoes\s+anyone\b",
    r"\bdo\s+you\b",
    r"\bany\s+idea\b",
    r"\bdifference\s+between\b",
    r"\banyone\s+know\b",
    r"\bis\s+it\s+possible\b",
    r"\bhow\s+to\b",
]

# Regex patterns indicating rhetorical praise or non-genuine questions
RHETORICAL_PRAISE_PATTERNS = [
    r"^great\s+video",
    r"^awesome\s+video",
    r"^love\s+this",
    r"^can\s+i\s+just\s+say\s+how\s+(?:amazing|great|awesome|good)",
    r"can\'t\s+wait\s+for",
    r"best\s+video\s+ever",
    r"subscribed\!",
]


def is_genuine_question(text: str) -> bool:
    """
    Determines whether a comment text is an authentic, informative question.
    """
    if not text or len(text.strip()) < 8:
        return False

    clean_text = text.strip()
    text_lower = clean_text.lower()

    # Filter out pure praise or hype phrases
    for praise_pat in RHETORICAL_PRAISE_PATTERNS:
        if re.search(praise_pat, text_lower):
            # Check if there is still a genuine follow-up question
            if "?" not in clean_text:
                return False

    # Condition 1: Direct question mark ?
    has_question_mark = "?" in clean_text or "¿" in clean_text

    # Condition 2: Interrogative starters
    has_starter = any(
        re.search(pattern, text_lower) for pattern in QUESTION_STARTERS
    )

    if has_question_mark or has_starter:
        # Exclude very short noisy comments like "Why?" or "How?"
        words = clean_text.split()
        if len(words) >= 3:
            return True

    return False


def extract_questions(
    raw_comments: List[Dict[str, Any]],
    max_questions: int = 50,
) -> List[QuestionItem]:
    """
    Processes raw comments and filters out authentic questions,
    returning formatted QuestionItem schemas.
    """
    filtered_questions: List[QuestionItem] = []

    for idx, c in enumerate(raw_comments):
        text = c.get("text", "")
        if is_genuine_question(text):
            q_id = c.get("id") or f"q_{idx+1}"
            author = c.get("author") or "@viewer"
            likes = int(c.get("likes") or 0)
            pub_at = c.get("published_at") or ""

            filtered_questions.append(
                QuestionItem(
                    id=q_id,
                    author=author,
                    text=text.strip(),
                    likes=likes,
                    published_at=pub_at,
                )
            )

    # Sort questions by likes descending to surface high-value audience interest first
    filtered_questions.sort(key=lambda q: q.likes, reverse=True)

    return filtered_questions[:max_questions]
