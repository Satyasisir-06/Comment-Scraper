# ⚙️ Backend Service (FastAPI)

FastAPI service for comment scraping, question extraction, and thematic idea generation.

---

## 📖 Backend Roadmap
Full roadmap and implementation guide:  
👉 **[Read docs/BACKEND_PLAN.md](../docs/BACKEND_PLAN.md)**

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
   # Add your GEMINI_API_KEY or YOUTUBE_API_KEY in .env
   ```

4. **Run development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. **Test endpoints:**
   - Health check: `http://localhost:8000/api/health`
   - Interactive docs: `http://localhost:8000/docs`
