"""
seed_products.py
────────────────
Populates the Product table using two free public APIs:
  • Fruityvice  → fruits
  • USDA FoodData Central → vegetables + legumes

Usage:
  1. Install deps:  pip install -r backend/requirements.txt
  2. Set env vars in backend/.env (or export them):
       DATABASE_URL=postgresql://user:password@localhost:5432/fruitveg_db
       USDA_API_KEY=your_usda_key   # free at https://fdc.nal.usda.gov/api-key-signup/
  3. Run from the backend directory:
       python scripts/seed_products.py
"""

import os
import random
import sys
import uuid
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Make imports work when the script is run directly from backend/scripts/
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Load env vars before importing app modules that read DATABASE_URL
load_dotenv(BACKEND_DIR / ".env")

from app.database import Base, engine  # noqa: E402
from app.models import DBProduct  # noqa: E402

# ─── Configuration ─────────────────────────────────────────────────────────────

USDA_API_KEY = os.getenv(
    "USDA_API_KEY", "DEMO_KEY"
)  # DEMO_KEY works but has low rate limits


# ─── Helpers ───────────────────────────────────────────────────────────────────


def random_price(low: float, high: float) -> float:
    """Generate a realistic-looking price like 1.49, 2.99, etc."""
    raw = random.uniform(low, high)
    base = int(raw)
    cents = random.choice([0.49, 0.99])
    return round(base + cents, 2)


def random_stock() -> int:
    return random.randint(20, 200)


def placeholder_image(name: str) -> str:
    """Generate a placeholder image URL using the product name."""
    label = name.replace(" ", "+")
    return f"https://placehold.co/400x300?text={label}"


def make_description(name: str, category: str, nutrients: dict) -> str:
    """Build a short description from nutritional data."""
    cal = nutrients.get("calories")
    sugar = nutrients.get("sugar")
    protein = nutrients.get("protein")

    parts = [f"Fresh {name.lower()}."]
    if cal is not None:
        parts.append(f"Approximately {cal:.0f} kcal per 100g.")
    if sugar is not None and category == "fruit":
        parts.append(f"Natural sugar content: {sugar:.1f}g per 100g.")
    if protein is not None and category in ("legume", "vegetable"):
        parts.append(f"Contains {protein:.1f}g of protein per 100g.")
    return " ".join(parts)


# ─── Fruityvice: fetch all fruits ─────────────────────────────────────────────


def fetch_fruits() -> list[DBProduct]:
    print("Fetching fruits from Fruityvice...")
    try:
        res = requests.get("https://www.fruityvice.com/api/fruit/all", timeout=10)
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        print(f"  ✗ Fruityvice request failed: {e}")
        return []

    products = []
    for item in data[:10]:
        name = item.get("name", "").strip()
        if not name:
            continue

        n = item.get("nutritions", {})
        nutrients = {
            "calories": n.get("calories"),
            "carbs": n.get("carbohydrates"),
            "sugar": n.get("sugar"),
            "protein": n.get("protein"),
            "fat": n.get("fat"),
        }

        products.append(
            DBProduct(
                id=str(uuid.uuid4()),
                name=name,
                category="fruit",
                description=make_description(name, "fruit", nutrients),
                price=random_price(0.5, 4.0),
                stock=random_stock(),
                image_url=placeholder_image(name),
                **{k: v for k, v in nutrients.items() if v is not None},
            )
        )

    print(f"  ✓ {len(products)} fruits fetched.")
    return products


# ─── USDA FoodData Central: fetch vegetables + legumes ────────────────────────

# Search terms mapped to category
USDA_QUERIES = {
    "vegetable": [
        "raw carrot",
        "raw broccoli",
        "raw spinach",
        "raw tomato",
        "raw cucumber",
        "raw onion",
        "raw bell pepper",
        "raw zucchini",
        "raw cabbage",
        "raw kale",
    ],
    "legume": [
        "raw lentils",
        "raw chickpeas",
        "black beans raw",
        "kidney beans raw",
        "raw soybeans",
        "raw peas",
        "raw peanuts",
        "raw mung beans",
        "raw fava beans",
        "raw navy beans",
    ],
}

