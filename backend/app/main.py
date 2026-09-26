"""
Comment Scraper & Idea Catalyst - Backend API Entrypoint
Conforms strictly to contract defined in docs/API_CONTRACT.md
"""
import sys
import os

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.routers import health_router, analyzer_router


app = FastAPI(
    title="Comment Scraper & Idea Catalyst API",
    version="1.0.0",
    description="Extracts questions and generates ideas from audience comments.",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health_router)
app.include_router(analyzer_router)


# Custom Exception Handler for HTTPExceptions matching API_CONTRACT.md
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail,
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "BAD_REQUEST" if exc.status_code == 400 else "HTTP_ERROR",
            "message": str(exc.detail),
            "details": None,
        },
    )


# Custom Exception Handler for Request Validation Errors (422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "VALIDATION_ERROR",
            "message": "Invalid request body or query parameters.",
            "details": {"errors": exc.errors()},
        },
    )


# Custom Exception Handler for Unhandled Server Errors (500)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "SERVER_ERROR",
            "message": "An unexpected internal server error occurred.",
            "details": {"exception": str(exc)},
        },
    )
