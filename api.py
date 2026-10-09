import json
import re
import httpx
import os

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from pydantic import BaseModel

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from openai import AsyncOpenAI
from pydantic import BaseModel

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    UniqueConstraint,
)

from agents import Agent, Runner, SQLiteSession

from typing import Any, Dict, Optional

from Agents.meal_agent import meal_agent
from Orchestrator import orchestrator_agent

# ============================================================
# DATABASE
# ============================================================

from DataBase.connection import (
    SessionLocal,
    Base,
    engine,
)

from DataBase.profile_table import UserProfile
from DataBase.meal_plan_table import MealPlan
from DataBase.daily_meal_table import DailyMeal
from DataBase.pantry_table import Pantryitem
from DataBase.grocery_table import Groceryitem

from DataBase.conversation_table import (
    Conversation,
    ConversationHistory,
)

Base.metadata.create_all(bind=engine)

# ============================================================
# DATABASE CRUD
# ============================================================

from DataBase.meal_plan_crud import (
    save_meal_plan,
    get_latest_meal_plan,
    clear_daily_meals,
    save_daily_meal,
    get_todays_meals,
)

from DataBase.pantry_crud import (
    get_all_pantry_items,
    add_pantry_item,
    update_pantry_item,
    delete_pantry_item,
)

from DataBase.grocery_crud import (
    get_all_grocery_items,
    add_grocery_item,
    update_grocery_item,
    delete_grocery_item,
    clear_grocery_items,
)

# ============================================================
# OPENAI
# ============================================================

OPENAI_API_KEY = (
    os.getenv("OPENAI_API_KEY") or ""
).strip()

if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is not configured."
    )

transcription_client = AsyncOpenAI(
    api_key=OPENAI_API_KEY
)

# ============================================================
# REQUEST MODELS
# ============================================================

class PantryCreateRequest(BaseModel):
    item: str
    quantity: int
    unit: str


class MealPlanRequest(BaseModel):
    user_id: int = 1
    days: int = 1


class PantryUpdateRequest(BaseModel):
    item: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None


class GroceryCreateRequest(BaseModel):
    item: str
    quantity: float
    unit: str


class GroceryUpdateRequest(BaseModel):
    item: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    purchased: Optional[bool] = None


class MealConsumptionRequest(BaseModel):
    meal_id: int
    user_id: int = 1


# ============================================================
# MEAL CONSUMPTION TABLE
# ============================================================

class MealConsumption(Base):
    __tablename__ = "meal_consumptions"

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

    daily_meal_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    meal_date = Column(
        Date,
        nullable=False,
    )

    meal_name = Column(
        String,
        nullable=False,
    )

    consumed_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "daily_meal_id",
            name="uq_meal_consumption_user_meal",
        ),
    )


# ============================================================
# CREATE ALL DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# STARTUP DIAGNOSTICS
# ============================================================

print(
    f"[Meal Planner API] Loaded module: {__file__}"
)

print(
    "[Meal Planner API] Database: "
    + engine.url.render_as_string(
        hide_password=True
    )
)


from DataBase.crud import (
    create_conversation,
    save_message,
)

from DataBase.connection import SessionLocal

from DataBase.profile_crud import (
    update_user_profile,
    get_user_profile,
)

from Memory.profile_extractor import (
    extract_profile_data,
)

from Memory.memory import (
    search_memory,
    save_memory,
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Meal Planner AI API",
    description="Backend API for Meal Planner AI",
    version="1.0.0",
)


def verify_firebase_id_token(id_token: str) -> dict:
    """Verify a Firebase ID token using server-side Admin credentials."""
    service_account_json = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_JSON", ""
    ).strip()

    if not service_account_json:
        raise HTTPException(
            status_code=500,
            detail="Firebase Admin credentials are not configured.",
        )

    try:
        try:
            firebase_admin.get_app()
        except ValueError:
            service_account_info = json.loads(service_account_json)
            credential = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(credential)

        return firebase_auth.verify_id_token(id_token)

    except HTTPException:
        raise
    except (ValueError, json.JSONDecodeError):
        raise HTTPException(
            status_code=500,
            detail="Firebase Admin credentials are not valid JSON.",
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase ID token.",
        )


# ============================================================
# REQUEST MODELS
# ============================================================

class ChatRequest(BaseModel):
    message: str
    user_id: int = 1


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None

    height: Optional[float] = None
    weight: Optional[float] = None

    goal: Optional[str] = None
    activity_level: Optional[str] = None
    diet_type: Optional[str] = None
    meals_per_day: Optional[int] = None
    budget: Optional[str] = None

    allergies: Optional[Any] = None
    disliked_foods: Optional[Any] = None
    favorite_foods: Optional[Any] = None
    health_considerations: Optional[Any] = None
    daily_schedule: Optional[Any] = None
    cuisine_preferences: Optional[Any] = None


class SyncUserRequest(BaseModel):
    id_token: str
    name: Optional[str] = None


# ============================================================
# BASIC ENDPOINTS
# ============================================================

@app.get("/")
async def root():

    return {
        "success": True,
        "message": "Meal Planner API is running",
    }


@app.get("/health")
async def health():

    return {
        "success": True,
        "status": "healthy",
    }


@app.get("/test")
async def test():

    return {
        "success": True,
        "message": "React Native connected to FastAPI!",
    }
# ============================================================
# FIREBASE USER SYNC
# ============================================================

@app.post("/auth/sync-user")
async def sync_user(request: SyncUserRequest):

    # Verify the token before trusting any account details.
    claims = verify_firebase_id_token(request.id_token)

    firebase_uid = str(claims.get("uid") or "").strip()
    email = str(claims.get("email") or "").strip().lower()

    name = (
        request.name.strip()
        if request.name and request.name.strip()
        else claims.get("name")
    )

    if not firebase_uid:
        raise HTTPException(
            status_code=401,
            detail="Firebase token does not contain a valid user ID.",
        )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="The Firebase account does not have an email address.",
        )

    db_session = SessionLocal()

    try:


        # 1. Find user by Firebase UID
        user = (
            db_session.query(UserProfile)
            .filter(UserProfile.firebase_uid == firebase_uid)
            .first()
        )

        # 2. If not found, find user by email
        if user is None:
            user = (
                db_session.query(UserProfile)
                .filter(UserProfile.email == email)
                .first()
            )


        # --------------------------------------------------------
        # 4. Existing user
        # --------------------------------------------------------


        if user is not None:
            # Prevent linking an existing profile to a different
            # Firebase account.
            if (
                user.firebase_uid
                and user.firebase_uid != firebase_uid
            ):
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "This profile is already linked to another "
                        "Firebase account."
                    ),
                )

            user.email = email
            user.firebase_uid = firebase_uid

            if name:
                user.name = name


            db_session.commit()
            db_session.refresh(user)

            return {
                "success": True,
                "message": "User synchronized successfully.",
                "data": {
                    "user_id": user.user_id,
                    "email": user.email,
                    "name": user.name,
                    "firebase_uid": user.firebase_uid,
                }
            }

        # --------------------------------------------------------
        # 5. Create a new user if no profile exists
        # --------------------------------------------------------

        # Find the next available user_id.
        last_user = (
            db_session.query(UserProfile)
            .order_by(
                UserProfile.user_id.desc()
            )
            .first()
        )

        next_user_id = (
            last_user.user_id + 1
            if last_user is not None
            else 1
        )

        user = UserProfile(
            user_id=next_user_id,
            email=email,
            firebase_uid=firebase_uid,
            name=name,
        )

        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        return {
            "success": True,
            "message": "New user created successfully.",
            "data": {
                "user_id": user.user_id,
                "email": user.email,
                "name": user.name,
                "firebase_uid": user.firebase_uid,
            }
        }

    except HTTPException:
        raise

    except Exception as e:

        db_session.rollback()

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        db_session.close()


# ============================================================
# CHAT ENDPOINT
# ============================================================

