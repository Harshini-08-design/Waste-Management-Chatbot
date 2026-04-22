from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.auth import router as auth_router, get_db
from app.rag import ask_question, model, tokenizer
from app.vision import classify_image
from app.models import ChatHistory
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import asyncio

# --- 1. Lifespan Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    try:
        print("\n🧹 Cleaning up AI models from memory...")
        global model, tokenizer
        if 'model' in globals(): del model
        if 'tokenizer' in globals(): del tokenizer
        print("✅ Memory cleared successfully.")
    except (asyncio.CancelledError, KeyboardInterrupt):
        print("🛑 Forced shutdown: Cleanup complete.")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)

# --- 2. Pydantic Models ---
class ChatRequest(BaseModel):
    question: str
    user_id: int = 1

# Ensure uploads folder exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# --- 3. Chat & Analysis Endpoints ---

@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        question = request.question
        user_id = request.user_id

        answer = ask_question(question)

        # Save to database
        new_chat = ChatHistory(
            user_id=user_id, 
            question=question, 
            answer=answer
        )
        db.add(new_chat)
        db.commit()

        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/image-analysis")
async def analyze_waste(
    file: UploadFile = File(...), 
    user_id: int = Form(...), 
    db: Session = Depends(get_db)
):
    try:
        path = f"uploads/{file.filename}"
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Vision processing
        label = classify_image(path)
        
        # RAG processing
        query = f"I found some {label}. How should I dispose of it?"
        answer = ask_question(query)

        # Save to history with a clear indicator for the sidebar
        db.add(ChatHistory(
            user_id=user_id, 
            question=f"📸 Image: {label}", 
            answer=answer
        ))
        db.commit()

        return {"detected": label, "guideline": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. History Endpoint (Optimized for Sidebar) ---
@app.get("/history/{user_id}")
async def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    try:
        # Added .order_by to ensure the "Recent" sidebar shows newest items first
        history = db.query(ChatHistory)\
            .filter(ChatHistory.user_id == user_id)\
            .order_by(ChatHistory.id.desc())\
            .all()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Waste Management Chatbot API is running"}