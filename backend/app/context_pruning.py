from dataclasses import dataclass
from typing import List, Dict, Any


KEYWORD_BLACKLIST = {
    "dental",
    "orthodontic",
    "tooth",
    "teeth",
    "cosmetic",
    "dermatology",
}


@dataclass
class ContextChunk:
    text: str
    source: str
    score: float
    extra: Dict[str, Any]


def keyword_filter(chunks: List[ContextChunk], symptoms: str) -> List[ContextChunk]:
    """
    Stage 1 — keyword filtering
    Quickly drop chunks that are obviously irrelevant (e.g., dental history).
    """
    filtered: List[ContextChunk] = []
    text_lower = symptoms.lower()

    for c in chunks:
        t = c.text.lower()
        if any(b in t for b in KEYWORD_BLACKLIST):
            continue
        if any(k in t for k in ("cardiac", "stroke", "trauma", "burn", "cpr", "shock")):
            filtered.append(c)
            continue
        for token in text_lower.split():
            if token and token in t:
                filtered.append(c)
                break
    return filtered or chunks


def embedding_similarity_filter(
    chunks: List[ContextChunk],
    raw_scores: List[float],
) -> List[ContextChunk]:
    """
    Stage 2 — embedding similarity search
    We assume raw_scores[i] is the similarity for chunks[i].
    """
    if not chunks:
        return []
    for c, s in zip(chunks, raw_scores):
        c.extra["embedding_score"] = float(s)
    return chunks


def relevance_scoring(
    chunks: List[ContextChunk],
    symptoms: str,
    max_chunks: int = 10,
) -> List[ContextChunk]:
    """
    Stage 3 — relevance scoring
    Combine keyword hits and embedding scores into a final relevance score.
    """
    if not chunks:
        return []

    keywords = {w.lower() for w in symptoms.split() if len(w) > 3}

    scored: List[ContextChunk] = []
    for c in chunks:
        t = c.text.lower()
        kw_hits = sum(1 for k in keywords if k in t)
        kw_score = kw_hits / (len(keywords) + 1e-5)
        embed_score = float(c.extra.get("embedding_score", 0.0))
        final = 0.7 * embed_score + 0.3 * kw_score
        c.score = final
        scored.append(c)

    scored.sort(key=lambda x: x.score, reverse=True)
    return scored[:max_chunks]


def final_token_pruning(
    chunks: List[ContextChunk],
    max_tokens: int = 512,
) -> List[ContextChunk]:
    """
    Stage 4 — final token pruning
    Approximate tokens by word count and trim lowest-scoring chunks.
    """
    if not chunks:
        return []

    approx_tokens = [len(c.text.split()) for c in chunks]
    total = sum(approx_tokens)
    if total <= max_tokens:
        return chunks

    chunks_sorted = sorted(chunks, key=lambda x: x.score, reverse=True)
    kept: List[ContextChunk] = []
    running = 0
    for c in chunks_sorted:
        tokens = len(c.text.split())
        if running + tokens > max_tokens:
            continue
        kept.append(c)
        running += tokens
        if running >= max_tokens:
            break
    return kept or chunks_sorted[:1]


def prune_context(
    raw_chunks: List[Dict[str, Any]],
    symptoms: str,
    raw_scores: List[float],
    max_chunks: int = 10,
    max_tokens: int = 512,
) -> List[ContextChunk]:
    """
    Full multi-stage intelligent context pruning pipeline.
    raw_chunks come from the vector store and contain text & metadata.
    """
    chunks = [
        ContextChunk(
            text=c.get("text", ""),
            source=c.get("source", "protocol"),
            score=0.0,
            extra={"metadata": c.get("metadata", {})},
        )
        for c in raw_chunks
    ]

    stage1 = keyword_filter(chunks, symptoms)
    stage2 = embedding_similarity_filter(stage1, raw_scores[: len(stage1)])
    stage3 = relevance_scoring(stage2, symptoms, max_chunks=max_chunks)
    stage4 = final_token_pruning(stage3, max_tokens=max_tokens)
    return stage4

