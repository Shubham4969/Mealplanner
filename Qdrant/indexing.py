
import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "Meal_planner")


def index_documents():
    if not QDRANT_URL or not QDRANT_API_KEY:
        raise ValueError(
            "QDRANT_URL and QDRANT_API_KEY must be configured."
        )

    documents = PyPDFLoader("recipes.pdf").load()

    for doc in documents:
        doc.metadata.update({
            "source": "recipes.pdf",
            "category": "recipe"
        })

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = text_splitter.split_documents(documents)

    embedding_model = OpenAIEmbeddings(
        model="text-embedding-3-large"
    )

    QdrantVectorStore.from_documents(
        documents=chunks,
        embedding=embedding_model,
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        collection_name=COLLECTION_NAME
    )

    print(f"Successfully indexed {len(chunks)} chunks.")


if __name__ == "__main__":
    index_documents()
