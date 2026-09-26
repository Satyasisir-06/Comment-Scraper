# Frontend Implementation Guide & Roadmap

**Owner:** Satyasisir (Frontend Lead)  
**Workspace Directory:** `frontend/`  
**Reference Contract:** [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md)

---

## 1. Objectives & User Experience Vision
Build a sleek, responsive, and high-performance web dashboard that allows content creators, researchers, and product builders to paste any YouTube URL (or thread link), inspect the questions asked by audiences, explore automatically clustered themes, and export synthesized content ideas.

---

## 2. Recommended Tech Stack
- **Framework:** React + Vite (Fast HMR, lightweight)
- **Language:** TypeScript (Strict type safety synced with `docs/API_CONTRACT.md`)
- **Styling:** Modern Tailwind CSS or CSS Modules with a dark theme (slate/violet aesthetic)
- **Icons:** `lucide-react`
- **State & Fetching:** React Hooks (`useState`, `useQuery` or custom `useAnalyze` hook)
- **Notifications:** `sonner` or lightweight toast notifications

---

## 3. Component Architecture & File Tree

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Header.tsx              # Brand logo, title, and "Use Mock Mode" toggle
│   │   ├── UrlInputBar.tsx         # Input field, URL validator, options dropdown
│   │   ├── StatusProgress.tsx      # Multi-stage scraping / LLM processing animation
│   │   ├── MetricsOverview.tsx     # Stat counters (Scanned, Questions, Themes, Ideas)
│   │   ├── ThemeExplorer.tsx       # Grid / Accordion list of themes
│   │   ├── ThemeCard.tsx           # Individual theme summary and sentiment badge
│   │   ├── QuestionList.tsx        # Filterable & searchable question list
│   │   ├── QuestionItem.tsx        # Individual question card with author and like count
│   │   ├── IdeaCard.tsx            # Formatted actionable idea card with copy button
│   │   └── ExportModal.tsx         # Export full report to Markdown or JSON
│   ├── mocks/
│   │   └── mockAnalysisData.ts     # Realistic mock payload matching API_CONTRACT.md
│   ├── services/
│   │   └── api.ts                  # Fetch client with auto-fallback to mock mode
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces corresponding to API_CONTRACT.md
│   ├── App.tsx                     # Main layout & analysis state management
│   ├── index.css                   # Core design tokens, gradients, and styling
│   └── main.tsx                    # React DOM root entry
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Unblocking Frontend Development: The Mock Adapter Pattern
You do **not** need to wait for your friend to finish scraping or LLM models. In `src/services/api.ts`, create a toggle:

```typescript
import { mockAnalysisResult } from '../mocks/mockAnalysisData';
import { AnalyzeRequest, AnalyzeResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeComments(req: AnalyzeRequest, useMock = false): Promise<AnalyzeResponse> {
  if (useMock) {
    // Simulate network latency for realistic UX testing
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return mockAnalysisResult;
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
```

---

## 5. Step-by-Step Sprint Plan

### Sprint 1: Scaffolding & Setup (Day 1)
- [ ] Initialize `frontend/` using Vite + React + TypeScript.
- [ ] Setup TypeScript interfaces in `src/types/index.ts` reflecting [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md).
- [ ] Create `src/mocks/mockAnalysisData.ts` with comprehensive sample data.
- [ ] Create basic app shell with dark mode palette (Navbar, container, footer).

### Sprint 2: Ingestion & Live Status (Day 2 - 3)
- [ ] Implement `UrlInputBar.tsx`:
  - Validate YouTube URL with regex (`/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))/`).
  - Add slider for `max_comments` (50 - 500).
  - Add toggle button for **"Mock Mode"** (allows instant demonstration).
- [ ] Implement `StatusProgress.tsx` with animated progress steps:
  1. *Fetching comments...*
  2. *Detecting audience questions...*
  3. *Clustering themes...*
  4. *Synthesizing ideas...*

### Sprint 3: Thematic Dashboard & Questions Explorer (Day 4 - 6)
- [ ] Build `MetricsOverview.tsx` showing 4 metric cards: Total Comments, Questions Extracted, Themes Discovered, Actionable Ideas.
- [ ] Build `ThemeExplorer.tsx`:
  - Visual theme cards with theme title, summary, and sentiment badge.
  - Tabs or accordion to switch between themes.
- [ ] Build `QuestionList.tsx`:
  - Live search input to filter questions by keyword.
  - Sort questions by likes or author.
- [ ] Build `IdeaCard.tsx`:
  - Highlight idea title, format tag (e.g. *Video*, *Newsletter*, *Feature*), target audience, and description.
  - One-click "Copy to Clipboard" with checkmark animation.

### Sprint 4: Export Tools & Live Backend Integration (Day 7 - 8)
- [ ] Build Export feature:
  - Generate clean Markdown report (`# Analysis for [Title]...`).
  - Copy full report or download as `.md` file.
- [ ] Connect live API with your friend's backend running on `http://localhost:8000`.
- [ ] Handle error states: Invalid URL, video without comments, backend offline.

---

## 6. How to Run Locally
```bash
cd frontend
npm install
npm run dev
```
Accessible at: `http://localhost:5173`
