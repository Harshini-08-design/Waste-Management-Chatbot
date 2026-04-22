import os
import pandas as pd
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

DATA_PATH = "data/"
DB_PATH = "vector_db"

# Runs 100% offline on your i5 CPU
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def load_data():
    docs = []
    if not os.path.exists(DATA_PATH):
        print(f"❌ Folder '{DATA_PATH}' not found!")
        return []
    
    for file in os.listdir(DATA_PATH):
        path = os.path.join(DATA_PATH, file)
        if file.endswith(".pdf"):
            loader = PyPDFLoader(path)
            docs.extend(loader.load())
        elif file.endswith((".xlsx", ".xls", ".csv")):
            print(f"📊 Processing Spreadsheet: {file}")
            df = pd.read_excel(path) if not file.endswith(".csv") else pd.read_csv(path)
            docs.append(Document(page_content=df.to_string(), metadata={"source": file}))
    return docs

if __name__ == "__main__":
    raw_docs = load_data()
    if raw_docs:
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = splitter.split_documents(raw_docs)

        Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=DB_PATH,
            collection_name="waste"   # ✅ ADD THIS
        )

        print(f"✅ Knowledge Base Created in '{DB_PATH}'")