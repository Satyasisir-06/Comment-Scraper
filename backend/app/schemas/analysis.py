from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class AnalyzeRequest(BaseModel):
    source_type: str = Field(
        default="youtube",
        description="Source format: 'youtube', 'reddit', or 'raw_text'",
    )
    url: Optional[str] = Field(
        default=None,
        description="Source URL (required for youtube or reddit)",
    )
    raw_text: Optional[str] = Field(
        default=None,
        description="Raw comment strings if testing manually without URL",
    )
    max_comments: int = Field(
        default=100,
        ge=0,
        le=10000,
        description="Maximum number of comments to scan (1 to 10000, or 0 for all comments)",
    )
    fetch_all: bool = Field(
        default=False,
        description="Whether to fetch all available comments (overrides max_comments)",
    )
    generate_ideas: bool = Field(
        default=True,
        description="Whether to trigger LLM idea generation per cluster",
    )


class QuestionItem(BaseModel):
    id: str
    author: str
    text: str
    likes: int = 0
    published_at: str


# Alias for raw comments
CommentItem = QuestionItem


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
    sentiment: str = "curious"
    questions: List[QuestionItem] = Field(default_factory=list)
    generated_ideas: List[GeneratedIdea] = Field(default_factory=list)


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
    raw_comments: Optional[List[CommentItem]] = Field(default_factory=list)


class APIErrorDetail(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None

