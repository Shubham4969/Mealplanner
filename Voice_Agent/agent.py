from dotenv import load_dotenv
import speech_recognition as sr
from openai import AsyncOpenAI
from openai.helpers import LocalAudioPlayer

load_dotenv()

async_client = AsyncOpenAI()


async def tts(speech: str):

    async with async_client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="coral",
        input=speech,
        instructions="Speak in a cheerful and positive tone.",
        response_format="pcm"
    ) as response:

        await LocalAudioPlayer().play(response)


def listen():

    recognizer = sr.Recognizer()

    with sr.Microphone() as source:

        print("\n🎙️ Listening...")

        recognizer.adjust_for_ambient_noise(source)

        audio = recognizer.listen(source)

    print("🔄 Converting speech to text...")

    text = recognizer.recognize_google(audio)

    print("You:", text)

    return text