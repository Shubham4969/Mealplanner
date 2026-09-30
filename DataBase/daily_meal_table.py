from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
)

from DataBase.connection import Base


class DailyMeal(Base):
    __tablename__ = "daily_meals"

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

    meal_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    meal_type = Column(
        String,
        nullable=False,
    )

    meal_name = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    calories = Column(
        Integer,
        nullable=True,
    )

    protein = Column(
        String,
        nullable=True,
    )

    carbohydrates = Column(
        String,
        nullable=True,
    )

    fat = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )