import asyncio
import sys

from app.database import engine
from sqlalchemy.orm import Session

sys.path.insert(0, "/home/larryck/Python/fruit-veg-shop")

from dotenv import load_dotenv

load_dotenv()

from app.models import DBProduct
from app.services.ai_search import ai_search

# Create mock products

db = Session(engine)

products = db.query(DBProduct).all()


async def test():
    try:
        result = await ai_search("something sweet and healthy", products)
        print("SUCCESS! Result:", result)
    except Exception as e:
        import traceback

        print(f"ERROR: {type(e).__name__}: {e}")
        traceback.print_exc()


asyncio.run(test())