@app.post("/chat")
async def chat(request: ChatRequest):

    user_id = request.user_id
    user_input = request.message.strip()

    # --------------------------------------------------------
    # Validate message
    # --------------------------------------------------------

    if not user_input:

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    try:

        # ====================================================
        # 1. CREATE CONVERSATION
        # ====================================================

        conversation = create_conversation(
            user_id=user_id,
            title="Mobile Meal Planner Conversation",
        )

        conversation_id = conversation.id


        # ====================================================
        # 2. OPEN AGENT SESSION
        # ====================================================

        session = SQLiteSession(
            f"meal_planner_user_{user_id}"
        )


        # ====================================================
        # 3. SAVE USER MESSAGE
        # ====================================================

        save_message(
            conversation_id=conversation_id,
            role="user",
            message=user_input,
        )


        # ====================================================
        # 4. EXTRACT PROFILE INFORMATION
        # ====================================================

        profile_data = extract_profile_data(
            user_input
        )


        # ====================================================
        # 5. UPDATE USER PROFILE
        # ====================================================

        if profile_data:

            db_session = SessionLocal()

            try:

                update_user_profile(
                    db_session,
                    user_id,
                    profile_data,
                )

            finally:

                db_session.close()


        # ====================================================
        # 6. LOAD USER PROFILE
        # ====================================================

        db_session = SessionLocal()

        try:

            user_profile = get_user_profile(
                db_session,
                user_id,
            )

        finally:

            db_session.close()


        # ====================================================
        # 7. SEARCH LONG-TERM MEMORY
        # ====================================================

        memories = search_memory(
            user_id=user_id,
            query=user_input,
        )


        # ====================================================
        # 8. BUILD USER CONTEXT
        # ====================================================

        user_context = f"""
You are assisting a user of a Meal Planner AI application.

================ USER PROFILE ================

{user_profile}

============= RELEVANT MEMORIES ==============

{memories}

============= CURRENT REQUEST ================

{user_input}

================== RULES =====================

1. Use the user's profile when relevant.

2. Use relevant long-term memories when relevant.

3. Do not invent missing user information.

4. Do not assume information that is not provided.

5. Treat allergies as important dietary restrictions.

6. Respect disliked foods when creating meal recommendations.

7. The CURRENT REQUEST is the user's actual request.

8. If information is genuinely required and unavailable,
   ask the user for it.
"""


        # ====================================================
        # 9. RUN ORCHESTRATOR
        # ====================================================

        result = await Runner.run(
            orchestrator_agent,
            user_context,
            session=session,
        )

        response = result.final_output


        # ====================================================
        # 10. SAVE AI RESPONSE
        # ====================================================

        save_message(
            conversation_id=conversation_id,
            role="assistant",
            message=response,
        )


        # ====================================================
        # 11. SAVE TO LONG-TERM MEMORY
        # ====================================================

        save_memory(
            user_id=user_id,
            user_message=user_input,
            assistant_message=response,
        )


        # ====================================================
        # 12. RETURN RESPONSE
        # ====================================================

        return {
            "success": True,
            "response": response,
        }


    except HTTPException:

        raise


    except Exception as e:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ============================================================
# GET USER PROFILE
# ============================================================

@app.get("/profile/{user_id}")
async def get_profile(user_id: int):

    db_session = SessionLocal()

    try:

        profile = get_user_profile(
            db_session,
            user_id,
        )

        # ----------------------------------------------------
        # Profile doesn't exist
        # ----------------------------------------------------

        if profile is None:

            raise HTTPException(
                status_code=404,
                detail="Profile not found",
            )


        return {
            "success": True,
            "data": profile,
        }


    except HTTPException:

        raise


    except Exception as e:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


    finally:

        db_session.close()


# ============================================================
# UPDATE USER PROFILE
# ============================================================

@app.put("/profile/{user_id}")
async def update_profile(
    user_id: int,
    profile_data: ProfileUpdateRequest,
):

    db_session = SessionLocal()

    try:

        # ----------------------------------------------------
        # Convert Pydantic model to dictionary
        # ----------------------------------------------------

        data = profile_data.model_dump(
            exclude_none=True
        )


        # ----------------------------------------------------
        # Don't update anything if body is empty
        # ----------------------------------------------------

        if not data:

            raise HTTPException(
                status_code=400,
                detail="No profile data provided",
            )


        # ----------------------------------------------------
        # Update PostgreSQL
        # ----------------------------------------------------

        update_user_profile(
            db_session,
            user_id,
            data,
        )


        # ----------------------------------------------------
        # Read updated profile
        # ----------------------------------------------------

        updated_profile = get_user_profile(
            db_session,
            user_id,
        )


        return {
            "success": True,
            "data": updated_profile,
            "message": "Profile updated successfully",
        }


    except HTTPException:

        raise


    except Exception as e:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


    finally:

        db_session.close()

# ============================================================
# QUICK ASK MEAL PLANNER AGENT
# ============================================================

quick_meal_agent = Agent(
    name="QuickMealAssistant",

    instructions="""
You are the Quick Meal Planner Assistant.

You answer the user's current food, nutrition, cooking,
meal, ingredient, and healthy-eating questions.

IMPORTANT:
- Answer the user's actual question directly.
- Be concise and easy to understand.
- Do not use other agents.
- Do not call tools.
- Do not generate a full multi-day meal plan unless the user
  specifically asks for one.
- Use the supplied user profile when it is relevant.
- Use the supplied pantry items when they are relevant.
- Never invent allergies, preferences, or health information.
- Respect allergies and dietary restrictions.
- For nutrition values, give approximate values when exact
  values depend on portion size or preparation.
- If the user asks a simple nutrition question such as
  "How much protein is in one egg?", answer directly.
- If the user asks for a food recommendation, give practical
  options.
- Do not diagnose medical conditions or prescribe treatment.

Keep simple answers short.
""",
)


# ============================================================
# PANTRY ENDPOINTS
# ============================================================

@app.get("/pantry")
def get_pantry(user_id: int = 1):
    session = SessionLocal()

    try:
        items = get_all_pantry_items(
            session=session,
            user_id=user_id
        )

        return {
            "success": True,
            "data": [
                {
                    "id": item.id,
                    "user_id": item.user_id,
                    "item": item.item,
                    "quantity": item.quantity,
                    "unit": item.unit,
                }
                for item in items
            ],
        }

    finally:
        session.close()


@app.post("/pantry")
def create_pantry_item(
    request: PantryCreateRequest,
    user_id: int = 1
):
    session = SessionLocal()

    try:
        # Validate item
        if not request.item.strip():
            raise HTTPException(
                status_code=400,
                detail="Item name cannot be empty."
            )

        # Validate quantity
        if request.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0."
            )

        # Validate unit
        if not request.unit.strip():
            raise HTTPException(
                status_code=400,
                detail="Unit cannot be empty."
            )

        pantry_item = add_pantry_item(
            session=session,
            user_id=user_id,
            item=request.item.strip(),
            quantity=request.quantity,
            unit=request.unit.strip(),
        )

        return {
            "success": True,
            "message": "Pantry item added successfully",
            "data": {
                "id": pantry_item.id,
                "user_id": pantry_item.user_id,
                "item": pantry_item.item,
                "quantity": pantry_item.quantity,
                "unit": pantry_item.unit,
            },
        }

    finally:
        session.close()


