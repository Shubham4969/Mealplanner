from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Text,
)

from DataBase.connection import Base


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    plan_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    days = Column(
        Integer,
        nullable=False,
    )

    plan_text = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    