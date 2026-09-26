# Backend Implementation Guide & Roadmap

**Owner:** Collaborator / Friend (Backend Lead)  
**Workspace Directory:** `backend/`  
**Reference Contract:** [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md)

---

## 1. Objectives & Pipeline Architecture
Build a fast, robust REST API that receives a YouTube video URL, fetches comments, filters real audience questions, clusters them into meaningful themes, and invokes an LLM to synthesize high-impact content/product ideas.

```
Incoming URL (POST /api/analyze)
          │
          ▼
1. Scraper Service (app/services/scraper.py)
   Extract raw comments: text, author, likes, published_at
          │
          ▼
2. Question Extractor (app/services/question_extractor.py)
   Regex / Heuristics / Fast NLP filter for authentic questions
          │
          ▼
3. Thematic Clustering & Idea Generator (app/services/ai_pipeline.py)
   LLM (e.g. Gemini 1.5 Flash or OpenAI) with structured Pydantic schema
          │
          ▼
Formatted JSON matching docs/API_CONTRACT.md
```

---

## 2. Recommended Tech Stack
- **Framework:** FastAPI (High performance, automatic OpenAPI documentation at `/docs`)
- **Server:** Uvicorn (ASGI server)
- **Data Validation:** Pydantic v2
- **Scraping Engine:**
  - Option A (No API Key Required): `youtube-comment-downloader` (Lightweight open-source scraper)
  - Option B (Official): Google YouTube Data API v3 (`google-api-python-client`)
- **AI / LLM:** Google Gemini 1.5 Flash (via `google-genai` SDK - fast, generous free tier) or OpenAI (`gpt-4o-mini`)
- **Testing:** `pytest` + `httpx`

---

## 3. Directory Layout

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app instance, CORS middleware, route registration
│   ├── config.py                   # Pydantic Settings (API keys, ports)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── analysis.py             # Pydantic models matching docs/API_CONTRACT.md
│   ├── services/
│   │   ├── __init__.py
│   │   ├── scraper.py              # YouTube comment fetching logic
│   │   ├── question_extractor.py   # Heuristic & question detection logic
│   │   └── ai_pipeline.py          # Gemini / OpenAI clustering & idea generation
│   └── routers/
│       ├── __init__.py
│       ├── health.py               # GET /api/health
│       └── analyzer.py             # POST /api/analyze
├── tests/
│   ├── __init__.py
│   ├── test_scraper.py
│   ├── test_question_extractor.py
│   └── test_api.py
├── .env.example                    # Template for GEMINI_API_KEY / YOUTUBE_API_KEY
├── requirements.txt
└── README.md
```

---

## 4. Key Implementation Details

### 4.1 CORS Middleware (Required for Frontend Communication)
In `app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Comment Scraper API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4.2 Question Extraction Logic
Filter raw comments before passing to the LLM to save tokens and improve quality:
- Check for interrogative punctuation (`?`, `¿`).
- Check for interrogative words: `who`, `what`, `where`, `when`, `why`, `how`, `can you`, `could`, `is it possible`, `any idea`, `difference between`.
- Strip out short spam or rhetorical praise (e.g. *"Great video! Can I say how awesome this is?"*).

### 4.3 Structured Output with LLM
Use Gemini 1.5 Flash or GPT-4o-mini with structured outputs so the LLM responds in the exact Pydantic schema required by `docs/API_CONTRACT.md`:

```python
from pydantic import BaseModel, Field
from typing import List

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
    question_ids: List[str]
    generated_ideas: List[GeneratedIdea]

class AnalysisAIOutput(BaseModel):
    themes: List[ThemeCluster]
```

---

## 5. Step-by-Step Sprint Plan

### Sprint 1: FastAPI Foundation (Day 1)
- [ ] Create virtual environment (`python -m venv .venv`).
- [ ] Install dependencies: `fastapi`, `uvicorn`, `pydantic`, `python-dotenv`.
- [ ] Implement `GET /api/health` returning `{"status": "healthy", "version": "1.0.0"}`.
- [ ] Implement stubbed `POST /api/analyze` returning dummy data matching [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md).
- [ ] Verify CORS allows requests from `http://localhost:5173`.

### Sprint 2: YouTube Scraper Service (Day 2 - 3)
- [ ] Parse and validate YouTube URL to extract the video ID (`v` parameter).
- [ ] Implement scraper module in `app/services/scraper.py`:
  - Fetch up to `max_comments` comments with fields: `id`, `author`, `text`, `likes`, `published_at`.
  - Handle error cases: invalid video ID, disabled comments, private videos.

### Sprint 3: Question Extractor Filter (Day 4)
- [ ] Implement `app/services/question_extractor.py`:
  - Input: List of raw comment dicts.
  - Output: Filtered list of genuine questions.
  - Write unit tests in `tests/test_question_extractor.py` covering edge cases.

### Sprint 4: LLM Clustering & Idea Generation (Day 5 - 7)
- [ ] Setup API client in `app/services/ai_pipeline.py` (e.g. Google Gemini 1.5 Flash).
- [ ] Construct system prompt:
  - *"You are an audience insight analyst. Given a list of questions asked by viewers, group them into 3-5 distinct thematic clusters and propose 2 actionable content or product ideas per theme."*
- [ ] Enforce structured JSON / Pydantic schema response.
- [ ] Assemble full response payload conforming to [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md).

### Sprint 5: Integration & Edge Cases (Day 8)
- [ ] Test end-to-end flow with real YouTube videos.
- [ ] Measure latency and add caching (e.g., in-memory or Redis) if needed.
- [ ] Verify frontend dashboard displays live backend data seamlessly.

---

## 6. How to Run Locally

```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive API docs available at: `http://localhost:8000/docs`