@app.put("/pantry/{item_id}")
def update_pantry(
    item_id: int,
    request: PantryUpdateRequest,
    user_id: int = 1
):
    session = SessionLocal()

    try:
        # Validate item
        if (
            request.item is not None
            and not request.item.strip()
        ):
            raise HTTPException(
                status_code=400,
                detail="Item name cannot be empty."
            )

        # Validate quantity
        if (
            request.quantity is not None
            and request.quantity <= 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0."
            )

        # Validate unit
        if (
            request.unit is not None
            and not request.unit.strip()
        ):
            raise HTTPException(
                status_code=400,
                detail="Unit cannot be empty."
            )

        pantry_item = update_pantry_item(
            session=session,
            user_id=user_id,
            item_id=item_id,
            item=(
                request.item.strip()
                if request.item is not None
                else None
            ),
            quantity=request.quantity,
            unit=(
                request.unit.strip()
                if request.unit is not None
                else None
            ),
        )

        if pantry_item is None:
            raise HTTPException(
                status_code=404,
                detail="Pantry item not found."
            )

        return {
            "success": True,
            "message": "Pantry item updated successfully",
            "data": {
                "id": pantry_item.id,
                "user_id": pantry_item.user_id,
                "item": pantry_item.item,
                "quantity": pantry_item.quantity,
                "unit": pantry_item.unit,
            },
        }

    finally:
        session.close()


@app.delete("/pantry/{item_id}")
def delete_pantry(
    item_id: int,
    user_id: int = 1
):
    session = SessionLocal()

    try:
        pantry_item = delete_pantry_item(
            session=session,
            user_id=user_id,
            item_id=item_id
        )

        if pantry_item is None:
            raise HTTPException(
                status_code=404,
                detail="Pantry item not found."
            )

        return {
            "success": True,
            "message": "Pantry item deleted successfully",
        }

    finally:
        session.close()

# ============================================================
# MEAL PLAN ENDPOINT
# ============================================================

def parse_meal_plan_json(meal_plan_text: str) -> dict:
    """Parse pure JSON or JSON wrapped in markdown fences."""
    cleaned = meal_plan_text.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(
            r"^```(?:json)?\s*",
            "",
            cleaned,
            flags=re.IGNORECASE,
        )
        cleaned = re.sub(
            r"\s*```$",
            "",
            cleaned,
        )

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start == -1 or end == -1 or end <= start:
            raise

        return json.loads(cleaned[start:end + 1])


def find_plan_meal_for_daily_meal(
    meal_plan_data: dict,
    base_date,
    daily_meal_date,
    daily_meal_name: str,
):
    """Match a DailyMeal to its source plan entry safely.

    Prefer exact date + name. Fall back to name-only only when the
    name occurs exactly once in the saved plan, avoiding ambiguous matches.
    """
    wanted_name = str(daily_meal_name or "").strip().casefold()
    if not wanted_name:
        return None

    exact_matches = []
    name_matches = []

    for day_data in meal_plan_data.get("days", []):
        if not isinstance(day_data, dict):
            continue

        try:
            date_offset = int(day_data.get("date_offset", 0))
        except (TypeError, ValueError):
            date_offset = 0

        plan_meal_date = (
            base_date + timedelta(days=date_offset)
            if base_date is not None
            else None
        )

        day_meals = day_data.get("meals", [])
        if not isinstance(day_meals, list):
            continue

        for meal_data in day_meals:
            if not isinstance(meal_data, dict):
                continue

            plan_name = str(meal_data.get("meal_name", "")).strip().casefold()
            if plan_name != wanted_name:
                continue

            name_matches.append(meal_data)
            if plan_meal_date == daily_meal_date:
                exact_matches.append(meal_data)

    if len(exact_matches) == 1:
        return exact_matches[0]
    if len(exact_matches) > 1:
        return None
    if len(name_matches) == 1:
        return name_matches[0]
    return None


@app.post("/meal-plan")
async def generate_meal_plan(
    request: MealPlanRequest
):
    db_session = SessionLocal()

    try:
        if request.days < 1 or request.days > 7:
            raise HTTPException(
                status_code=400,
                detail="Days must be between 1 and 7."
            )

        user_profile = get_user_profile(
            db_session,
            request.user_id
        )

        if user_profile is None:
            raise HTTPException(
                status_code=404,
                detail="User profile not found."
            )

        pantry_items = get_all_pantry_items(
            db_session,
            request.user_id
        )

        pantry_data = [
            {
                "item": item.item,
                "quantity": item.quantity,
                "unit": item.unit
            }
            for item in pantry_items
        ]

        meal_context = f"""
You are creating a personalized meal plan.

================ USER PROFILE ================

{user_profile}

================ PANTRY ======================

{pantry_data}

================ REQUEST =====================

Create a meal plan for {request.days} day(s).

================ IMPORTANT ===================

Respect the user's:
- allergies
- disliked foods
- favorite foods
- diet type
- goal
- activity level
- meals per day
- budget
- cuisine preferences
- health considerations
- daily schedule

Use pantry ingredients when appropriate.
Do not assume ingredients exist in the pantry unless they are listed above.

Include approximate calories, protein, carbohydrates, and fat when possible.

IMPORTANT OUTPUT RULE:
Return ONLY valid JSON.
Do not return markdown.
Do not return ```json.
Do not add explanations outside JSON.

Use exactly this structure:

{{
  "days": [
    {{
      "day": 1,
      "date_offset": 0,
      "meals": [
        {{
          "meal_type": "Breakfast",
          "meal_name": "Example meal",
          "description": "Short description",
          "ingredients": [
            {{
              "item": "Oats",
              "quantity": 50,
              "unit": "g"
            }},
            {{
              "item": "Milk",
              "quantity": 250,
              "unit": "ml"
            }},
            {{
              "item": "Banana",
              "quantity": 1,
              "unit": "pcs"
            }}
          ],
          "calories": 350,
          "protein": "15g",
          "carbohydrates": "50g",
          "fat": "10g"
        }}
      ]
    }}
  ]
}}

IMPORTANT INGREDIENT RULES:
- Every meal MUST contain an "ingredients" array.
- Every ingredient MUST contain "item", "quantity", and "unit".
- Ingredient quantities represent the amount required for ONE serving of that meal.
- Use practical quantities.
- Use simple ingredient names such as "rice", "chicken", "onion", "tomato", "egg".
- Use these units whenever possible: g, kg, ml, L, pcs.
- Do not include ingredients that are not actually used in the meal.

The number of objects in "days" must be exactly {request.days}.
"""

        result = await Runner.run(
            meal_agent,
            meal_context
        )

        meal_plan_text = result.final_output

        print(
            "\n================ MEAL PLAN AGENT OUTPUT ================\n"
        )
        print(meal_plan_text)
        print(
            "\n==========================================================\n"
        )

        try:
            meal_plan_data = parse_meal_plan_json(
                meal_plan_text
            )
        except Exception:
            raise HTTPException(
                status_code=500,
                detail=(
                    "MealPlannerAgent returned invalid JSON. "
                    "Update Agents/meal_agent.py so it returns "
                    "only the required JSON structure."
                ),
            )

        days_data = meal_plan_data.get(
            "days",
            []
        )

        if not isinstance(days_data, list) or not days_data:
            raise HTTPException(
                status_code=500,
                detail="Meal plan JSON contains no valid days."
            )

        # ====================================================
        # VALIDATE MEAL INGREDIENTS
        # ====================================================

        for day_data in days_data:

            if not isinstance(day_data, dict):
                continue

            meals = day_data.get("meals", [])

            if not isinstance(meals, list):
                raise HTTPException(
                    status_code=500,
                    detail="Meal plan contains invalid meals data."
                )

            for meal in meals:

                if not isinstance(meal, dict):
                    continue

                ingredients = meal.get("ingredients")

                if not isinstance(ingredients, list) or not ingredients:
                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Meal '{meal.get('meal_name', 'Unknown')}' "
                            "does not contain a valid ingredients array."
                        )
                    )

                for ingredient in ingredients:

                    if not isinstance(ingredient, dict):
                        raise HTTPException(
                            status_code=500,
                            detail="Invalid ingredient format in meal plan."
                        )

                    if not str(ingredient.get("item", "")).strip():
                        raise HTTPException(
                            status_code=500,
                            detail="Ingredient is missing 'item'."
                        )

                    try:
                        quantity = float(ingredient.get("quantity"))
                    except (TypeError, ValueError):
                        raise HTTPException(
                            status_code=500,
                            detail=(
                                f"Invalid quantity for ingredient "
                                f"'{ingredient.get('item', 'Unknown')}'."
                            )
                        )

                    if quantity <= 0:
                        raise HTTPException(
                            status_code=500,
                            detail=(
                                f"Ingredient quantity must be greater than "
                                f"0 for '{ingredient.get('item', 'Unknown')}'."
                            )
                        )

                    if not str(ingredient.get("unit", "")).strip():
                        raise HTTPException(
                            status_code=500,
                            detail=(
                                f"Ingredient '{ingredient.get('item', 'Unknown')}' "
                                "is missing 'unit'."
                            )
                        )

        today = date.today()

        # Save the complete generated plan.
        saved_plan = save_meal_plan(
            session=db_session,
            user_id=request.user_id,
            plan_date=today,
            days=request.days,
            plan_text=meal_plan_text,
        )

        # Save every generated day into daily_meals.
        for index, day_data in enumerate(days_data):

            if not isinstance(day_data, dict):
                continue

            try:
                date_offset = int(
                    day_data.get(
                        "date_offset",
                        index
                    )
                )
            except (TypeError, ValueError):
                date_offset = index

            meal_date = (
                today +
                timedelta(days=date_offset)
            )

            # Replace old generated meals for this date.
            clear_daily_meals(
                session=db_session,
                user_id=request.user_id,
                meal_date=meal_date,
            )

            meals = day_data.get(
                "meals",
                []
            )

            if not isinstance(meals, list):
                continue

            for meal in meals:

                if not isinstance(meal, dict):
                    continue

                calories = meal.get("calories")

                if calories is not None:
                    try:
                        calories = int(
                            float(calories)
                        )
                    except (TypeError, ValueError):
                        calories = None

                save_daily_meal(
                    session=db_session,
                    user_id=request.user_id,
                    meal_date=meal_date,
                    meal_type=str(
                        meal.get(
                            "meal_type",
                            "Meal"
                        )
                    ),
                    meal_name=str(
                        meal.get(
                            "meal_name",
                            "Meal"
                        )
                    ),
                    description=str(
                        meal.get(
                            "description",
                            ""
                        )
                    ),
                    calories=calories,
                    protein=(
                        str(meal["protein"])
                        if meal.get("protein") is not None
                        else None
                    ),
                    carbohydrates=(
                        str(meal["carbohydrates"])
                        if meal.get("carbohydrates") is not None
                        else None
                    ),
                    fat=(
                        str(meal["fat"])
                        if meal.get("fat") is not None
                        else None
                    ),
                )

        # Keep meal_plan as TEXT because the current
        # meal-plan.tsx displays it directly.
        return {
            "success": True,
            "user_id": request.user_id,
            "days": request.days,
            "meal_plan_id": saved_plan.id,
            "meal_plan": meal_plan_text,
            "meal_plan_data": meal_plan_data,
            "message": "Meal plan generated and saved successfully.",
        }

    except HTTPException:
        raise

    except Exception as e:

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db_session.close()


