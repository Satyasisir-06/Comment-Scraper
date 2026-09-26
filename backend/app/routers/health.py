from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
def health_check():
    """
    Health check endpoint returning system status and LLM connectivity status.
    """
    llm_active = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 0)
    return {
        "status": "healthy",
        "version": "1.0.0",
        "llm_connected": llm_active,
    }
