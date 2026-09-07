from sqlalchemy import Column, Integer, String
from DataBase.connection import Base

class Pantryitem(Base):
    __tablename__ = "pantry"

    id = Column(Integer, primary_key=True, index=True)
    item = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    