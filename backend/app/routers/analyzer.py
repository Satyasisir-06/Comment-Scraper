import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    AnalysisMetadata,
    APIErrorDetail,
)
from app.services import fetch_comments, extract_questions, analyze_and_cluster

router = APIRouter(prefix="/api", tags=["Analyzer"])


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    responses={
        400: {"model": APIErrorDetail, "description": "Invalid URL or input parameters"},
        422: {"model": APIErrorDetail, "description": "Comments disabled or private video"},
        500: {"model": APIErrorDetail, "description": "Upstream scraper or server error"},
    },
)
def analyze_comments(request: AnalyzeRequest):
    """
    Ingests source URL or raw text, extracts comments, filters authentic questions,
    clusters them into themes, and generates actionable content/product ideas.
    """
    # 1. Fetch raw comments using Scraper service
    source_title, raw_comments = fetch_comments(
        source_type=request.source_type,
        url=request.url,
        raw_text=request.raw_text,
        max_comments=request.max_comments,
    )

    # 2. Extract authentic viewer questions
    questions = extract_questions(raw_comments, max_questions=50)

    # 3. Perform AI / Heuristic clustering and idea generation
    themes = analyze_and_cluster(
        questions=questions,
        source_title=source_title,
        generate_ideas=request.generate_ideas,
    )

    job_id = f"job_{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now(timezone.utc).isoformat()

    return AnalyzeResponse(
        job_id=job_id,
        timestamp=timestamp,
        metadata=AnalysisMetadata(
            source_type=request.source_type,
            source_title=source_title,
            total_comments_scanned=len(raw_comments),
            questions_found=len(questions),
            themes_count=len(themes),
        ),
        themes=themes,
        raw_comments=raw_comments,
    )