# Nutrient IDs in USDA API
NUTRIENT_MAP = {
    "calories": 1008,  # Energy (kcal)
    "protein": 1003,  # Protein
    "fat": 1004,  # Total lipid (fat)
    "carbs": 1005,  # Carbohydrate
    "sugar": 2000,  # Total sugars
}


def extract_usda_nutrients(food_nutrients: list) -> dict:
    """Pull the nutrients we care about from a USDA food item."""
    result = {}
    for n in food_nutrients:
        nutrient_id = n.get("nutrientId") or (n.get("nutrient") or {}).get("id")
        value = n.get("value") or n.get("amount")
        if nutrient_id and value is not None:
            for key, usda_id in NUTRIENT_MAP.items():
                if nutrient_id == usda_id:
                    result[key] = round(float(value), 2)
    return result


def fetch_usda_category(category: str, queries: list[str]) -> list[DBProduct]:
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    products = []
    seen_names = set()

    for query in queries:
        try:
            res = requests.get(
                base_url,
                params={
                    "api_key": USDA_API_KEY,
                    "query": query,
                    "dataType": "Foundation,SR Legacy",  # raw/unprocessed foods
                    "pageSize": 1,
                },
                timeout=10,
            )
            res.raise_for_status()
            foods = res.json().get("foods", [])
        except Exception as e:
            print(f"  ✗ USDA request failed for '{query}': {e}")
            continue

        if not foods:
            print(f"  - No results for '{query}', skipping.")
            continue

        food = foods[0]
        # Clean up name: USDA names are often "Carrots, raw" — normalize to "Carrots"
        raw_name = food.get("description", query).split(",")[0].strip().title()

        if raw_name in seen_names:
            continue
        seen_names.add(raw_name)

        nutrients = extract_usda_nutrients(food.get("foodNutrients", []))

        products.append(
            DBProduct(
                id=str(uuid.uuid4()),
                name=raw_name,
                category=category,
                description=make_description(raw_name, category, nutrients),
                price=(
                    random_price(0.3, 3.0)
                    if category == "vegetable"
                    else random_price(0.8, 5.0)
                ),
                stock=random_stock(),
                image_url=placeholder_image(raw_name),
                **{k: v for k, v in nutrients.items() if v is not None},
            )
        )

    print(f"  ✓ {len(products)} {category}s fetched.")
    return products


def fetch_usda_products() -> list[DBProduct]:
    print("Fetching vegetables from USDA FoodData Central...")
    vegetables = fetch_usda_category("vegetable", USDA_QUERIES["vegetable"])

    print("Fetching legumes from USDA FoodData Central...")
    legumes = fetch_usda_category("legume", USDA_QUERIES["legume"])

    return vegetables + legumes


# ─── Main: create tables + seed ───────────────────────────────────────────────


def seed():
    print("\n── Creating tables if they don't exist ──")
    Base.metadata.create_all(bind=engine)

    fruits = fetch_fruits()
    usda_products = fetch_usda_products()
    all_products = fruits + usda_products

    if not all_products:
        print("\n✗ No products fetched. Check your API keys and network connection.")
        return

    print(f"\n── Inserting {len(all_products)} products into the database ──")
    with Session(engine) as session:
        existing = session.query(DBProduct).all()
        if existing:
            print(f"  Clearing {len(existing)} existing products...")
            for p in existing:
                session.delete(p)
            session.commit()

        for product in all_products:
            session.add(product)
        session.commit()

    print(f"\n✓ Done! {len(all_products)} products seeded:")
    fruits_count = sum(1 for p in all_products if p.category == "fruit")
    veg_count = sum(1 for p in all_products if p.category == "vegetable")
    legume_count = sum(1 for p in all_products if p.category == "legume")
    print(f"   🍓 Fruits:     {fruits_count}")
    print(f"   🥦 Vegetables: {veg_count}")
    print(f"   🫘 Legumes:    {legume_count}")


if __name__ == "__main__":
    seed()
