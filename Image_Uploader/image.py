import base64
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()


def image_to_items(image_bytes, image_type="image/jpeg"):

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """
Look at this image and identify all visible food/product items.

Return ONLY the item/product names.

Rules:
- One item per line.
- No bullets.
- No numbering.
- No explanations.
- No prices.
- No barcodes.
- No quantities.
- No descriptions.
- Do not repeat items.
"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{image_type};base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
    )

    result = response.choices[0].message.content.strip()

    items = [
        item.strip()
        for item in result.splitlines()
        if item.strip()
    ]

    return list(dict.fromkeys(items))