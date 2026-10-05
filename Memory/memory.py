from dotenv import load_dotenv
from mem0 import Memory
import os

load_dotenv()

from urllib.parse import urlparse

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

parsed_qdrant_url = urlparse(QDRANT_URL or "")

print("========== MEAL PLANNER QDRANT DEBUG ==========")
print("QDRANT_URL configured:", bool(QDRANT_URL))
print("QDRANT_HOST:", parsed_qdrant_url.hostname)
print("QDRANT_SCHEME:", parsed_qdrant_url.scheme)
print("QDRANT_PORT:", parsed_qdrant_url.port)
print("QDRANT_API_KEY configured:", bool(QDRANT_API_KEY))
print("MEMORY_QDRANT_COLLECTION:", os.getenv("MEMORY_QDRANT_COLLECTION"))
print("================================================")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MEMORY_QDRANT_COLLECTION = os.getenv(
    "MEMORY_QDRANT_COLLECTION",
    "Meal_planner_memory"
)


config = {
    "version": "v1.1",

    "embedder": {
        "provider": "openai",
        "config": {
            "api_key": OPENAI_API_KEY,
            "model": "text-embedding-3-small"
        }
    },

    "llm": {
        "provider": "openai",
        "config": {
            "api_key": OPENAI_API_KEY,
            "model": "gpt-4.1-mini"
        }
    },

    "vector_store": {
        "provider": "qdrant",
        "config": {
            "collection_name": MEMORY_QDRANT_COLLECTION,
            "embedding_model_dims": 1536,
            "url": QDRANT_URL,
            "api_key": QDRANT_API_KEY
        }
    }
}


print("[Meal Planner] Creating Mem0 client...")
mem_client = Memory.from_config(config)
print("[Meal Planner] Mem0 client created successfully!")


def search_memory(user_id, query):

    result = mem_client.search(
        query=query,
        filters={
            "user_id": str(user_id)
        }
    )

    return result.get("results", [])


def save_memory(user_id, user_message, assistant_message):

    mem_client.add(
        user_id=str(user_id),
        messages=[
            {
                "role": "user",
                "content": user_message
            },
            {
                "role": "assistant",
                "content": assistant_message
            }
        ]
    )