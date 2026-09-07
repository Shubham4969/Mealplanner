from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime
)

from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

from .connection import Base


class UserProfile(Base):

    __tablename__ = "user_profiles"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        unique=True,
        nullable=False
    )

    # Basic information
    name = Column(String)
    age = Column(Integer)
    sex = Column(String)

    # Body information
    height = Column(Float)
    weight = Column(Float)

    # Meal planning information
    goal = Column(String)
    activity_level = Column(String)
    diet_type = Column(String)
    meals_per_day = Column(Integer)
    budget = Column(String)

    # Flexible information
    allergies = Column(JSONB)
    disliked_foods = Column(JSONB)
    favorite_foods = Column(JSONB)
    health_considerations = Column(JSONB)
    daily_schedule = Column(JSONB)
    cuisine_preferences = Column(JSONB)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )