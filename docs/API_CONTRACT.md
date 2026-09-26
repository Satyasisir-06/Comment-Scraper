# Comment Scraper API Contract

**Version:** `1.0.0`  
**Base URL (Local):** `http://localhost:8000`  
**Frontend URL (Local):** `http://localhost:5173`

---

## 1. Overview
This document defines the interface between the **Frontend** (React) and the **Backend** (FastAPI). Both developers must adhere strictly to these schemas to avoid integration friction.

---

## 2. Endpoints

### 2.1 Health Check
Check backend availability and API status.

- **Method:** `GET`
- **Route:** `/api/health`
- **Response `200 OK`:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "llm_connected": true
}
```

---

### 2.2 Analyze Comments
Ingests a source URL (YouTube video or thread), extracts comments, filters questions, clusters them into themes, and generates actionable content/product ideas.

- **Method:** `POST`
- **Route:** `/api/analyze`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "source_type": "youtube",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "max_comments": 200,
  "generate_ideas": true
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `source_type` | `string` | Yes | Enum: `"youtube"` \| `"reddit"` \| `"raw_text"` |
| `url` | `string` | Conditional | Required if `source_type` is `"youtube"` or `"reddit"`. Must be a valid URL. |
| `raw_text` | `string` | Conditional | Optional multiline comment strings if testing manually without URLs. |
| `max_comments` | `integer` | No | Default `100`, Maximum `10000` (or `0` for all comments). |
| `fetch_all` | `boolean` | No | Default `false`. If `true`, scans and extracts all available comments. |
| `generate_ideas`| `boolean` | No | Default `true`. Generates actionable ideas per cluster. |

---

#### Success Response (`200 OK`)
```json
{
  "job_id": "job_98471b0e",
  "timestamp": "2026-09-26T21:30:00Z",
  "metadata": {
    "source_type": "youtube",
    "source_title": "Understanding Modern Web Architecture in 2026",
    "total_comments_scanned": 150,
    "questions_found": 28,
    "themes_count": 3
  },
  "themes": [
    {
      "theme_id": "theme_1",
      "name": "State Management & Performance",
      "summary": "Audience frequently inquires about avoiding re-renders and choosing between local state and external stores.",
      "sentiment": "curious",
      "questions": [
        {
          "id": "q_101",
          "author": "@alex_codes",
          "text": "How do you handle deeply nested state without re-rendering the entire component tree?",
          "likes": 42,
          "published_at": "2026-09-20T10:15:00Z"
        },
        {
          "id": "q_102",
          "author": "@dev_dan",
          "text": "Is Redux still relevant in 2026 or should everyone switch to signals / zustand?",
          "likes": 19,
          "published_at": "2026-09-21T14:22:00Z"
        }
      ],
      "generated_ideas": [
        {
          "id": "idea_1",
          "title": "Deep Dive: Stop Re-rendering in React 19",
          "format": "Tutorial / Video",
          "target_audience": "Intermediate Developers",
          "description": "A focused walkthrough comparing Zustand vs Signals vs React Compiler for zero-friction re-renders."
        },
        {
          "id": "idea_2",
          "title": "State Management Decision Matrix 2026",
          "format": "Infographic / Cheat Sheet",
          "target_audience": "Architects & Team Leads",
          "description": "Visual flow diagram deciding when to use local state, context, or external global stores."
        }
      ]
    },
    {
      "theme_id": "theme_2",
      "name": "Deployment & Production Setup",
      "summary": "Questions regarding Docker configuration, cloud costs, and CI/CD pipelines.",
      "sentiment": "frustrated",
      "questions": [
        {
          "id": "q_201",
          "author": "@cloud_novice",
          "text": "What is the cheapest way to host this stack without getting hit by surprise serverless egress fees?",
          "likes": 35,
          "published_at": "2026-09-22T08:00:00Z"
        }
      ],
      "generated_ideas": [
        {
          "id": "idea_3",
          "title": "Hosting Under $5/Month: Zero-Surprise Cloud Architecture",
          "format": "Case Study",
          "target_audience": "Indie Hackers & Solo Devs",
          "description": "Step-by-step breakdown using lightweight VPS (Hetzner/DigitalOcean) + Coolify vs serverless providers."
        }
      ]
    }
  ],
  "raw_comments": [
    {
      "id": "q_101",
      "author": "@alex_codes",
      "text": "How do you handle deeply nested state without re-rendering the entire component tree?",
      "likes": 42,
      "published_at": "2026-09-20T10:15:00Z"
    }
  ]
}

```

---

#### Error Responses
Backend returns RFC 7807 compliant error format:

- **`400 Bad Request`** (Invalid URL or parameters)
```json
{
  "error": "INVALID_URL",
  "message": "The provided URL is not a valid YouTube video link.",
  "details": null
}
```

- **`422 Unprocessable Entity`** (Comments disabled or video private)
```json
{
  "error": "COMMENTS_DISABLED",
  "message": "This video has comments disabled or requires authentication.",
  "details": null
}
```

- **`500 Internal Server Error`** (LLM or scraper failure)
```json
{
  "error": "SERVER_ERROR",
  "message": "Failed to analyze comments due to upstream API timeout.",
  "details": null
}
```

---

## 3. CORS Requirements for Backend
The backend **must** configure FastAPI CORS middleware to allow requests from the frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
