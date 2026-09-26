# ⚙️ Backend Service (FastAPI)

FastAPI service for comment scraping, question extraction, thematic clustering, and AI idea generation.

---

## 📖 Backend Roadmap & API Contract
- Full roadmap & implementation guide: 👉 **[`docs/BACKEND_PLAN.md`](../docs/BACKEND_PLAN.md)**
- API contract specification: 👉 **[`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md)**

---

## 🚀 Getting Started

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Set your GEMINI_API_KEY (Google AI Studio) or YOUTUBE_API_KEY in .env
   ```

4. **Run development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. **Run tests:**
   ```bash
   pytest
   ```

6. **Endpoints & Interactive OpenAPI Docs:**
   - Health check: `http://localhost:8000/api/health`
   - Analyze comments: `POST http://localhost:8000/api/analyze`
   - Interactive Swagger docs: `http://localhost:8000/docs`
