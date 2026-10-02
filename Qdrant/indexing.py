
import os
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore

# Load environment variables from the project root .env file
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "Meal_planner")


# Starter recipe dataset.
# Add more recipes here or replace these with your own recipe data.
RECIPES = [
    {
        "name": "Vegetable Poha",
        "ingredients": [
            "poha", "onion", "peas", "mustard seeds",
            "turmeric", "oil", "salt", "lemon"
        ],
        "instructions": (
            "Rinse poha briefly. Saute mustard seeds and onion in oil. "
            "Add peas and turmeric, then add poha and salt. "
            "Cook for a few minutes and finish with lemon."
        ),
        "meal_type": "breakfast",
        "cuisine": "Indian",
        "diet": "vegetarian",
    },
    {
        "name": "Paneer Bhurji",
        "ingredients": [
            "paneer", "onion", "tomato", "green chilli",
            "turmeric", "cumin", "oil", "salt"
        ],
        "instructions": (
            "Saute cumin, onion and green chilli. Add tomato and spices. "
            "Crumble paneer into the pan and cook until heated through."
        ),
        "meal_type": "lunch",
        "cuisine": "Indian",
        "diet": "vegetarian",
    },
    {
        "name": "Chickpea Salad",
        "ingredients": [
            "chickpeas", "cucumber", "tomato", "onion",
            "lemon", "black pepper", "salt"
        ],
        "instructions": (
            "Combine cooked chickpeas with chopped cucumber, tomato "
            "and onion. Season with lemon juice, pepper and salt."
        ),
        "meal_type": "lunch",
        "cuisine": "Mediterranean",
        "diet": "vegan",
    },
    {
        "name": "Vegetable Fried Rice",
        "ingredients": [
            "cooked rice", "carrot", "peas", "capsicum",
            "onion", "oil", "soy sauce"
        ],
        "instructions": (
            "Saute chopped vegetables in oil. Add cooked rice and soy "
            "sauce. Stir-fry until heated through."
        ),
        "meal_type": "dinner",
        "cuisine": "Asian",
        "diet": "vegetarian",
    },
    {
        "name": "Banana Oatmeal",
        "ingredients": [
            "oats", "banana", "milk", "cinnamon"
        ],
        "instructions": (
            "Cook oats with milk until soft. Slice banana on top "
            "and sprinkle with cinnamon."
        ),
        "meal_type": "breakfast",
        "cuisine": "International",
        "diet": "vegetarian",
    },
]


def recipes_to_documents():
    """Convert structured recipes into searchable LangChain documents."""
    documents = []

    for recipe in RECIPES:
        ingredients = ", ".join(recipe["ingredients"])

        content = (
            f"Recipe: {recipe['name']}\n"
            f"Ingredients: {ingredients}\n"
            f"Instructions: {recipe['instructions']}\n"
            f"Meal type: {recipe['meal_type']}\n"
            f"Cuisine: {recipe['cuisine']}\n"
            f"Diet: {recipe['diet']}"
        )

        documents.append(
            Document(
                page_content=content,
                metadata={
                    "source": "python_recipe_dataset",
                    "category": "recipe",
                    "recipe_name": recipe["name"],
                    "meal_type": recipe["meal_type"],
                    "cuisine": recipe["cuisine"],
                    "diet": recipe["diet"],
                },
            )
        )

    return documents


def index_documents():
    """Embed recipe documents and store them in Qdrant Cloud."""
    if not QDRANT_URL:
        raise ValueError("QDRANT_URL is missing from your .env file.")

    if not QDRANT_API_KEY:
        raise ValueError("QDRANT_API_KEY is missing from your .env file.")

    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is missing from your .env file.")

    documents = recipes_to_documents()

    if not documents:
        raise ValueError("No recipes found to index.")

    embedding_model = OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=OPENAI_API_KEY,
    )

    vector_store = QdrantVectorStore.from_documents(
        documents=documents,
        embedding=embedding_model,
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        collection_name=COLLECTION_NAME,
    )

    print(f"Successfully indexed {len(documents)} recipes.")
    print(f"Qdrant collection: {COLLECTION_NAME}")
    return vector_store


if __name__ == "__main__":
    index_documents()
