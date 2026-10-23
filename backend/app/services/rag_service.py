import os
import glob
from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import httpx
from app.core.config import settings
from app.core.safety import detect_crisis_language, generate_safety_response

class KnowledgeChunk:
    def __init__(self, doc_id: str, title: str, category: str, content: str):
        self.doc_id = doc_id
        self.title = title
        self.category = category
        self.content = content

class RAGService:
    def __init__(self):
        self.chunks: List[KnowledgeChunk] = []
        self.vectorizer: TfidfVectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.tfidf_matrix = None
        self.is_indexed = False
        self.load_and_index_documents()

    def load_and_index_documents(self, kb_dir: str = None, verbose: bool = False):
        """Loads educational documents from knowledge_base directory and builds vector index."""
        if kb_dir is None:
            # Locate knowledge_base directory relative to backend
            base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            kb_dir = os.path.join(base_path, "knowledge_base")
            if not os.path.exists(kb_dir):
                # Fallback to current working directory
                kb_dir = os.path.join(os.getcwd(), "backend", "knowledge_base")

        if not os.path.exists(kb_dir):
            if verbose:
                print(f"[RAG] Warning: Knowledge base directory not found at: {kb_dir}")
            return

        if verbose:
            print(f"[RAG] Scanning knowledge base directory: {kb_dir}")

        text_files = glob.glob(os.path.join(kb_dir, "*.txt")) + glob.glob(os.path.join(kb_dir, "*.md"))
        if verbose:
            print(f"[RAG] Found {len(text_files)} knowledge document files.")

        loaded_chunks = []

        for file_path in text_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Parse simple metadata header
                title = os.path.basename(file_path).replace(".txt", "").replace("_", " ").title()
                category = "Mental Wellness"
                
                lines = content.split("\n")
                body_lines = []
                for line in lines:
                    if line.startswith("Title:"):
                        title = line.replace("Title:", "").strip()
                    elif line.startswith("Category:"):
                        category = line.replace("Category:", "").strip()
                    else:
                        body_lines.append(line)
                
                clean_body = "\n".join(body_lines).strip()

                # Split by sections (##) or paragraphs
                sections = clean_body.split("## ")
                if len(sections) > 1:
                    for s in sections:
                        s_text = s.strip()
                        if not s_text:
                            continue
                        s_title = s_text.split("\n")[0].strip()
                        loaded_chunks.append(KnowledgeChunk(
                            doc_id=os.path.basename(file_path),
                            title=f"{title} - {s_title}",
                            category=category,
                            content=s_text
                        ))
                else:
                    loaded_chunks.append(KnowledgeChunk(
                        doc_id=os.path.basename(file_path),
                        title=title,
                        category=category,
                        content=clean_body
                    ))
            except Exception as e:
                print(f"[RAG] Error loading {file_path}: {e}")

        if loaded_chunks:
            self.chunks = loaded_chunks
            if verbose:
                print(f"[RAG] Generated {len(self.chunks)} semantic chunks. Fitting TF-IDF vector matrix...")
            corpus = [f"{c.title}\n{c.category}\n{c.content}" for c in self.chunks]
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
            self.is_indexed = True
            if verbose:
                print(f"[RAG] Indexing complete: {len(self.chunks)} knowledge chunks vector-indexed.")
        else:
            if verbose:
                print(f"[RAG] Notice: No text content found to index in {kb_dir}")

    def retrieve(self, query: str, top_k: int = 3) -> List[Tuple[KnowledgeChunk, float]]:
        """Retrieves top_k most relevant knowledge chunks using vector similarity."""
        if not self.is_indexed or not self.chunks:
            return []

        try:
            query_vec = self.vectorizer.transform([query])
            sim_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            
            top_indices = np.argsort(sim_scores)[::-1][:top_k]
            results = []
            for idx in top_indices:
                score = float(sim_scores[idx])
                if score > 0.05:  # Relevance threshold
                    results.append((self.chunks[idx], score))
            return results
        except Exception as e:
            print(f"Retrieval error: {e}")
            return []

    async def generate_response(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Executes full RAG pipeline:
        1. Safety crisis check
        2. Knowledge retrieval
        3. Contextual prompt synthesis
        4. Local Ollama LLM execution with graceful fallback
        """
        # Step 1: Crisis safety check
        if detect_crisis_language(user_message):
            return generate_safety_response()

        # Step 2: Retrieve relevant knowledge passages
        retrieved_docs = self.retrieve(user_message, top_k=2)
        source_titles = [doc.title for doc, score in retrieved_docs]

        context_text = ""
        if retrieved_docs:
            context_text = "\n\n".join([
                f"### Resource: {doc.title} (Category: {doc.category})\n{doc.content}"
                for doc, score in retrieved_docs
            ])

        # Step 3: Construct empathetic, bounded system prompt
        system_prompt = (
            "You are MindBridge Assistant, an empathetic, supportive mental wellness AI for university and college students.\n"
            "Guidelines:\n"
            "1. Be warm, validating, active-listening, and non-judgmental.\n"
            "2. Offer practical, grounded psychoeducation and coping techniques (such as box breathing, time blocking, sleep hygiene).\n"
            "3. DO NOT diagnose any psychological or medical condition.\n"
            "4. DO NOT prescribe medication or medical remedies.\n"
            "5. Remind the student that you are an AI support tool and encourage connecting with campus counsellors when helpful.\n"
            "6. Ground your advice in the provided educational reference passages if relevant."
        )

        user_prompt = f"User Student Inquiry: {user_message}\n\n"
        if context_text:
            user_prompt += f"Verified Educational Context:\n{context_text}\n\n"
        user_prompt += "Please provide a compassionate, structured, and helpful response."

        # Step 4: Call Ollama API
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "model": settings.OLLAMA_MODEL,
                    "prompt": f"<|system|>\n{system_prompt}\n<|user|>\n{user_prompt}\n<|assistant|>\n",
                    "stream": False,
                    "options": {
                        "temperature": 0.6,
                        "num_predict": 350
                    }
                }
                res = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "").strip()
                    if response_text:
                        return {
                            "is_crisis": False,
                            "content": response_text,
                            "sources": source_titles
                        }
        except Exception as e:
            print(f"Ollama call notice: {e}")

        # Graceful Fallback if Ollama is unreachable or model is still loading
        fallback_text = (
            "Thank you for sharing what is on your mind. I hear how demanding things are right now. "
        )
        if retrieved_docs:
            top_chunk, _ = retrieved_docs[0]
            fallback_text += (
                f"\n\nFrom our student wellness resources on **{top_chunk.title}**:\n\n"
                f"{top_chunk.content[:450]}...\n\n"
                "Remember to pace yourself, take gentle breaths, and consider scheduling a confidential conversation with a university counsellor if you need extra support."
            )
        else:
            fallback_text += (
                "Taking time to check in with yourself is a vital first step. "
                "Consider taking a moment for slow box breathing (inhale 4 seconds, hold 4 seconds, exhale 4 seconds), "
                "or exploring the Self-Help Resource Library for strategies tailored to your current situation."
            )

        return {
            "is_crisis": False,
            "content": fallback_text,
            "sources": source_titles
        }

rag_service = RAGService()
