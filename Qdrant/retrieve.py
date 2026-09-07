from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from openai import OpenAI

load_dotenv()
client = OpenAI()

Embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-large"
)
vector_db = QdrantVectorStore.from_existing_collection(
    embedding= Embedding_model,
    url ="http://localhost:6333",
    collection_name = "Meal_planner"
)

user_query = input("Tell me: ")
search_result = vector_db.similarity_search(query = user_query, k = 5)
if not search_result:
    print("No relevant documents found.")

context = "\n\n".join([doc.page_content for doc in search_result])


SYSTEM_PROMPT = f"""
You are an AI Meal Planning Assistant.

You will receive:
1. Retrieved context from a recipe and nutrition knowledge base.
2. The user's question.

Your responsibilities:
- Answer the user's question using the retrieved context as your primary source.
- If multiple relevant recipes or meal ideas are available, summarize and compare them when helpful.
- Provide practical, healthy, and easy-to-understand recommendations.
- Explain your reasoning clearly when appropriate.
- If the retrieved context does not contain enough information to answer the question, clearly state that the information is not available in the provided context instead of making up facts.
- Do not invent recipes, ingredients, nutritional values, or cooking instructions that are not supported by the retrieved context.
- If the user's request is unrelated to meal planning, recipes, groceries, or nutrition, answer briefly and politely.

Guidelines:
- Prefer concise and well-structured responses.
- Use bullet points when listing recipes or ingredients.
- Keep measurements and quantities consistent with the retrieved information.
- If the user asks for a meal plan, use the retrieved recipes as inspiration while ensuring the final plan is balanced and practical.

context:
{context}
"""

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_query}
    ]
)

print("AI Response:", response.choices[0].message.content)

