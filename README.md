<div align="center">

# 🚨 Real-Time Emergency Response Triage Assistant

**A rule-based AI triage system for emergency rooms and disaster response — powered by semantic retrieval and pattern-matching clinical logic.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-in--memory-E76F51?style=flat-square)](https://trychroma.com)
[![License](https://img.shields.io/badge/License-Not%20Set-lightgrey?style=flat-square)](#license)

</div>

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [Intelligent Context Pruning](#-intelligent-context-pruning)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Running the Backend](#-running-the-backend)
- [Running the Frontend](#-running-the-frontend)
- [API Endpoints](#-api-endpoints)
- [Example Request](#-example-request)
- [Example Response](#-example-response)
- [Performance Notes](#-performance-notes)
- [Limitations](#-limitations)
- [Future Improvements](#-future-improvements)
- [Contributors](#-contributors)
- [License](#-license)

---

## 📖 Project Description

The **Real-Time Emergency Response Triage Assistant** is a full-stack web application that helps emergency responders quickly assess patient severity and determine the most appropriate clinical action.

The backend combines **semantic vector search over emergency protocols** (using ChromaDB and sentence-transformers) with a **rule-based triage engine** to assign a triage level, recommend a next action, and estimate condition-specific risk probabilities. An **Intelligent Context Pruning** step filters retrieved protocol chunks to the most relevant subset before triage reasoning begins.

The frontend is a React/Vite single-page application with a scrollytelling product-style UI, a live triage demo form, and a visual latency meter that displays the backend's reported timings.

> **Honest scope note:** The current backend does not call any external LLM or generative model. All clinical reasoning is performed by deterministic rule matching. LangChain is listed in `requirements.txt` but is not imported or used in any active backend module.

---

## 🩺 Problem Statement

Emergency triage is a time-critical, high-stakes task. Clinicians must simultaneously assess multiple patients, recall relevant protocols, and make rapid decisions — often with incomplete information and under significant cognitive load.

Key pain points this project targets:

- **Slow protocol lookup** — Manually searching clinical guidelines during an emergency is impractical.
- **Noisy patient context** — Patient histories contain large volumes of irrelevant information that slow down decision-making.
- **Inconsistent prioritisation** — Without decision-support tooling, triage severity can vary between clinicians and shifts.

---

## 💡 Solution Overview

This system provides structured, automated triage recommendations in three steps:

1. **Retrieve** — Embed the patient's symptom description and query a ChromaDB vector store of emergency protocols to find the most semantically relevant protocol chunks.
2. **Prune** — Apply Intelligent Context Pruning to rank and trim the retrieved chunks to a manageable token budget, removing low-relevance results.
3. **Reason** — Run a rule-based triage engine over the symptoms, vitals, and pruned evidence to assign a triage level, next action, risk probabilities, and a confidence score.

The result is a structured JSON response delivered with measured latency that the frontend renders as a triage decision card.

---

## ✨ Key Features

These features are all implemented in the current codebase:

- **Single-patient triage via REST API** — Accepts free-text symptoms and optional vitals; returns a structured triage decision.
- **Voice transcript triage** — A dedicated endpoint accepts speech-to-text strings and routes them through the same pipeline.
- **Semantic protocol retrieval** — Emergency protocols are chunked, embedded with `all-MiniLM-L6-v2`, and indexed in an in-memory ChromaDB collection at startup.
- **Intelligent Context Pruning** — Retrieved chunks are ranked by relevance score and trimmed to a configurable count and approximate token budget before triage reasoning.
- **Rule-based triage engine** — Matches symptom patterns and vital sign thresholds to assign one of four triage levels (`Critical`, `Urgent`, `Moderate`, `Stable`) and compute risk probabilities for four conditions.
- **Explainable evidence** — Each response includes the matched protocol chunks with highlight terms showing which symptom words drove the retrieval.
- **Per-request latency metrics** — The API measures and returns vector search time, reasoning time, and total request time.
- **CORS-enabled API** — Configured to allow all origins for straightforward local and deployed integration.
- **Scrollytelling frontend** — React/Vite SPA with hero, problem, pruning visualisation, pipeline explainer, live demo, latency meter, and disaster simulation sections.
- **Frontend disaster simulation** — A multi-patient queue simulation rendered on the frontend; no batch backend endpoint exists.

---

## 🏛️ System Architecture

The backend processes each triage request through the following pipeline:

```
  ┌────────────────────────────────────────────────────────────────────┐
  │                   TRIAGE REQUEST PIPELINE                          │
  └────────────────────────────────────────────────────────────────────┘

  HTTP POST /triage
        │
        ▼
  ┌─────────────┐     Pydantic validation
  │  FastAPI    │◀────(symptoms, vitals, patient_id)
  │  main.py    │
  └──────┬──────┘
         │
         ▼
  ┌──────────────────────────────────────┐
  │         RAGEngine.retrieve()          │
  │                                      │
  │  1. embed_query(symptoms)            │  ← sentence-transformers
  │     all-MiniLM-L6-v2                 │    (cached singleton)
  │                                      │
  │  2. ChromaDB.query(top_k=15)         │  ← in-memory collection
  │     → raw context chunks             │    indexed at startup
  │                                      │
  │  3. context_pruning.prune_context()  │  ← rank by similarity score
  │     → ContextChunk list              │    trim to max count + tokens
  └──────────────────┬───────────────────┘
                     │  pruned evidence
                     ▼
  ┌──────────────────────────────────────┐
  │       triage_engine.triage_patient() │
  │                                      │
  │  _basic_rules(symptoms, vitals)      │  ← pattern matching
  │  → triage_level, next_action,        │    + vitals thresholds
  │    confidence, reasoning,            │
  │    RiskProfile                       │
  │                                      │
  │  explainable_from_evidence(chunks)   │  ← maps chunks → evidence
  │  → highlight_terms per chunk         │    with matched terms
  └──────────────────┬───────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────┐
  │          JSON Response               │
  │  triage_level, next_action,          │
  │  confidence, reasoning, evidence,    │
  │  risk_profile, latency, patient_id,  │
  │  pruned_evidence_count               │
  └──────────────────────────────────────┘
```

### Startup Sequence

When the backend starts, `RAGEngine` runs the following once:

1. `protocols_loader.load_protocol_files()` reads all `*.txt` files from `data/emergency_protocols/`.
2. Each protocol is split into line-based chunks with metadata (protocol name, chunk index, start line).
3. All chunks are embedded via `embed_texts()` and added to a ChromaDB in-memory collection named `"emergency_protocols"`.

This collection persists only for the lifetime of the process. There is no on-disk or remote vector store configured.

---

## ✂️ Intelligent Context Pruning

After ChromaDB returns the top-K matching protocol chunks, a custom pruning step in `app/context_pruning.py` refines the result set before it reaches the triage engine.

**What it does:**

1. Attaches the similarity score (derived from ChromaDB distances) to each retrieved chunk.
2. Ranks chunks by their relevance score in descending order.
3. Filters the ranked list to a maximum chunk count.
4. Applies an approximate token budget — chunks are included until the estimated token count would be exceeded.

**What it does not do (current implementation):**

- It does not re-embed or re-score chunks against the query at pruning time.
- It does not use cosine similarity computed independently; it uses the scores already returned by ChromaDB.

The practical effect is that only the highest-scoring, most semantically relevant protocol segments are passed to the rule-based engine, reducing the noise in the evidence payload and keeping the `pruned_evidence_count` in the response low and focused.

---

## 🛠️ Tech Stack

### Backend

| Component | Technology | Notes |
|---|---|---|
| Web framework | FastAPI | Async, Pydantic-validated |
| ASGI server | Uvicorn | Used in development and production via `start.sh` |
| Data validation | Pydantic | Request and response models |
| Vector store | ChromaDB | In-memory only; no persistence |
| Embedding model | `sentence-transformers/all-MiniLM-L6-v2` | Cached singleton via `app/embeddings.py` |
| Numerical ops | NumPy | Similarity score computation |
| LLM / generative AI | **Not implemented** | LangChain is in `requirements.txt` but not used |

### Frontend

| Component | Technology |
|---|---|
| UI framework | React 18 |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Component animation | Framer Motion |
| Scroll animations | GSAP + ScrollTrigger |

### Deployment

| Target | Platform |
|---|---|
| Backend | Render (Web Service) — configured via `backend/start.sh` |
| Frontend | Any static host (Render Static Site, Netlify, Vercel, etc.) |

---

## 📁 Project Structure

```
triage-assistant/
│
├── backend/
│   ├── README.md
│   ├── requirements.txt           # Python dependencies
│   ├── start.sh                   # Render deployment start command
│   └── app/
│       ├── main.py                # FastAPI app, CORS, endpoints
│       ├── rag_pipeline.py        # RAGEngine: retrieval + pruning orchestration
│       ├── embeddings.py          # Sentence-transformer singleton + embed helpers
│       ├── context_pruning.py     # Chunk ranking and token-budget trimming
│       ├── triage_engine.py       # Rule-based triage logic + risk scoring
│       ├── protocols_loader.py    # Reads .txt protocol files from disk
│       └── requirements.txt       # Secondary requirements file (within app/)
│
├── data/
│   └── emergency_protocols/       # Protocol corpus (loaded at startup)
│       ├── cardiac_protocol.txt
│       ├── stroke_protocol.txt
│       ├── trauma_protocol.txt
│       ├── burn_protocol.txt
│       └── cpr_protocol.txt
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.mts
    ├── tailwind.config.cjs
    ├── postcss.config.cjs
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles/
        │   └── global.css
        ├── pages/
        │   └── Home.jsx           # Composes all sections
        └── components/
            ├── HeroSection.jsx
            ├── ProblemSection.jsx
            ├── PruningVisualization.jsx
            ├── PipelineSection.jsx
            ├── TriageDemo.jsx         # POSTs to /triage, renders result
            ├── LatencyMeter.jsx       # Displays latency from backend response
            └── DisasterSimulation.jsx # Frontend-only multi-patient simulation
```

---

## 🚀 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Clone the repository

```bash
git clone https://github.com/your-username/emergency-triage-assistant.git
cd emergency-triage-assistant
```

---

## 🖥️ Running the Backend

### 1. Create and activate a virtual environment

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # macOS/Linux
.venv\Scripts\activate         # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

> **Note:** The first run will download the `all-MiniLM-L6-v2` model from Hugging Face (~90 MB). Subsequent starts use the local cache.

### 3. Verify protocol files are in place

The backend expects protocol `.txt` files at `../data/emergency_protocols/` relative to the `backend/` directory. The five protocol files (`cardiac_protocol.txt`, `stroke_protocol.txt`, `trauma_protocol.txt`, `burn_protocol.txt`, `cpr_protocol.txt`) are included in the repository and require no additional setup.

### 4. Start the development server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

- **Health check:** `GET http://localhost:8000/health`
- **Interactive API docs (Swagger UI):** `http://localhost:8000/docs`
- **Alternative docs (ReDoc):** `http://localhost:8000/redoc`

> On startup you will see the RAGEngine indexing all protocol chunks into the in-memory ChromaDB collection. This takes a few seconds on first run.

---

## 🌐 Running the Frontend

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Vite will start at `http://localhost:5173` by default.

> The `TriageDemo` component is hard-coded to call `http://localhost:8000/triage`. Ensure the backend is running before submitting a triage request from the UI.

### 3. Production build

```bash
npm run build
```

The compiled output is written to `frontend/dist/`. Deploy this folder to any static hosting provider.

> **For production deployments:** Update the API base URL in `TriageDemo.jsx` from `http://localhost:8000/triage` to your deployed backend endpoint before building.

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check — confirms the backend is running |
| `GET` | `/protocols` | Returns a list of all indexed protocol names |
| `POST` | `/triage` | Triage a patient from free-text symptoms + optional vitals |
| `POST` | `/voice-transcript` | Triage from a speech transcript string + optional vitals |

### Request Schemas

**`Vitals` object (optional on all triage endpoints)**

| Field | Type | Required | Description |
|---|---|---|---|
| `heart_rate` | float | No | Heart rate in bpm |
| `blood_pressure` | string | No | e.g. `"150/90"` |
| `oxygen` | float | No | Oxygen saturation percentage |

**`POST /triage` — `TriageRequest`**

| Field | Type | Required | Description |
|---|---|---|---|
| `patient_id` | string | No | Optional identifier echoed back in the response |
| `symptoms` | string | **Yes** | Free-text symptom description |
| `vitals` | `Vitals` | No | Optional vital signs object |

**`POST /voice-transcript` — `VoiceTranscriptRequest`**

| Field | Type | Required | Description |
|---|---|---|---|
| `transcript` | string | **Yes** | Speech-to-text transcript used as the symptom input |
| `vitals` | `Vitals` | No | Optional vital signs object |

### Response Schema (both triage endpoints)

| Field | Type | Description |
|---|---|---|
| `triage_level` | string | `"Critical"`, `"Urgent"`, `"Moderate"`, or `"Stable"` |
| `next_action` | string | Recommended immediate clinical action |
| `confidence` | float | Rule engine confidence score (0.0–1.0) |
| `reasoning` | string | Concatenated text explaining the decision |
| `evidence` | array | Pruned protocol chunks that matched — see below |
| `risk_profile` | object | Estimated probabilities for four conditions — see below |
| `latency` | object | Measured timings — see below |
| `patient_id` | string \| null | Echo of the request `patient_id` |
| `pruned_evidence_count` | int | Number of evidence chunks after pruning |

**`evidence` item fields**

| Field | Type | Description |
|---|---|---|
| `protocol` | string | Protocol name (e.g. `"cardiac_protocol"`) |
| `score` | float | Combined relevance score from retrieval + pruning |
| `text` | string | The protocol chunk text |
| `highlight_terms` | array of strings | Symptom words that matched this chunk |
| `metadata` | object | `protocol`, `chunk_index`, `start_line` |

**`risk_profile` fields**

| Field | Type | Description |
|---|---|---|
| `heart_attack` | float | Estimated probability (0.0–1.0) |
| `stroke` | float | Estimated probability (0.0–1.0) |
| `internal_bleeding` | float | Estimated probability (0.0–1.0) |
| `shock` | float | Estimated probability (0.0–1.0) |

**`latency` fields**

| Field | Type | Description |
|---|---|---|
| `vector_search_ms` | float | Time for ChromaDB retrieval + context pruning |
| `reasoning_ms` | float | Time for rule-based triage computation |
| `total_ms` | float | Total measured time within the endpoint handler |

---

## 📨 Example Request

**`POST /triage`**

```json
{
  "patient_id": "12345",
  "symptoms": "Patient has chest pain, sweating, shortness of breath.",
  "vitals": {
    "heart_rate": 110,
    "blood_pressure": "150/90",
    "oxygen": 92
  }
}
```

---

## 📬 Example Response

```json
{
  "triage_level": "Critical",
  "next_action": "Activate cardiac protocol, perform ECG immediately, give aspirin if not contraindicated, and prepare for possible PCI.",
  "confidence": 0.9,
  "reasoning": "Chest pain with dyspnea and diaphoresis strongly suggests acute coronary syndrome.",
  "evidence": [
    {
      "protocol": "cardiac_protocol",
      "score": 0.87,
      "text": "CARDIAC EMERGENCY PROTOCOL\n\nIndications:\n- Chest pain\n- Shortness of breath\n- Sweating or diaphoresis\n...",
      "highlight_terms": ["chest", "pain", "shortness", "breath"],
      "metadata": {
        "protocol": "cardiac_protocol",
        "chunk_index": 0,
        "start_line": 0
      }
    }
  ],
  "risk_profile": {
    "heart_attack": 0.95,
    "stroke": 0.1,
    "internal_bleeding": 0.05,
    "shock": 0.25
  },
  "latency": {
    "vector_search_ms": 120.3,
    "reasoning_ms": 2.5,
    "total_ms": 145.8
  },
  "patient_id": "12345",
  "pruned_evidence_count": 5
}
```

> Exact field values will vary based on runtime, hardware, symptom input, and the current protocol corpus. The above is illustrative of the response schema.

---

## ⚡ Performance Notes

The following observations are based on what is measurable from the current codebase, not benchmarked guarantees:

- **Rule-based reasoning is fast** — The `triage_engine` operates on pure Python pattern matching. The `reasoning_ms` field in the example response above (2.5ms) is representative of how lightweight this step is.
- **Vector search dominates latency** — ChromaDB query time and the subsequent pruning step account for the majority of `total_ms`. This scales with the size of the protocol corpus.
- **Embedding model load time** — `all-MiniLM-L6-v2` is loaded once at startup and cached as a singleton. Per-request embedding latency is typically low, but the initial server startup is slower as a result.
- **In-memory store** — All protocol vectors live in RAM. There is no disk I/O at query time, which keeps retrieval fast for the current corpus size (5 protocol files).
- **No LLM call** — Because there is no generative model in the pipeline, there is no network round-trip to an external API. This is the primary reason the system can respond in under 500ms on typical hardware.

---

## ⚠️ Limitations

These are confirmed gaps in the current implementation:

| Area | Status |
|---|---|
| LLM / generative reasoning | **Not implemented.** All triage logic is rule-based. LangChain is in `requirements.txt` but not used. |
| Batch / disaster-mode endpoint | **Not implemented.** The disaster simulation is frontend-only. |
| Persistent vector store | **Not implemented.** ChromaDB runs in-memory and is rebuilt on every server restart. |
| Authentication & authorisation | **Not implemented.** The API is fully open. |
| Session or patient state | **Not implemented.** Each request is stateless. |
| Environment variable configuration | **Not implemented.** Paths, model names, and thresholds are not parameterised via `.env`. |
| Response model validation | **Partial.** Request models are Pydantic-validated; the response is returned as a plain dict without a declared Pydantic response model. |
| HIPAA / clinical compliance | **Not applicable in current form.** This is a hackathon prototype, not a certified clinical tool. |

---

## 🔭 Future Improvements

- **LLM integration** — Replace or augment the rule-based engine with a generative model (e.g. via LangChain, which is already in the dependency list) to handle atypical presentations and produce more nuanced reasoning.
- **Persistent vector store** — Configure ChromaDB with a persistent directory, or migrate to a managed vector database, so the index survives server restarts.
- **Batch triage endpoint** — Implement a `POST /triage/batch` endpoint to support the disaster-mode multi-patient scenario that currently exists only in the frontend.
- **Environment variable configuration** — Parameterise model names, data paths, pruning thresholds, and CORS settings via environment variables and a `.env` file.
- **Pydantic response models** — Define explicit Pydantic response schemas to enforce output contracts and improve API documentation.
- **Expanded protocol corpus** — Add paediatric, obstetric, toxicology, and mental health crisis protocols to improve coverage.
- **Voice input in browser** — Wire the Web Speech API directly in the frontend and route the transcript to `/voice-transcript`, enabling a fully voice-driven demo.
- **Authentication layer** — Add API key or OAuth2 authentication before any non-local deployment.
- **Test coverage** — Add unit tests for `context_pruning.py`, `triage_engine.py`, and the API endpoints.
- **Production deployment hardening** — Add request rate limiting, logging, error monitoring, and a health-check endpoint that verifies the vector index is loaded.

---

## 👥 Contributors

| Name | Role | GitHub |
|---|---|---|
| Animesh | Full-Stack & AI Lead | [@AnimeshhXD](https://github.com/AnimeshhXD) |
| Utkarsh | Backend & RAG Pipeline | [@Utkarsh](https://github.com/utkarpatil) |
| Vedant | Frontend & UI/UX | [@Veant](https://github.com/LunaticPoop) |

---

## 📄 License

**No license file is currently present in this repository.**

Until a `LICENSE` file is added, standard copyright law applies — the code is not freely reusable, modifiable, or distributable by others. If you intend this project to be open source, add an appropriate license (e.g. [MIT](https://choosealicense.com/licenses/mit/), [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)) and update this section.

---

<div align="center">

*Built as a hackathon prototype. Not intended for clinical use.*

</div>
