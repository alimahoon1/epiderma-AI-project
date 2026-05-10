from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from pathlib import Path

class RAGEngine:
    def __init__(self, knowledge_path=None):
        base = Path(__file__).resolve().parent

        if knowledge_path is None:
            knowledge_path = base / "rag_knowledge.txt"

        # Load embedding model locally
        self.model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

        with open(knowledge_path, "r", encoding="utf-8") as f:
            self.documents = f.read().split("\n\n")

        # Generate embeddings locally
        self.embeddings = self.model.encode(
            self.documents,
            convert_to_numpy=True
        ).astype("float32")

        # Build FAISS index
        self.index = faiss.IndexFlatL2(
            self.embeddings.shape[1]
        )

        self.index.add(self.embeddings)

    def query(self, user_text, top_k=2):
        q_emb = self.model.encode(
            [user_text],
            convert_to_numpy=True
        ).astype("float32")

        _, idx = self.index.search(q_emb, top_k)

        return "\n".join(
            self.documents[i] for i in idx[0]
        )