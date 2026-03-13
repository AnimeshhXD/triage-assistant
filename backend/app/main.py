import time
from typing import Any, Dict, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .rag_pipeline import RAGEngine
from .triage_engine import triage_patient
from .protocols_loader import list_protocols


class Vitals(BaseModel):
    heart_rate: Optional[float] = None
    blood_pressure: Optional[str] = None
    oxygen: Optional[float] = None


class TriageRequest(BaseModel):
    patient_id: Optional[str] = None
    symptoms: str
    vitals: Optional[Vitals] = None


class VoiceTranscriptRequest(BaseModel):
    transcript: str
    vitals: Optional[Vitals] = None


app = FastAPI(title="Real-Time Emergency Response Triage Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


rag_engine = RAGEngine()


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"status": "running"}


@app.get("/protocols")
def get_protocols() -> Dict[str, Any]:
    return {"protocols": list_protocols()}


@app.post("/triage")
def post_triage(req: TriageRequest) -> Dict[str, Any]:
    start = time.perf_counter()

    vitals = req.vitals.dict() if req.vitals is not None else {}

    evidence_chunks, timing_vs = rag_engine.retrieve(req.symptoms, top_k=15)
    vs_ms = timing_vs["vector_search_ms"]

    reasoning_start = time.perf_counter()
    triage_result = triage_patient(req.symptoms, vitals, evidence_chunks)
    reasoning_ms = (time.perf_counter() - reasoning_start) * 1000.0

    total_ms = (time.perf_counter() - start) * 1000.0

    triage_result["latency"] = {
        "vector_search_ms": vs_ms,
        "reasoning_ms": reasoning_ms,
        "total_ms": total_ms,
    }
    triage_result["patient_id"] = req.patient_id
    triage_result["pruned_evidence_count"] = len(evidence_chunks)

    return triage_result


@app.post("/voice-transcript")
def post_voice_transcript(req: VoiceTranscriptRequest) -> Dict[str, Any]:
    triage_req = TriageRequest(symptoms=req.transcript, vitals=req.vitals)
    return post_triage(triage_req)

