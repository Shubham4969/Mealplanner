from openai import OpenAI
import json
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def extract_profile_data(user_message: str):

    prompt = f"""
Extract only useful long-term user information from this message.

User message:
{user_message}

Return ONLY valid JSON.

Possible fields:
- name
- age
- sex
- height
- weight
- goal
- activity_level
- diet_type
- meals_per_day
- budget
- allergies
- disliked_foods
- favorite_foods
- health_considerations
- daily_schedule
- cuisine_preferences

Rules:
1. Only include information explicitly stated by the user.
2. Do not guess missing information.
3. Do not include temporary statements such as "I am hungry today".
4. Use arrays for allergies, disliked foods, favorite foods, etc.
5. If there is no profile information, return {{}}.
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You extract structured user profile information."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {}