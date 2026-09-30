from sqlalchemy import Column, Integer, String, Boolean, Float

from DataBase.connection import Base


class Groceryitem(Base):
    __tablename__ = "grocery_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    item = Column(
        String,
        nullable=False
    )

    quantity = Column(
        Float,
        nullable=False,
        default=1
    )

    unit = Column(
        String,
        nullable=False,
        default="pcs"
    )

    purchased = Column(
        Boolean,
        nullable=False,
        default=False
    )