# ============================================================
# TODAY'S MEALS
# ============================================================


# ============================================================
# LATEST SAVED MEAL PLAN
# ============================================================

@app.get("/meal-plan")
async def get_saved_meal_plan(
    user_id: int = 1
):
    db_session = SessionLocal()

    try:
        saved_plan = get_latest_meal_plan(
            session=db_session,
            user_id=user_id,
        )

        if saved_plan is None:
            raise HTTPException(
                status_code=404,
                detail="No meal plan found for this user."
            )

        return {
            "success": True,
            "id": saved_plan.id,
            "user_id": saved_plan.user_id,
            "plan_date": str(saved_plan.plan_date),
            "days": saved_plan.days,
            "meal_plan": saved_plan.plan_text,
            "created_at": (
                saved_plan.created_at.isoformat()
                if saved_plan.created_at
                else None
            ),
        }

    except HTTPException:
        raise

    except Exception as e:

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db_session.close()

@app.get("/meals/today")
async def get_today_meals(user_id: int = 1):
    db = SessionLocal()

    try:
        today = datetime.now(
            ZoneInfo("Asia/Kolkata")
        ).date()

        meals = get_todays_meals(
            db,
            user_id,
            today
        )

        # --------------------------------------------------------
        # Load the latest meal plan so the mobile app can receive
        # the exact ingredients for each meal.
        # --------------------------------------------------------
        saved_plan = get_latest_meal_plan(
            session=db,
            user_id=user_id,
        )

        meal_plan_data = {}
        if saved_plan is not None:
            try:
                meal_plan_data = parse_meal_plan_json(
                    saved_plan.plan_text
                )
            except Exception:
                meal_plan_data = {}

        # Resolve each database meal to its source plan entry.
        # Prefer exact date + name; use name-only only when unique.
        base_date = saved_plan.plan_date if saved_plan is not None else None
        ingredients_by_meal_id = {}

        if saved_plan is not None:
            for meal in meals:
                plan_meal = find_plan_meal_for_daily_meal(
                    meal_plan_data=meal_plan_data,
                    base_date=base_date,
                    daily_meal_date=meal.meal_date,
                    daily_meal_name=meal.meal_name,
                )
                ingredients = (
                    plan_meal.get("ingredients", [])
                    if plan_meal is not None
                    else []
                )
                ingredients_by_meal_id[meal.id] = (
                    ingredients if isinstance(ingredients, list) else []
                )

        # --------------------------------------------------------
        # Get consumed meal IDs for today
        # --------------------------------------------------------
        consumed_rows = (
            db.query(MealConsumption.daily_meal_id)
            .filter(
                MealConsumption.user_id == user_id,
                MealConsumption.meal_date == today,
            )
            .all()
        )

        consumed_ids = {
            row[0]
            for row in consumed_rows
        }

        return {
            "success": True,
            "date": str(today),
            "meals": [
                {
                    "id": meal.id,
                    "user_id": meal.user_id,
                    "meal_date": str(meal.meal_date),
                    "meal_type": meal.meal_type,
                    "meal_name": meal.meal_name,
                    "description": meal.description,
                    "calories": meal.calories,
                    "protein": meal.protein,
                    "carbohydrates": meal.carbohydrates,
                    "fat": meal.fat,
                    "ingredients": ingredients_by_meal_id.get(
                        meal.id,
                        [],
                    ),
                    "consumed": meal.id in consumed_ids,
                }
                for meal in meals
            ],
        }

    finally:
        db.close()


# ============================================================
# CONSUME MEAL
# ============================================================

