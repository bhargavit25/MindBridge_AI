import sys
import os

# Ensure UTF-8 output in Windows PowerShell
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("[RAG] Initializing MindBridge AI Document Ingestion Pipeline...")
print("[RAG] Loading machine learning libraries (NumPy, Scikit-learn)...")

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.rag_service import rag_service

def main():
    print("[RAG] Ingesting educational documents...")
    rag_service.load_and_index_documents(verbose=True)
    print(f"[SUCCESS] MindBridge AI Document Ingestion complete! Successfully indexed {len(rag_service.chunks)} knowledge chunks.")
    
    # Test query
    sample_query = "I am having panic attacks and anxiety before exams"
    results = rag_service.retrieve(sample_query, top_k=2)
    print(f"[RAG] Test retrieval query: '{sample_query}'")
    for doc, score in results:
        print(f"  -> Match: {doc.title} (Relevance Score: {score:.3f})")

if __name__ == "__main__":
    main()

