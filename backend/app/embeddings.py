from functools import lru_cache
from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def _load_model() -> SentenceTransformer:
    """
    Load a lightweight MiniLM model once and cache it.
    This is small and fast enough for sub-500ms latency on short inputs.
    """
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def embed_texts(texts: List[str]) -> List[List[float]]:
    """
    Encode a batch of texts into embeddings.
    Returns plain Python lists to be friendly with ChromaDB.
    """
    if not texts:
        return []
    model = _load_model()
    embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    if isinstance(embeddings, np.ndarray):
        return embeddings.astype(np.float32).tolist()
    return np.array(embeddings, dtype=np.float32).tolist()


def embed_query(text: str) -> List[float]:
    return embed_texts([text])[0]

