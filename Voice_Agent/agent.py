from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

async_client = AsyncOpenAI()


async def generate_speech(speech: str) -> bytes:
    """Generate spoken audio for the mobile app."""

    response = await async_client.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice="coral",
        input=speech,
        instructions=(
            "Speak naturally like a friendly voice assistant. "
            "Use a cheerful, warm, clear, conversational tone."
        ),
        response_format="mp3",
    )

    return response.content