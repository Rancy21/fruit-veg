from typing import Annotated

from fastapi import APIRouter, Depends, status

from ..exceptions import AppException
from ..models import DBProduct
from ..routes.auth import DBSession
from ..schemas import SearchRequest, User
from ..services.ai_search import ai_search
from ..services.user_auth import require_role
from ..utils import UserRole

# current_user: Annotated[User, Depends(require_role([UserRole.USER]))]
router = APIRouter(tags=["AI Search"])
@router.post("/search")
async def search_products(body: SearchRequest, db:DBSession):
    if not body.query.strip():
        raise AppException("Query cannot be empty", status.HTTP_400_BAD_REQUEST)

    all_products = db.query(DBProduct).all()

    matched_ids = await ai_search(body.query, all_products)

    # Look up matched products — trust the DB, not the AI
    product_map ={p.id: p for p in all_products}

    # Preserve relevance ordering and guard against hallucinations

    results = [product_map[i] for i in matched_ids if i in product_map]

    return {"results": results, "query": body.query}
