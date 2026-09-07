from dotenv import load_dotenv
from mem0 import Memory
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


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
            "host": "localhost",
            "port": 6333
        }
    }
}


mem_client = Memory.from_config(config)


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