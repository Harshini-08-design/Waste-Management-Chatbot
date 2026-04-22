import os
import time
import chromadb
from sentence_transformers import SentenceTransformer
import onnxruntime_genai as og

# --- 1. Configurations ---
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# --- 2. Load Models (Global) ---
print("⏳ Loading Embedding Model...")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

print("⏳ Loading Phi-3 ONNX Model...")
model_path = "models/onnx_phi3"
model = og.Model(model_path)
tokenizer = og.Tokenizer(model)

# --- 3. Database Setup ---
client = chromadb.PersistentClient(path="./vector_db")
collection = client.get_or_create_collection("waste")

def generate_phi3_response(query, context):
    """Generates a response with a high enough token limit for local RAG"""
    try:
        prompt = f"""<|system|>
You are a professional Waste Management Assistant.
Use the context below to answer concisely.
Rules:
1. Max 3 bullet points.
2. If the info isn't in context, say: "I'm sorry, I don't have information about this."
<|end|>
<|user|>
Context: {context}
Question: {query}<|end|>
<|assistant|>"""

        input_tokens = tokenizer.encode(prompt)
        
        params = og.GeneratorParams(model)
        
        # --- 🟢 KEY FIX: Increased max_length to 1024 ---
        # This prevents the "exceeds max length" crash you saw in your logs.
        search_options = {
            "max_length": 1024, 
            "temperature": 0.4, 
            "top_k": 20
        }
        params.set_search_options(**search_options)
        
        generator = og.Generator(model, params)
        generator.append_tokens(input_tokens)
        
        answer = ""
        while not generator.is_done():
            generator.generate_next_token()
            new_token = generator.get_next_tokens()[0]
            token_str = tokenizer.decode([new_token])
            answer += token_str
        
        # Clean non-ASCII or problematic characters before returning
        # We also strip the replacement character \ufffd if it appears
        clean_answer = answer.encode('ascii', 'ignore').decode('ascii')
        return clean_answer.strip() or "I'm sorry, I don't have information about this."
    
    except Exception as e:
        print(f"❌ Phi-3 Generation Error: {e}")
        return "I'm sorry, I don't have information about this."

def ask_question(query):
    """Main RAG Pipeline with Professional Terminal Logging"""
    # Start the overall timer
    start_time = time.time()
    
    print(f"\n{"="*30}")
    print(f"🔵 NEW QUERY: {query}")
    
    # 1. EMBEDDING
    embed_start = time.time()
    query_embeddings = embed_model.encode(query).tolist()
    embed_end = time.time()
    print(f"✅ Embedding done in {embed_end - embed_start:.2f} sec")
    
    # 2. RETRIEVAL
    retrieve_start = time.time()
    results = collection.query(query_embeddings=[query_embeddings], n_results=2)
    retrieve_end = time.time()
    
    # Validation Check
    if not results or not results.get('documents') or not results['documents'][0]:
        print("⚠️ No relevant documents found.")
        return "I'm sorry, I don't have information about this."

    context = "\n".join(results['documents'][0]).strip()
    print(f"✅ Retrieval done in {retrieve_end - retrieve_start:.2f} sec")
    print(f"📄 Context length: {len(context)} characters")

    # 3. GENERATION
    gen_start = time.time()
    response = generate_phi3_response(query, context)
    gen_end = time.time()
    
    print(f"✅ Generation done in {gen_end - gen_start:.2f} sec")
    
    # Final Answer Preview (Cleaned up for terminal)
    preview = response.replace('\n', ' ')[:70] + "..."
    print(f"🟢 FINAL ANSWER PREVIEW: {preview}")
    print(f"{"="*30}\n")
    
    return response