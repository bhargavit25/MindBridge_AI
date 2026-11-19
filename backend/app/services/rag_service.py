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
        """Retrieves top_k most relevant knowledge chunks using vector similarity and keyword boosting."""
        if not self.chunks:
            return []

        results = []
        scored_indices = {}

        # 1. TF-IDF Cosine Similarity
        if self.is_indexed and self.tfidf_matrix is not None:
            try:
                query_vec = self.vectorizer.transform([query])
                sim_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
                for idx, score in enumerate(sim_scores):
                    if score > 0.04:
                        scored_indices[idx] = float(score)
            except Exception as e:
                print(f"[RAG] TF-IDF retrieval error: {e}")

        # 2. Keyword fallback / boost for key student wellness terms
        query_lower = query.lower()
        keyword_map = {
            "anx": ["anxiety", "panic", "grounding"],
            "exam": ["anxiety", "stress", "academic"],
            "test": ["anxiety", "stress", "academic"],
            "sleep": ["sleep", "insomnia", "circadian"],
            "tired": ["sleep", "burnout"],
            "burnout": ["burnout", "exhaustion", "stress"],
            "breath": ["breathing", "mindfulness"],
            "relax": ["breathing", "mindfulness", "relax"],
            "lonel": ["loneliness", "social", "connection"],
            "isolat": ["loneliness", "social"],
            "sad": ["burnout", "depression", "coping"],
            "counsel": ["seeking", "help", "counselor"]
        }

        for idx, chunk in enumerate(self.chunks):
            content_lower = f"{chunk.title} {chunk.category} {chunk.content}".lower()
            bonus = 0.0
            for term, tags in keyword_map.items():
                if term in query_lower:
                    if any(tag in content_lower for tag in tags):
                        bonus += 0.25
            if bonus > 0:
                scored_indices[idx] = scored_indices.get(idx, 0.0) + bonus

        # Rank and pick top_k
        if scored_indices:
            sorted_items = sorted(scored_indices.items(), key=lambda x: x[1], reverse=True)[:top_k]
            for idx, score in sorted_items:
                results.append((self.chunks[idx], score))

        return results

    def _synthesize_grounded_response(
        self,
        user_message: str,
        retrieved_docs: List[Tuple[KnowledgeChunk, float]],
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """
        Synthesizes an empathetic, direct, actionable psychoeducational answer
        strictly answering the student's inquiry first, avoiding repetitive counter-questions.
        """
        msg_lower = user_message.lower()

        # Topic 1: Exam Anxiety / Test Tension
        if any(w in msg_lower for w in ["exam", "test", "quiz", "midterm", "finals", "paper"]):
            return (
                "It is completely normal to experience anxiety before exams. Academic pressures "
                "trigger our nervous system's stress response, but you can regain control with these evidence-based steps:\n\n"
                "1. **Break Your Syllabus into Micro-Tasks**: Focus on one chapter or problem at a time. Divide your study session into 25-minute focused blocks (the Pomodoro technique) with 5-minute pauses.\n"
                "2. **Practice Box Breathing (4-4-4-4)**: When you feel your chest tighten, inhale slowly for 4 seconds, hold for 4 seconds, exhale smoothly for 4 seconds, and pause for 4 seconds. Repeat 3 to 4 times to calm acute physiological panic.\n"
                "3. **Cognitive Reframing**: Notice catastrophic thoughts like 'What if I fail?' and gently challenge them with: 'I have prepared for challenging tests before, and one exam does not define my intelligence or future.'\n"
                "4. **Protect Your Sleep**: Prioritize 7 to 8 hours of sleep before exam day. Sleep consolidates neural memories, which is far more effective than late-night cramming.\n\n"
                "If your anxiety becomes overwhelming, consider scheduling a confidential consultation with a campus counsellor."
            )

        # Topic 2: Breathing & Acute Relaxation
        if any(w in msg_lower for w in ["breathing", "breathe", "calm down", "relax", "meditat"]):
            return (
                "Here is an immediate, proven breathing technique to steady your mind right now:\n\n"
                "**The 4x4 Box Breathing Technique:**\n"
                "1. **Inhale** slowly through your nose for 4 counts, feeling your belly expand.\n"
                "2. **Hold** that gentle breath at the top for 4 counts without straining.\n"
                "3. **Exhale** smoothly through your mouth for 4 counts, releasing shoulder tension.\n"
                "4. **Hold empty** for 4 counts before your next breath.\n"
                "Repeat this for 4 complete cycles.\n\n"
                "Additionally, try the **5-4-3-2-1 Sensory Grounding** method: name 5 things you can see, 4 you can physically touch, 3 you can hear, 2 you can smell, and 1 you can taste. This brings your nervous system right back into the present moment."
            )

        # Topic 3: Sleep & Racing Thoughts
        if any(w in msg_lower for w in ["sleep", "insomnia", "night", "awake", "tired", "racing"]):
            return (
                "Trouble sleeping due to a racing mind is a very common challenge among university students. Here are evidence-based sleep hygiene steps you can implement tonight:\n\n"
                "1. **Digital Sunset**: Turn off laptops and phone screens at least 30 to 45 minutes before bed. Blue light suppresses natural melatonin production and keeps your brain in alert mode.\n"
                "2. **The 20-Minute Thought Dump**: Keep a notebook by your bed. Before turning off the light, write down everything you are worried about or need to do tomorrow. Externalizing your thoughts signals to your brain that it is safe to rest.\n"
                "3. **Stimulus Control**: Reserve your bed exclusively for sleep. If you are unable to fall asleep after 20 minutes, get up and read a physical book in dim lighting until drowsiness returns.\n"
                "4. **Consistent Wake-Up Time**: Wake up at the same hour every day, even on weekends, to stabilize your internal circadian rhythm.\n\n"
                "Be patient with yourself as your sleep patterns adjust over a few days."
            )

        # Topic 4: Burnout & Academic Exhaustion
        if any(w in msg_lower for w in ["burnout", "exhausted", "drained", "overwhelm", "too much work", "balance"]):
            return (
                "Feeling burned out is a sign that your mind and body have been operating on overdrive for too long. Let's look at practical ways to restore your energy:\n\n"
                "1. **Establish Non-Negotiable Boundaries**: Set a daily 'study curfew' (e.g., stopping all academic work by 8:00 PM). Continued studying while depleted yields diminishing returns.\n"
                "2. **Active vs. Passive Rest**: Scrolling social media often increases mental fatigue. Choose restorative breaks like a quiet 10-minute walk outside, listening to instrumental music, or gentle stretching.\n"
                "3. **Prioritize Single-Tasking**: Multi-tasking between assignments fragments cognitive bandwidth. Group similar small tasks together and tackle the most important priority first.\n"
                "4. **Permit Yourself to Recharge**: Rest is not a reward you have to earn; it is an essential biological requirement for sustained focus and emotional health.\n\n"
                "If exhaustion persists, connecting with a campus counsellor can help you review your workload and build healthy boundaries."
            )

        # Topic 5: Loneliness & Social Connection
        if any(w in msg_lower for w in ["lonely", "alone", "isolated", "friends", "homesick", "fitting in"]):
            return (
                "Over 60% of university students experience feelings of loneliness or disconnection at some point during their studies. You are not alone in feeling this way.\n\n"
                "Here are gentle ways to cultivate connection:\n"
                "1. **Start Small & Low-Pressure**: You don't need to be the most extroverted person in the room. Say hello to a classmate sitting next to you, or suggest comparing notes after a lecture.\n"
                "2. **Join Shared-Interest Spaces**: Campus clubs, hobby groups, or volunteer activities provide natural, structured environments to meet peers without awkward small talk.\n"
                "3. **Study in Shared Spaces**: Spending time in the university library or student lounge creates a comforting sense of community, even if you are working quietly on your own.\n\n"
                "Campus counsellors also run supportive student discussion groups where you can share experiences in a confidential, welcoming setting."
            )

        # Topic 6: Seeking Help & What to Expect
        if any(w in msg_lower for w in ["counsellor", "counselor", "therapy", "therapist", "appointment", "intake"]):
            return (
                "Reaching out for professional psychological support is a courageous and healthy step. Here is what you can expect when meeting with a campus counsellor:\n\n"
                "1. **Complete Confidentiality**: What you share in a session is strictly private and is never shared with your professors, university administration, or parents.\n"
                "2. **A Non-Judgmental Space**: Counsellors do not evaluate, grade, or lecture you. They listen actively to help you understand your emotional triggers and thought patterns.\n"
                "3. **Collaborative Coping Plans**: You set the goals. Sessions often focus on practical tools like Cognitive Behavioral Therapy (CBT), stress pacing, and mindfulness tailored to your student routine.\n\n"
                "You can book a 45-minute consultation anytime directly through the MindBridge Counsellor Directory."
            )

        # Topic 7: Grounded Synthesis from Retrieved Documents (if any specific RAG match)
        if retrieved_docs:
            top_chunk, score = retrieved_docs[0]
            # Cleanly format content without raw truncation
            lines = [l.strip() for l in top_chunk.content.split("\n") if l.strip() and not l.startswith("#")]
            summary_points = lines[:4]
            points_text = "\n".join([f"- {p}" for p in summary_points])

            return (
                f"Thank you for reaching out. Based on our campus wellness guidance on **{top_chunk.title}**:\n\n"
                f"{points_text}\n\n"
                "Remember to pace yourself today, practice slow diaphragmatic breathing, and take brief restful pauses. "
                "If you would like to explore this further, our campus counsellors are here to support you."
            )

        # General Supportive Fallback
        return (
            "Thank you for checking in with me today. Taking a moment to acknowledge how you are feeling is an important first step.\n\n"
            "Try taking three slow, deliberate breaths right now: inhale for 4 seconds, and exhale gently for 6 seconds to help steady your body's stress response. "
            "Breaking your immediate tasks into smaller, manageable steps can also ease feelings of pressure.\n\n"
            "How can I best support you today—would you like to practice a calming exercise, or explore strategies for your coursework?"
        )

    def generate_response_sync(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Synchronous RAG generation method with optional Ollama and intelligent psychoeducation synthesis."""
        if detect_crisis_language(user_message):
            return generate_safety_response()

        retrieved_docs = self.retrieve(user_message, top_k=2)
        source_titles = [doc.title for doc, score in retrieved_docs]

        context_text = ""
        if retrieved_docs:
            context_text = "\n\n".join([
                f"### Resource: {doc.title} (Category: {doc.category})\n{doc.content}"
                for doc, score in retrieved_docs
            ])

        # Step 4: Try Ollama API (if enabled)
        skip_ollama = os.environ.get("SKIP_OLLAMA_HTTP", "false").lower() in ["1", "true", "yes"]
        if not skip_ollama:
            try:
                system_prompt = (
                    "You are MindBridge Assistant, an empathetic, supportive mental wellness AI for university and college students.\n\n"
                    "CRITICAL RESPONSE GUIDELINES:\n"
                    "1. DIRECT ANSWER FIRST: Always answer the student's question or concern directly, warmly, and practically FIRST before anything else.\n"
                    "2. PRACTICAL COPING STRATEGIES: Provide concrete, student-friendly coping techniques and psychoeducation (e.g., box breathing 4x4, sensory grounding 5-4-3-2-1, Pomodoro intervals, sleep hygiene, gentle cognitive reframing).\n"
                    "3. NO REPETITIVE QUESTIONS: DO NOT respond solely with questions. Answer their questions thoroughly. You may ask AT MOST ONE gentle, supportive follow-up question at the very end of your response, and only if genuinely helpful.\n"
                    "4. GROUND IN CONTEXT: Utilize the verified educational knowledge base passages provided below whenever relevant to enrich your response.\n"
                    "5. CONVERSATION CONTEXT: Maintain awareness of previous messages in this conversation. Do not repeat advice you have already given.\n"
                    "6. SAFETY & MEDICAL BOUNDARIES: You are an educational support AI, not a doctor. Never diagnose psychological or medical conditions, and never prescribe medication. If distress is severe or ongoing, warmly encourage speaking with a licensed campus counsellor."
                )
                user_prompt = f"Student Question: {user_message}\n\n"
                if context_text:
                    user_prompt += f"Verified Educational Context:\n{context_text}\n\n"
                user_prompt += "Please provide a direct, compassionate, structured, and practical response answering the student's question."

                timeout = httpx.Timeout(1.0, connect=0.4)
                with httpx.Client(timeout=timeout) as client:
                    messages = [{"role": "system", "content": system_prompt}]
                    if chat_history:
                        for h in chat_history[-6:]:
                            if h.get("role") in ["user", "assistant"] and h.get("content"):
                                messages.append({"role": h["role"], "content": h["content"]})
                    messages.append({"role": "user", "content": user_prompt})

                    res = client.post(f"{settings.OLLAMA_BASE_URL}/api/chat", json={
                        "model": settings.OLLAMA_MODEL,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": 0.5, "num_predict": 350}
                    })
                    if res.status_code == 200:
                        data = res.json()
                        response_text = data.get("message", {}).get("content", "").strip()
                        if response_text and len(response_text) > 30 and not (response_text.endswith("?") and response_text.count("?") > 2):
                            return {
                                "is_crisis": False,
                                "content": response_text,
                                "sources": source_titles
                            }
            except Exception:
                pass

        # Step 5: Fallback to intelligent psychoeducational synthesis
        content = self._synthesize_grounded_response(user_message, retrieved_docs, chat_history)
        return {
            "is_crisis": False,
            "content": content,
            "sources": source_titles
        }

    async def generate_response(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Async wrapper around generate_response_sync for backward compatibility."""
        return self.generate_response_sync(user_message, chat_history)

rag_service = RAGService()
