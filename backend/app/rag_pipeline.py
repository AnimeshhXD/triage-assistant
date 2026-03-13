import time
from typing import Dict, Any, List, Tuple

import chromadb
from chromadb.config import Settings

from .embeddings import embed_query, embed_texts
from .context_pruning import prune_context, ContextChunk
from .protocols_loader import load_protocol_files


class RAGEngine:
    """
    Lightweight in-process RAG engine optimized for sub-500ms latency.
    Indexes protocol snippets in an in-memory Chroma collection.
    """

    def __init__(self) -> None:
        self.client = chromadb.Client(Settings(anonymized_telemetry=False))
        self.collection = self.client.create_collection(
            name="emergency_protocols",
            metadata={"hnsw:space": "cosine"},
        )
        self._index_protocols()

    def _index_protocols(self) -> None:
        protocols = load_protocol_files()
        texts: List[str] = []
        ids: List[str] = []
        metadatas: List[Dict[str, Any]] = []

        for proto_name, text in protocols.items():
            lines = text.splitlines()
            chunk_lines: List[str] = []
            chunk_idx = 0
            for i, line in enumerate(lines):
                if not line.strip():
                    continue
                chunk_lines.append(line)
                if len(chunk_lines) >= 4:
                    chunk_text = "\n".join(chunk_lines)
                    texts.append(chunk_text)
                    ids.append(f"{proto_name}_{chunk_idx}")
                    metadatas.append(
                        {
                            "protocol": proto_name,
                            "chunk_index": chunk_idx,
                            "start_line": i - len(chunk_lines) + 1,
                        }
                    )
                    chunk_idx += 1
                    chunk_lines = []
            if chunk_lines:
                chunk_text = "\n".join(chunk_lines)
                texts.append(chunk_text)
                ids.append(f"{proto_name}_{chunk_idx}")
                metadatas.append(
                    {
                        "protocol": proto_name,
                        "chunk_index": chunk_idx,
                        "start_line": max(0, len(lines) - len(chunk_lines)),
                    }
                )

        if texts:
            embeddings = embed_texts(texts)
            self.collection.add(
                ids=ids,
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas,
            )

    def retrieve(
        self, symptoms: str, top_k: int = 15
    ) -> Tuple[List[ContextChunk], Dict[str, float]]:
        t0 = time.perf_counter()
        query_emb = embed_query(symptoms)

        res = self.collection.query(
            query_embeddings=[query_emb],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
        t1 = time.perf_counter()

        docs = res.get("documents", [[]])[0]
        metas = res.get("metadatas", [[]])[0]
        distances = res.get("distances", [[]])[0]

        sims = [1.0 - float(d) for d in distances]
        raw_chunks = [
            {
                "text": d,
                "source": m.get("protocol", "protocol"),
                "metadata": m,
            }
            for d, m in zip(docs, metas)
        ]

        pruned = prune_context(
            raw_chunks=raw_chunks,
            symptoms=symptoms,
            raw_scores=sims,
            max_chunks=10,
            max_tokens=512,
        )

        latency_ms = (t1 - t0) * 1000.0
        return pruned, {"vector_search_ms": latency_ms}

