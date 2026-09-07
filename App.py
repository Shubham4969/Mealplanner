import asyncio
import tkinter as tk
from tkinter import filedialog
import mimetypes

import speech_recognition as sr

from Voice_Agent.agent import listen, tts

from Image_Uploader.image import image_to_items

from agents import Runner, SQLiteSession
from Orchestrator import orchestrator_agent

from DataBase.crud import create_conversation, save_message
from DataBase.connection import SessionLocal
from DataBase.profile_crud import (
    update_user_profile,
    get_user_profile
)

from Memory.profile_extractor import extract_profile_data
from Memory.memory import search_memory, save_memory


# ========================================
# IMAGE FILE SELECTOR
# ========================================

def select_image():

    root = tk.Tk()
    root.withdraw()

    file_path = filedialog.askopenfilename(
        title="Select Pantry Image",
        filetypes=[
            ("Image Files", "*.jpg *.jpeg *.png"),
            ("JPG Files", "*.jpg"),
            ("PNG Files", "*.png")
        ]
    )

    root.destroy()

    return file_path


# ========================================
# MAIN APPLICATION
# ========================================

async def main():

    print("🍝 Welcome to Meal Planner AI")

    # OpenAI Agents session
    session = SQLiteSession("meal_planner_user")

    # Current user
    user_id = 1

    # ========================================
    # CREATE CONVERSATION
    # ========================================

    conversation = create_conversation(
        user_id=user_id,
        title="Meal Planner Conversation"
    )

    conversation_id = conversation.id

    # ========================================
    # STORE PANTRY ITEMS
    # ========================================

    pantry_items = []

    # ========================================
    # MAIN LOOP
    # ========================================

    while True:

        # Voice mode is only active for the current request
        voice_mode = False

        user_input = input("\nYou: ").strip()

        if not user_input:
            continue

        # ========================================
        # EXIT
        # ========================================

        if user_input.lower() in [
            "exit",
            "quit",
            "bye"
        ]:

            print("👋 Goodbye!")

            break

        # ========================================
        # VOICE COMMAND
        # ========================================

        if user_input.lower() == "/voice":

            voice_mode = True

            try:

                print("\n🎙️ Voice mode activated.")

                voice_input = listen()

                if not voice_input:

                    print("\n❌ No speech detected.")

                    continue

                # Speech becomes the actual user request
                user_input = voice_input

            except sr.UnknownValueError:

                print(
                    "\n❌ Sorry, I couldn't "
                    "understand the audio."
                )

                continue

            except sr.RequestError as e:

                print(
                    "\n❌ Speech recognition "
                    "service error:"
                )

                print(e)

                continue

            except Exception as e:

                print("\n❌ Voice input error:")
                print(e)

                continue

        # ========================================
        # IMAGE COMMAND
        # ========================================

        if user_input.lower() == "/image":

            print(
                "\n📷 Select your "
                "pantry/food image..."
            )

            image_path = select_image()

            if not image_path:

                print("\n❌ No image selected.")

                continue

            try:

                # ========================================
                # READ IMAGE
                # ========================================

                with open(
                    image_path,
                    "rb"
                ) as image_file:

                    image_bytes = image_file.read()

                print(
                    "\n🔍 Identifying items..."
                )

                # ========================================
                # DETECT IMAGE TYPE
                # ========================================

                image_type, _ = mimetypes.guess_type(
                    image_path
                )

                # ========================================
                # IMAGE → ITEMS
                # ========================================

                image_items = image_to_items(
                    image_bytes,
                    image_type or "image/jpeg"
                )

                # ========================================
                # DISPLAY DETECTED ITEMS
                # ========================================

                print(
                    "\n📦 Detected Items:"
                )

                for item in image_items:

                    print(item)

                # ========================================
                # ADD TO PANTRY
                # ========================================

                pantry_items.extend(
                    image_items
                )

                # Remove duplicates
                pantry_items = list(
                    dict.fromkeys(
                        pantry_items
                    )
                )

                print(
                    "\n✅ Items are now available "
                    "to the Meal Planner."
                )

                continue

            except Exception as e:

                print(
                    "\n❌ Image processing error:"
                )

                print(e)

                continue

        # ========================================
        # NORMAL MESSAGE PROCESSING
        # ========================================

        try:

            # ========================================
            # 1. SAVE USER MESSAGE
            # ========================================

            save_message(
                conversation_id=conversation_id,
                role="user",
                message=user_input
            )

            # ========================================
            # 2. EXTRACT PROFILE INFORMATION
            # ========================================

            profile_data = extract_profile_data(
                user_input
            )

            # ========================================
            # 3. SAVE PROFILE
            # ========================================

            if profile_data:

                db_session = SessionLocal()

                try:

                    update_user_profile(
                        db_session,
                        user_id,
                        profile_data
                    )

                finally:

                    db_session.close()

            # ========================================
            # 4. LOAD USER PROFILE
            # ========================================

            db_session = SessionLocal()

            try:

                user_profile = get_user_profile(
                    db_session,
                    user_id
                )

            finally:

                db_session.close()

            # ========================================
            # 5. SEARCH LONG-TERM MEMORY
            # ========================================

            memories = search_memory(
                user_id=user_id,
                query=user_input
            )

            # ========================================
            # 6. BUILD USER CONTEXT
            # ========================================

            user_context = f"""
You are assisting a user of a Meal Planner AI application.

================ USER PROFILE ================

{user_profile}

============= RELEVANT MEMORIES ==============

{memories}

============= AVAILABLE PANTRY ITEMS =========

{pantry_items}

============== CURRENT REQUEST ===============

{user_input}

================== RULES =====================

1. Use the user's profile when relevant.

2. Use relevant long-term memories when relevant.

3. Do not invent missing user information.

4. Do not assume information that is not provided.

5. Treat allergies as important dietary restrictions.

6. Respect disliked foods when creating meal recommendations.

7. Treat AVAILABLE PANTRY ITEMS as items currently
   available to the user.

8. Use pantry items when creating meal plans.

9. If the user asks for a grocery list, compare
   required ingredients with AVAILABLE PANTRY ITEMS.

10. The CURRENT REQUEST is the user's actual request.

11. If information is genuinely required and
    unavailable, ask the user for it.
"""

            # ========================================
            # 7. RUN ORCHESTRATOR
            # ========================================

            result = await Runner.run(
                orchestrator_agent,
                user_context,
                session=session
            )

            response = result.final_output

            # ========================================
            # 8. SAVE AI RESPONSE
            # ========================================

            save_message(
                conversation_id=conversation_id,
                role="assistant",
                message=response
            )

            # ========================================
            # 9. SAVE CONVERSATION TO MEM0
            # ========================================

            save_memory(
                user_id=user_id,
                user_message=user_input,
                assistant_message=response
            )

            # ========================================
            # 10. DISPLAY RESPONSE
            # ========================================

            print("\nAI:", response)

            # ========================================
            # 11. TEXT → VOICE
            # ========================================

            if voice_mode:

                await tts(response)

        except Exception as e:

            import traceback

            print("\n❌ ERROR:")
            print(e)

            print(
                "\n========== FULL TRACEBACK =========="
            )

            traceback.print_exc()

            print(
                "==================================="
            )


# ========================================
# START APPLICATION
# ========================================

if __name__ == "__main__":

    asyncio.run(main())