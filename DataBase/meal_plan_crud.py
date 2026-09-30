from datetime import date

from sqlalchemy.orm import Session

from DataBase.meal_plan_table import MealPlan
from DataBase.daily_meal_table import DailyMeal


# ============================================================
# MEAL PLAN
# ============================================================

def save_meal_plan(
    session: Session,
    user_id: int,
    plan_date: date,
    days: int,
    plan_text: str,
):
    meal_plan = MealPlan(
        user_id=user_id,
        plan_date=plan_date,
        days=days,
        plan_text=plan_text,
    )

    session.add(meal_plan)
    session.commit()
    session.refresh(meal_plan)

    return meal_plan


def get_latest_meal_plan(
    session: Session,
    user_id: int,
):
    return (
        session.query(MealPlan)
        .filter(
            MealPlan.user_id == user_id
        )
        .order_by(
            MealPlan.created_at.desc()
        )
        .first()
    )


# ============================================================
# DAILY MEALS
# ============================================================

def clear_daily_meals(
    session: Session,
    user_id: int,
    meal_date: date,
):
    (
        session.query(DailyMeal)
        .filter(
            DailyMeal.user_id == user_id,
            DailyMeal.meal_date == meal_date,
        )
        .delete(
            synchronize_session=False
        )
    )

    session.commit()


def save_daily_meal(
    session: Session,
    user_id: int,
    meal_date: date,
    meal_type: str,
    meal_name: str,
    description: str = "",
    calories: int | None = None,
    protein: str | None = None,
    carbohydrates: str | None = None,
    fat: str | None = None,
):
    meal = DailyMeal(
        user_id=user_id,
        meal_date=meal_date,
        meal_type=meal_type,
        meal_name=meal_name,
        description=description,
        calories=calories,
        protein=protein,
        carbohydrates=carbohydrates,
        fat=fat,
    )

    session.add(meal)
    session.commit()
    session.refresh(meal)

    return meal


def get_todays_meals(
    session: Session,
    user_id: int,
    meal_date: date,
):
    return (
        session.query(DailyMeal)
        .filter(
            DailyMeal.user_id == user_id,
            DailyMeal.meal_date == meal_date,
        )
        .order_by(
            DailyMeal.id
        )
        .all()
    )