@app.post("/meals/consume")
async def consume_meal(
    request: MealConsumptionRequest
):
    """
    Mark a meal as consumed and deduct all of its ingredients
    from the user's pantry.

    The meal ID comes from GET /meals/today.

    Example:
        Pantry:
            chicken = 400 g

        Meal:
            chicken breast = 200 g

        Result:
            chicken = 200 g
    """

    db = SessionLocal()

    try:
        user_id = request.user_id

        # --------------------------------------------------------
        # 1. Find the selected daily meal
        # --------------------------------------------------------
        daily_meal = (
            db.query(DailyMeal)
            .filter(
                DailyMeal.id == request.meal_id,
                DailyMeal.user_id == user_id,
            )
            .first()
        )

        if daily_meal is None:
            raise HTTPException(
                status_code=404,
                detail="Meal not found for this user.",
            )

        # --------------------------------------------------------
        # 2. Prevent double consumption
        # --------------------------------------------------------
        existing_consumption = (
            db.query(MealConsumption)
            .filter(
                MealConsumption.user_id == user_id,
                MealConsumption.daily_meal_id == daily_meal.id,
            )
            .first()
        )

        if existing_consumption is not None:
            raise HTTPException(
                status_code=400,
                detail="This meal has already been consumed.",
            )

        # --------------------------------------------------------
        # 3. Load the latest saved meal plan
        # --------------------------------------------------------
        saved_plan = get_latest_meal_plan(
            session=db,
            user_id=user_id,
        )

        if saved_plan is None:
            raise HTTPException(
                status_code=404,
                detail="No saved meal plan found.",
            )

        try:
            meal_plan_data = parse_meal_plan_json(
                saved_plan.plan_text
            )
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Saved meal plan contains invalid JSON.",
            )

        # --------------------------------------------------------
        # 4. Find the matching source meal safely
        # --------------------------------------------------------
        target_meal = find_plan_meal_for_daily_meal(
            meal_plan_data=meal_plan_data,
            base_date=saved_plan.plan_date,
            daily_meal_date=daily_meal.meal_date,
            daily_meal_name=daily_meal.meal_name,
        )

        if target_meal is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Could not uniquely match this daily meal to the "
                    "saved meal plan. Generate a fresh meal plan before "
                    "marking this meal as consumed."
                ),
            )

        # --------------------------------------------------------
        # 5. Get exact ingredients
        # --------------------------------------------------------
        meal_ingredients = target_meal.get(
            "ingredients",
            []
        )

        if (
            not isinstance(meal_ingredients, list)
            or not meal_ingredients
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "This meal does not contain usable "
                    "ingredient information."
                ),
            )

        # --------------------------------------------------------
        # 6. Aggregate duplicate ingredients
        # --------------------------------------------------------
        required = {}

        for ingredient in meal_ingredients:
            if not isinstance(ingredient, dict):
                continue

            item_name = str(
                ingredient.get("item", "")
            ).strip()

            if not item_name:
                continue

            try:
                quantity = float(
                    ingredient.get("quantity", 0)
                )
            except (TypeError, ValueError):
                continue

            if quantity <= 0:
                continue

            original_unit = str(
                ingredient.get("unit", "pcs")
            ).strip()

            key = normalize_ingredient_name(
                item_name
            )

            quantity, base_unit = (
                convert_to_base_quantity(
                    quantity,
                    original_unit,
                )
            )

            if key not in required:
                required[key] = {
                    "item": item_name,
                    "quantity": 0.0,
                    "unit": base_unit,
                }

            # If the same ingredient appears with an
            # incompatible unit, keep it separate.
            if required[key]["unit"] == base_unit:
                required[key]["quantity"] += quantity
            else:
                separate_key = (
                    f"{key}__{base_unit}"
                )

                if separate_key not in required:
                    required[separate_key] = {
                        "item": item_name,
                        "quantity": 0.0,
                        "unit": base_unit,
                    }

                required[separate_key]["quantity"] += (
                    quantity
                )

        required_ingredients = list(
            required.values()
        )

        if not required_ingredients:
            raise HTTPException(
                status_code=400,
                detail="No usable ingredients found for this meal.",
            )

        # --------------------------------------------------------
        # 7. Load pantry and normalize it
        # --------------------------------------------------------
        pantry_items = get_all_pantry_items(
            session=db,
            user_id=user_id,
        )

        pantry_map = {}

        for pantry_item in pantry_items:
            key = normalize_ingredient_name(
                pantry_item.item
            )

            quantity, unit = (
                convert_to_base_quantity(
                    float(pantry_item.quantity),
                    pantry_item.unit,
                )
            )

            if key not in pantry_map:
                pantry_map[key] = []

            pantry_map[key].append({
                "object": pantry_item,
                "quantity": quantity,
                "unit": unit,
            })

        # --------------------------------------------------------
        # 8. Validate ALL ingredients BEFORE changing anything.
        #
        # This prevents a situation where breakfast removes
        # chicken and then fails halfway through because eggs
        # are missing.
        # --------------------------------------------------------
        deductions = []

        for ingredient in required_ingredients:
            key = normalize_ingredient_name(
                ingredient["item"]
            )

            required_quantity = float(
                ingredient["quantity"]
            )

            required_unit = ingredient["unit"]

            matching_pantry = []

            for pantry_entry in pantry_map.get(key, []):
                if (
                    pantry_entry["unit"]
                    == required_unit
                ):
                    matching_pantry.append(
                        pantry_entry
                    )

            available_quantity = sum(
                entry["quantity"]
                for entry in matching_pantry
            )

            if available_quantity < required_quantity:
                display_required = format_grocery_quantity(
                    required_quantity,
                    required_unit,
                )

                display_available = format_grocery_quantity(
                    available_quantity,
                    required_unit,
                )

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Not enough {ingredient['item']} "
                        f"in pantry. Required: "
                        f"{display_required[0]} "
                        f"{display_required[1]}, "
                        f"Available: "
                        f"{display_available[0]} "
                        f"{display_available[1]}."
                    ),
                )

            deductions.append({
                "item": ingredient["item"],
                "key": key,
                "required_quantity": required_quantity,
                "unit": required_unit,
                "pantry_entries": matching_pantry,
            })

        # --------------------------------------------------------
        # 9. Apply all pantry deductions
        # --------------------------------------------------------
        consumed_items = []

        for deduction in deductions:
            remaining_to_deduct = (
                deduction["required_quantity"]
            )

            for pantry_entry in deduction[
                "pantry_entries"
            ]:
                if remaining_to_deduct <= 0:
                    break

                pantry_object = pantry_entry[
                    "object"
                ]

                available = pantry_entry[
                    "quantity"
                ]

                amount = min(
                    available,
                    remaining_to_deduct,
                )

                # Convert the amount back to the pantry's
                # original unit.
                original_unit = str(
                    pantry_object.unit
                ).strip().lower()

                if original_unit in [
                    "kg",
                    "kgs",
                    "kilogram",
                    "kilograms",
                ]:
                    new_quantity = (
                        float(pantry_object.quantity)
                        - amount / 1000
                    )

                elif original_unit in [
                    "l",
                    "lt",
                    "liter",
                    "liters",
                    "litre",
                    "litres",
                ]:
                    new_quantity = (
                        float(pantry_object.quantity)
                        - amount / 1000
                    )

                else:
                    new_quantity = (
                        float(pantry_object.quantity)
                        - amount
                    )

                # Pantry currently stores quantities as integer
                # values. Keep the database value clean.
                if abs(new_quantity) < 0.000001:
                    new_quantity = 0

                if float(new_quantity).is_integer():
                    pantry_object.quantity = int(
                        new_quantity
                    )
                else:
                    # The current pantry schema uses integer
                    # quantities. Reject rather than silently
                    # rounding a real food quantity.
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Cannot deduct {deduction['item']} "
                            f"because the pantry quantity would "
                            f"require a fractional value in its "
                            f"current database schema."
                        ),
                    )

                remaining_to_deduct -= amount

            consumed_items.append({
                "item": deduction["item"],
                "quantity": deduction[
                    "required_quantity"
                ],
                "unit": deduction["unit"],
            })

        # --------------------------------------------------------
        # 10. Record consumption so the same meal cannot be
        # consumed twice.
        # --------------------------------------------------------
        consumption = MealConsumption(
            user_id=user_id,
            daily_meal_id=daily_meal.id,
            meal_date=daily_meal.meal_date,
            meal_name=daily_meal.meal_name,
            consumed_at=datetime.utcnow(),
        )

        db.add(consumption)

        # Flush now so INSERT/constraint errors happen here, before
        # reporting success. Pantry changes and consumption remain
        # part of the same database transaction.
        db.flush()

        if consumption.id is None:
            raise RuntimeError(
                "Meal consumption INSERT did not produce a database ID."
            )

        # One transaction for all pantry changes + consumption.
        db.commit()
        db.refresh(consumption)

        # Refresh pantry values after commit.
        for pantry_item in pantry_items:
            db.refresh(pantry_item)

        # --------------------------------------------------------
        # 11. Return updated pantry
        # --------------------------------------------------------
        updated_pantry = [
            {
                "id": item.id,
                "user_id": item.user_id,
                "item": item.item,
                "quantity": item.quantity,
                "unit": item.unit,
            }
            for item in pantry_items
            if float(item.quantity) > 0
        ]

        print(
            "\n================ MEAL CONSUMED ================\n"
        )
        print(
            f"Meal: {daily_meal.meal_name}"
        )

        for item in consumed_items:
            print(
                f"Deducted: {item['item']} "
                f"{item['quantity']} "
                f"{item['unit']}"
            )

        print(
            "\n================================================\n"
        )

        return {
            "success": True,
            "message": (
                f"{daily_meal.meal_name} consumed "
                "and pantry updated successfully."
            ),
            "meal": {
                "id": daily_meal.id,
                "meal_date": str(
                    daily_meal.meal_date
                ),
                "meal_type": daily_meal.meal_type,
                "meal_name": daily_meal.meal_name,
            },
            "consumption": {
                "id": consumption.id,
                "user_id": consumption.user_id,
                "daily_meal_id": consumption.daily_meal_id,
                "meal_date": str(consumption.meal_date),
                "meal_name": consumption.meal_name,
                "consumed_at": (
                    consumption.consumed_at.isoformat()
                    if consumption.consumed_at
                    else None
                ),
            },
            "consumed_ingredients": consumed_items,
            "pantry": updated_pantry,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:
        db.close()


# ============================================================
# TODAY'S NUTRITION
# ============================================================


def _parse_numeric_nutrition(value) -> float:
    """Convert values such as '36g', '36 g', 36, or None to float."""
    if value is None:
        return 0.0

    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip().replace(",", "")
    match = re.search(r"-?\d+(?:\.\d+)?", text)

    if not match:
        return 0.0

    try:
        return float(match.group(0))
    except ValueError:
        return 0.0


@app.get("/nutrition/today")
async def get_today_nutrition(user_id: int = 1):
    """
    Return today's nutrition based on the current meal plan.

    daily_target = nutrition from all meals planned for today.
    consumed = nutrition from meals already marked consumed.
    remaining = daily_target - consumed.

    This avoids inventing nutrition targets: the meal plan itself
    supplies the daily target.
    """

    db = SessionLocal()

    try:
        today = datetime.now(
            ZoneInfo("Asia/Kolkata")
        ).date()

        meals = get_todays_meals(
            db,
            user_id,
            today,
        )

        # IDs of meals that have already been consumed.
        consumed_rows = (
            db.query(MealConsumption.daily_meal_id)
            .filter(
                MealConsumption.user_id == user_id,
                MealConsumption.meal_date == today,
            )
            .all()
        )

        consumed_ids = {
            row[0]
            for row in consumed_rows
        }

        daily_target = {
            "calories": 0.0,
            "protein": 0.0,
            "carbohydrates": 0.0,
            "fat": 0.0,
        }

        consumed = {
            "calories": 0.0,
            "protein": 0.0,
            "carbohydrates": 0.0,
            "fat": 0.0,
        }

        for meal in meals:
            calories = _parse_numeric_nutrition(
                meal.calories
            )
            protein = _parse_numeric_nutrition(
                meal.protein
            )
            carbohydrates = _parse_numeric_nutrition(
                meal.carbohydrates
            )
            fat = _parse_numeric_nutrition(
                meal.fat
            )

            daily_target["calories"] += calories
            daily_target["protein"] += protein
            daily_target["carbohydrates"] += carbohydrates
            daily_target["fat"] += fat

            if meal.id in consumed_ids:
                consumed["calories"] += calories
                consumed["protein"] += protein
                consumed["carbohydrates"] += carbohydrates
                consumed["fat"] += fat

        remaining = {
            key: max(
                0.0,
                daily_target[key] - consumed[key],
            )
            for key in daily_target
        }

        def rounded(value: float):
            if float(value).is_integer():
                return int(value)
            return round(value, 1)

        daily_target = {
            key: rounded(value)
            for key, value in daily_target.items()
        }

        consumed = {
            key: rounded(value)
            for key, value in consumed.items()
        }

        remaining = {
            key: rounded(value)
            for key, value in remaining.items()
        }

        return {
            "success": True,
            "user_id": user_id,
            "date": str(today),
            "daily_target": daily_target,
            "consumed": consumed,
            "remaining": remaining,
            "consumed_meals": len(consumed_ids),
            "total_meals": len(meals),
            "message": (
                "Nutrition is calculated from today's planned meals "
                "and the meals marked as consumed."
            ),
        }

    except HTTPException:
        raise

    except Exception as e:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:
        db.close()


# ============================================================
# QUICK ASK ENDPOINT

# ============================================================

@app.post("/ask")
async def ask_meal_planner(request: ChatRequest):

    user_id = request.user_id
    user_input = request.message.strip()

    # --------------------------------------------------------
    # Validate message
    # --------------------------------------------------------

    if not user_input:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    try:

        # ====================================================
        # 1. LOAD USER PROFILE
        # ====================================================

        db_session = SessionLocal()

        try:

            user_profile = get_user_profile(
                db_session,
                user_id,
            )

            # =================================================
            # 2. LOAD PANTRY
            # =================================================

            pantry_items = get_all_pantry_items(
                db_session,
                user_id,
            )

            pantry_data = [
                {
                    "item": item.item,
                    "quantity": item.quantity,
                    "unit": item.unit,
                }
                for item in pantry_items
            ]

        finally:

            db_session.close()

        # ====================================================
        # 3. BUILD SMALL CONTEXT
        # ====================================================

        quick_context = f"""
USER PROFILE:
{user_profile}

PANTRY:
{pantry_data}

USER QUESTION:
{user_input}
"""

        # ====================================================
        # 4. ONE LLM CALL
        # ====================================================

        result = await Runner.run(
            quick_meal_agent,
            quick_context,
        )

        response = result.final_output

        # ====================================================
        # 5. RETURN
        # ====================================================

        return {
            "success": True,
            "response": response,
        }

    except HTTPException:
        raise

    except Exception as e:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ============================================================
# GROCERY GENERATION HELPERS
# ============================================================

def normalize_ingredient_name(name: str) -> str:
    """
    Convert ingredient names to a canonical name so the
    pantry and meal plan do not treat equivalent names
    as different ingredients.

    Example:
        chicken -> chicken
        chicken breast -> chicken
        chicken breasts -> chicken

    This is intentionally conservative: only known
    equivalent food names are merged.
    """

    name = str(name).strip().lower()

    # Normalize common separators/spaces.
    name = re.sub(r"\s+", " ", name)
    name = name.replace("_", " ").replace("-", " ").strip()

    aliases = {
        # Chicken
        "chicken": "chicken",
        "chickens": "chicken",
        "chicken breast": "chicken",
        "chicken breasts": "chicken",
        "chicken breast meat": "chicken",

        # Egg
        "egg": "egg",
        "eggs": "egg",
        "chicken egg": "egg",
        "chicken eggs": "egg",

        # Tomato
        "tomato": "tomato",
        "tomatoes": "tomato",

        # Onion
        "onion": "onion",
        "onions": "onion",

        # Potato
        "potato": "potato",
        "potatoes": "potato",

        # Carrot
        "carrot": "carrot",
        "carrots": "carrot",

        # Banana
        "banana": "banana",
        "bananas": "banana",

        # Apple
        "apple": "apple",
        "apples": "apple",

        # Capsicum / bell pepper
        "capsicum": "capsicum",
        "bell pepper": "capsicum",
        "bell peppers": "capsicum",
        "green bell pepper": "capsicum",
        "green bell peppers": "capsicum",

        # Cucumber
        "cucumber": "cucumber",
        "cucumbers": "cucumber",

        # Milk
        "milk": "milk",
        "cow milk": "milk",
        "full cream milk": "milk",
        "whole milk": "milk",

        # Rice
        "rice": "rice",
        "white rice": "rice",
        "brown rice": "rice",

        # Oats
        "oat": "oats",
        "oats": "oats",
        "rolled oats": "oats",
        "quick oats": "oats",

        # Chana / chickpeas
        "chana": "chana",
        "roasted chana": "chana",
        "roasted chickpeas": "chana",
        "chickpea": "chana",
        "chickpeas": "chana",
        "kabuli chana": "chana",

        # Flour
        "atta": "wheat flour",
        "wheat flour": "wheat flour",
        "whole wheat flour": "wheat flour",
    }

    return aliases.get(name, name)


def convert_to_base_quantity(
    quantity: float,
    unit: str
):
    """
    Convert compatible units to a common base unit.

    Weight → grams
    Volume → milliliters
    Pieces → pieces
    """

    unit = unit.strip().lower()

    if unit in ["kg", "kgs", "kilogram", "kilograms"]:
        return quantity * 1000, "g"

    if unit in ["g", "gram", "grams"]:
        return quantity, "g"

    if unit in ["l", "lt", "liter", "liters", "litre", "litres"]:
        return quantity * 1000, "ml"

    if unit in ["ml", "milliliter", "milliliters"]:
        return quantity, "ml"

    if unit in ["pcs", "pc", "piece", "pieces"]:
        return quantity, "pcs"

    return quantity, unit


def format_grocery_quantity(
    quantity: float,
    unit: str
):
    """
    Convert base quantity back into a user-friendly unit.
    """

    if unit == "g":
        if quantity >= 1000:
            return round(quantity / 1000, 2), "kg"

        return round(quantity, 2), "g"

    if unit == "ml":
        if quantity >= 1000:
            return round(quantity / 1000, 2), "L"

        return round(quantity, 2), "ml"

    return round(quantity, 2), unit


# ============================================================
# GROCERY ENDPOINTS
# ============================================================

@app.get("/grocery")
def get_grocery(user_id: int = 1):
    session = SessionLocal()

    try:
        items = get_all_grocery_items(
            session=session,
            user_id=user_id
        )

        return {
            "success": True,
            "data": [
                {
                    "id": item.id,
                    "user_id": item.user_id,
                    "item": item.item,
                    "quantity": item.quantity,
                    "unit": item.unit,
                    "purchased": item.purchased,
                }
                for item in items
            ],
        }

    finally:
        session.close()

@app.post("/grocery")
def create_grocery_item(
    request: GroceryCreateRequest,
    user_id: int = 1
):
    session = SessionLocal()

    try:
        # Validate item
        if not request.item.strip():
            raise HTTPException(
                status_code=400,
                detail="Item name cannot be empty."
            )

        # Validate quantity
        if request.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0."
            )

        # Validate unit
        if not request.unit.strip():
            raise HTTPException(
                status_code=400,
                detail="Unit cannot be empty."
            )

        grocery_item = add_grocery_item(
            session=session,
            user_id=user_id,
            item=request.item.strip(),
            quantity=request.quantity,
            unit=request.unit.strip()
        )

        return {
            "success": True,
            "message": "Grocery item added successfully",
            "data": {
                "id": grocery_item.id,
                "user_id": grocery_item.user_id,
                "item": grocery_item.item,
                "quantity": grocery_item.quantity,
                "unit": grocery_item.unit,
                "purchased": grocery_item.purchased,
            },
        }

    finally:
        session.close()

