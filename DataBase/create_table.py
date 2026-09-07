from connection import engine
from pantry_table import Base

Base.metadata.create_all(bind=engine)

print("Table create successfully😎")