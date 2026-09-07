from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore

load_dotenv()

def index_documents():
    documents = PyPDFLoader("recipes.pdf").load()

    for doc in documents:
        doc.metadata.update({
            "source": "recipes.pdf",
            "category": "recipe"
        })

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 500,
        chunk_overlap = 100
    )
    chunks = text_splitter.split_documents(documents=documents)

    Embedding_model = OpenAIEmbeddings(
        model="text-embedding-3-large"
    )

    vector_db = QdrantVectorStore.from_documents(
        documents = chunks,
        embedding= Embedding_model,
        url ="http://localhost:6333",
        collection_name = "Meal_planner"
    )

    print(f"Successful Indexing😎{len(chunks)} chunks.")


if __name__ == "__main__":
    index_documents()