@app.put("/grocery/{item_id}")
def update_grocery(
    item_id: int,
    request: GroceryUpdateRequest,
    user_id: int = 1
):
    session = SessionLocal()

    try:
        # Validate item
        if (
            request.item is not None
            and not request.item.strip()
        ):
            raise HTTPException(
                status_code=400,
                detail="Item name cannot be empty."
            )

        # Validate quantity
        if (
            request.quantity is not None
            and request.quantity <= 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0."
            )

        # Validate unit
        if (
            request.unit is not None
            and not request.unit.strip()
        ):
            raise HTTPException(
                status_code=400,
                detail="Unit cannot be empty."
            )

        grocery_item = update_grocery_item(
            session=session,
            user_id=user_id,
            item_id=item_id,
            item=(
                request.item.strip()
                if request.item is not None
                else None
            ),
            quantity=request.quantity,
            unit=(
                request.unit.strip()
                if request.unit is not None
                else None
            ),
            purchased=request.purchased
        )

        if grocery_item is None:
            raise HTTPException(
                status_code=404,
                detail="Grocery item not found."
            )

        return {
            "success": True,
            "message": "Grocery item updated successfully",
            "data": {
                "id": grocery_item.id,
                "user_id": grocery_item.user_id,
                "item": grocery_item.item,
                "quantity": grocery_item.quantity,
                "unit": grocery_item.unit,
                "purchased": grocery_item.purchased,
            },
        }

    finally:
        session.close()

