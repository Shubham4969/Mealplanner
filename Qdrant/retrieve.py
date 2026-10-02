
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "Meal_planner")


def get_vector_db():
    if not QDRANT_URL or not QDRANT_API_KEY:
        raise ValueError(
            "QDRANT_URL and QDRANT_API_KEY must be configured."
        )

    embedding_model = OpenAIEmbeddings(
        model="text-embedding-3-large"
    )

    return QdrantVectorStore.from_existing_collection(
        embedding=embedding_model,
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        collection_name=COLLECTION_NAME
    )


def search_recipes(user_query: str, k: int = 5):
    vector_db = get_vector_db()
    return vector_db.similarity_search(
        query=user_query,
        k=k
    )


if __name__ == "__main__":
    query = input("Tell me: ")
    results = search_recipes(query)

    if not results:
        print("No relevant documents found.")
    else:
        for doc in results:
            print(doc.page_content)
            print("-" * 40)
