import json
import os
from openai import OpenAI
from fastapi import status

from ..exceptions import AppException

from ..models import DBProduct


async def ai_search(query: str, products: list[DBProduct]):
    catalog = [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "description": p.description,
            "calories": str(p.calories),
            "carbs": str(p.carbs),
            "sugar": str(p.sugar),
            "protein": str(p.protein),
            "fat": str(p.fat),
        }
        for p in products
    ]

    prompt = """ You are a search assistant for a fruit and vegetable store.

Return ONLY a JSON array of product IDs that best match this query,
ordered by relevance. Max 10 results. Example: ["id1", "id2"]
Do not include any other text.
    """

    user_content = f"""
Here is the product catalog:
    {json.dumps(catalog)}
User query: {query}"""

    base_url = os.getenv("FRUIT_VEG_AI_BASE_URL")
    api_key = os.getenv("FRUTI_VEG_AI_API_KEY")
    model = str(os.getenv("FRUIT_VEG_AI_MODEL"))

    client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    response = client.chat.completions.create(
        model = model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_content},
        ],
    )

    text = response.choices[0].message.content
    if not text:
        raise AppException("an Issue happened while fetchin result", status.HTTP_500_INTERNAL_SERVER_ERROR)

    return json.loads(text.strip())