@app.delete("/grocery/{item_id}")
def delete_grocery(
    item_id: int,
    user_id: int = 1
):
    session = SessionLocal()

    try:
        grocery_item = delete_grocery_item(
            session=session,
            user_id=user_id,
            item_id=item_id
        )

        if grocery_item is None:
            raise HTTPException(
                status_code=404,
                detail="Grocery item not found."
            )

        return {
            "success": True,
            "message": "Grocery item deleted successfully",
        }

    finally:
        session.close()

# ============================================================
# GENERATE GROCERY LIST
# ============================================================

@app.post("/grocery/generate")
async def generate_grocery_list(
    user_id: int = 1
):
    db_session = SessionLocal()

    try:

        # ====================================================
        # 1. GET SAVED MEAL PLAN
        # ====================================================

        saved_plan = get_latest_meal_plan(
            session=db_session,
            user_id=user_id
        )

        if saved_plan is None:
            raise HTTPException(
                status_code=404,
                detail="No meal plan found. Generate a meal plan first."
            )

        # ====================================================
        # 2. PARSE MEAL PLAN
        # ====================================================

        try:
            meal_plan_data = parse_meal_plan_json(
                saved_plan.plan_text
            )

        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Saved meal plan contains invalid JSON."
            )

        # ====================================================
        # 3. GET PANTRY
        # ====================================================

        pantry_items = get_all_pantry_items(
            db_session,
            user_id
        )

        pantry_data = [
            {
                "item": item.item,
                "quantity": item.quantity,
                "unit": item.unit
            }
            for item in pantry_items
        ]

        # ====================================================
        # 4. EXTRACT EXACT INGREDIENTS FROM MEAL PLAN
        # ====================================================

        # The Meal Agent now provides the exact ingredients and
        # quantities for every meal. We aggregate them here in
        # Python instead of asking another LLM to guess them.

        required_ingredients = {}

        days_data = meal_plan_data.get("days", [])

        for day_data in days_data:

            if not isinstance(day_data, dict):
                continue

            meals = day_data.get("meals", [])

            if not isinstance(meals, list):
                continue

            for meal in meals:

                if not isinstance(meal, dict):
                    continue

                ingredients = meal.get("ingredients", [])

                if not isinstance(ingredients, list):
                    continue

                for ingredient in ingredients:

                    if not isinstance(ingredient, dict):
                        continue

                    item_name = str(ingredient.get("item", "")).strip()

                    if not item_name:
                        continue

                    try:
                        quantity = float(ingredient.get("quantity", 0))
                    except (TypeError, ValueError):
                        continue

                    if quantity <= 0:
                        continue

                    original_unit = str(
                        ingredient.get("unit", "pcs")
                    ).strip()

                    key = normalize_ingredient_name(item_name)

                    # Convert every compatible quantity to a base unit
                    # before combining duplicate ingredients.
                    quantity, base_unit = convert_to_base_quantity(
                        quantity,
                        original_unit
                    )

                    if key not in required_ingredients:
                        required_ingredients[key] = {
                            "item": item_name,
                            "quantity": 0.0,
                            "unit": base_unit,
                        }

                    # Only combine quantities when their units are
                    # compatible.
                    if required_ingredients[key]["unit"] == base_unit:
                        required_ingredients[key]["quantity"] += quantity
                    else:
                        # Keep incompatible units as separate entries.
                        separate_key = f"{key}__{base_unit}"

                        if separate_key not in required_ingredients:
                            required_ingredients[separate_key] = {
                                "item": item_name,
                                "quantity": 0.0,
                                "unit": base_unit,
                            }

                        required_ingredients[separate_key]["quantity"] += quantity

        ingredients = list(required_ingredients.values())

        if not ingredients:
            raise HTTPException(
                status_code=500,
                detail="Meal plan contains no usable ingredients."
            )

        print(
            "\n================ EXACT MEAL INGREDIENTS ================\n"
        )

        for ingredient in ingredients:
            print(
                f"{ingredient['item']}: "
                f"{ingredient['quantity']} "
                f"{ingredient['unit']}"
            )

        print(
            "\n=========================================================\n"
        )

        # ====================================================
        # 6. NORMALIZE PANTRY
        # ====================================================

        pantry_map = {}

        for pantry_item in pantry_items:

            key = normalize_ingredient_name(
                pantry_item.item
            )

            quantity, unit = convert_to_base_quantity(
                float(pantry_item.quantity),
                pantry_item.unit
            )

            if key not in pantry_map:
                pantry_map[key] = []

            pantry_map[key].append({
                "quantity": quantity,
                "unit": unit
            })

        # ====================================================
        # 7. COMPARE MEAL PLAN REQUIREMENTS WITH PANTRY
        # ====================================================

        missing_items = []

        for ingredient in ingredients:

            if not isinstance(ingredient, dict):
                continue

            item_name = ingredient.get("item")

            if not item_name:
                continue

            required_quantity = ingredient.get(
                "quantity",
                0
            )

            required_unit = ingredient.get(
                "unit",
                "pcs"
            )

            try:
                required_quantity = float(
                    required_quantity
                )
            except (TypeError, ValueError):
                continue

            key = normalize_ingredient_name(
                item_name
            )

            required_quantity, required_unit = (
                convert_to_base_quantity(
                    required_quantity,
                    required_unit
                )
            )

            # ================================================
            # CHECK PANTRY
            # ================================================

            available_quantity = 0

            for pantry_entry in pantry_map.get(
                key,
                []
            ):

                pantry_quantity = pantry_entry["quantity"]
                pantry_unit = pantry_entry["unit"]

                # Only subtract compatible units.
                if pantry_unit == required_unit:
                    available_quantity += pantry_quantity

            # ================================================
            # CALCULATE MISSING QUANTITY
            # ================================================

            missing_quantity = (
                required_quantity -
                available_quantity
            )

            print(
                f"[GROCERY CHECK] "
                f"{item_name} | "
                f"Required: {required_quantity} {required_unit} | "
                f"Pantry: {available_quantity} {required_unit} | "
                f"Missing: {missing_quantity} {required_unit}"
            )

            if missing_quantity <= 0:
                continue

            display_quantity, display_unit = (
                format_grocery_quantity(
                    missing_quantity,
                    required_unit
                )
            )

            missing_items.append({
                "item": item_name,
                "quantity": display_quantity,
                "unit": display_unit
            })

        # ====================================================
        # 8. REMOVE OLD GENERATED GROCERY LIST
        # ====================================================

        clear_grocery_items(
            session=db_session,
            user_id=user_id
        )

        # ====================================================
        # 9. SAVE MISSING ITEMS
        # ====================================================

        saved_items = []

        for grocery_item in missing_items:

            saved_item = add_grocery_item(
                session=db_session,
                user_id=user_id,
                item=grocery_item["item"],
                quantity=grocery_item["quantity"],
                unit=grocery_item["unit"]
            )

            saved_items.append({
                "id": saved_item.id,
                "user_id": saved_item.user_id,
                "item": saved_item.item,
                "quantity": saved_item.quantity,
                "unit": saved_item.unit,
                "purchased": saved_item.purchased
            })

        # ====================================================
        # 10. RETURN RESULT
        # ====================================================

        return {
            "success": True,
            "message": "Grocery list generated successfully.",
            "user_id": user_id,
            "items": saved_items
        }

    except HTTPException:
        raise

    except Exception as e:

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db_session.close()

