from dotenv import load_dotenv
from DataBase.connection import engine, Base
from DataBase.profile_table import UserProfile

from DataBase.pantry_table import Pantryitem
from DataBase.conversation_table import Conversation, ConversationHistory

load_dotenv()

Base.metadata.create_all(bind=engine)

print("✅ Database tables created successfully")