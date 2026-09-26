# 💬 Comment Scraper & Idea Catalyst

An AI-powered tool that ingests video comments, extracts genuine audience questions, clusters them into thematic groups, and synthesizes high-impact content and product ideas.

---

## 👥 Team & Roles

| Member | Focus | Workspace | Guide |
| :--- | :--- | :--- | :--- |
| **Satyasisir** | Frontend (React / Vite / TypeScript) | [`frontend/`](./frontend/) | [Frontend Roadmap](./docs/FRONTEND_PLAN.md) |
| **Collaborator** | Backend (FastAPI / Python / AI) | [`backend/`](./backend/) | [Backend Roadmap](./docs/BACKEND_PLAN.md) |

---

## 🏗️ Architecture & Collaboration

```
[Web Browser] 
      │ 
      ▼
[Frontend: React + Vite + TypeScript] (Port 5173)
      │ 
      ▼ (REST JSON API)
[Backend: FastAPI + Python] (Port 8000)
      ├── 1. Scraper Service (YouTube / Reddit)
      ├── 2. Question Detection Filter (NLP / Regex)
      ├── 3. Thematic Clustering (LLM / Embeddings)
      └── 4. Idea Synthesis (Gemini / Claude / OpenAI)
```

Both developers share a single contract:
👉 **[Read the API Contract (docs/API_CONTRACT.md)](./docs/API_CONTRACT.md)**

---

## 📁 Repository Structure

```
Comment-Scraper/
├── .gitignore               # Covers Python (.venv, cache) and Node (node_modules, dist)
├── README.md                # Project documentation and team workflow
├── docs/
│   ├── API_CONTRACT.md      # Shared JSON endpoints and mock data
│   ├── FRONTEND_PLAN.md     # Frontend sprint breakdown & architecture
│   └── BACKEND_PLAN.md      # Backend sprint breakdown & AI pipeline
├── frontend/                # React / Vite / TypeScript client
│   └── README.md
└── backend/                 # FastAPI / Python backend
    └── README.md
```

---

## 🚀 Quick Start Guide

### 1. Frontend Development (Client)
```bash
cd frontend
npm install
npm run dev
```
Runs at: **`http://localhost:5173`**  
*Tip: Toggle "Mock Mode" in the UI to develop and test immediately without running the backend.*

### 2. Backend Development (Server)
```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Mac / Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API runs at: **`http://localhost:8000`**  
Interactive Swagger Docs at: **`http://localhost:8000/docs`**

---

## 🌿 Git Collaboration Rules

To keep the codebase clean and avoid merge conflicts:

1. **Never commit directly to `main`**.
2. **Branching Convention:**
   - Frontend work: `git checkout -b frontend/<feature-name>` (e.g., `frontend/theme-cards`)
   - Backend work: `git checkout -b backend/<feature-name>` (e.g., `backend/youtube-scraper`)
3. **Merging:**
   - Push your branch to GitHub (`git push -u origin frontend/<feature-name>`).
   - Open a Pull Request (PR) against `main`.
   - Your friend reviews and approves before merging.
4. **Keeping Up-to-Date:**
   ```bash
   git checkout main
   git pull origin main
   ```