# ============================================================
# AUDIO TRANSCRIPTION
# ============================================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

transcription_client = AsyncOpenAI(
    api_key=OPENAI_API_KEY
)


@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):

    try:
        audio_bytes = await audio.read()

        print("\n========== AUDIO TRANSCRIPTION ==========")
        print("Filename:", audio.filename)
        print("Content type:", audio.content_type)
        print("Received bytes:", len(audio_bytes))

        if not audio_bytes:
            raise HTTPException(
                status_code=400,
                detail="The backend received an empty audio file."
            )

        # ========================================================
        # OPENAI API KEY
        # ========================================================

        openai_api_key = os.getenv(
            "OPENAI_API_KEY",
            ""
        ).strip()

        print(
            "OPENAI_API_KEY configured:",
            bool(openai_api_key)
        )

        if not openai_api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY is not configured."
            )

        # ========================================================
        # OPENAI CONNECTIVITY TEST
        # ========================================================

        print(
            "\n========== OPENAI CONNECTIVITY TEST =========="
        )

        try:
            async with httpx.AsyncClient() as client:

                response = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={
                        "Authorization":
                            f"Bearer {openai_api_key}"
                    },
                    timeout=20.0,
                )

            print(
                "OpenAI HTTP status:",
                response.status_code
            )

            print(
                "OpenAI response:",
                response.text[:300]
            )

            print(
                "===============================================\n"
            )

        except Exception as connection_error:

            print(
                "OpenAI connectivity test failed:",
                type(connection_error).__name__
            )

            print(
                "OpenAI connectivity error:",
                repr(connection_error)
            )

            print(
                "===============================================\n"
            )

            raise HTTPException(
                status_code=502,
                detail=(
                    "The Render server cannot connect "
                    "to the OpenAI API."
                )
            )

        # ========================================================
        # TRANSCRIPTION
        # ========================================================

        print(
            "========== OPENAI TRANSCRIPTION =========="
        )

        try:

            result = await transcription_client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=(
                    audio.filename or "recording.m4a",
                    audio_bytes,
                    audio.content_type or "audio/mp4",
                ),
            )

        except Exception as transcription_error:

            print(
                "Transcription error type:",
                type(transcription_error).__name__
            )

            print(
                "Transcription error:",
                repr(transcription_error)
            )

            print(
                "==========================================\n"
            )

            raise HTTPException(
                status_code=502,
                detail=(
                    "OpenAI transcription request failed. "
                    "Check Render logs."
                )
            )

        transcript = (
            result.text or ""
        ).strip()

        print(
            "Transcription result:",
            repr(transcript)
        )

        print(
            "==========================================\n"
        )

        if not transcript:
            raise HTTPException(
                status_code=422,
                detail=(
                    "The audio reached OpenAI, "
                    "but no speech was recognized."
                )
            )

        return {
            "success": True,
            "text": transcript
        }

    except HTTPException:
        raise

    except Exception as exc:

        print(
            "========== TRANSCRIPTION DEBUG =========="
        )

        print(
            "Unexpected error type:",
            type(exc).__name__
        )

        print(
            "Unexpected error:",
            repr(exc)
        )

        print(
            "=========================================\n"
        )

        raise HTTPException(
            status_code=502,
            detail="Audio transcription failed."
        )

import base64

from fastapi import HTTPException
from pydantic import BaseModel

from Voice_Agent.agent import generate_speech


class TTSRequest(BaseModel):
    text: str


@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        audio_bytes = await generate_speech(request.text)

        return {
            "audio_base64": base64.b64encode(
                audio_bytes
            ).decode("utf-8"),
            "mime_type": "audio/mpeg",
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Text-to-speech failed: {exc}",
        ) from exc

