from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from ..exceptions import AppException
from ..schemas import Product, ProductCreate, User
from ..services.product_service import (
    create_product,
    delete_product,
    get_all_products,
    get_product_by_id,
    get_product_by_name,
    get_products_by_category,
)
from ..services.user_auth import require_role
from ..utils import UserRole
from .auth import DBSession

CurrentUser = Annotated[User, Depends(require_role([UserRole.USER]))]
AdminUser = Annotated[User, Depends(require_role([UserRole.ADMIN]))]

router = APIRouter(prefix="/products")


@router.get("/{product_id:uuid}", response_model=Product)
async def read_product_by_id(db: DBSession, product_id: UUID, current_user: CurrentUser):
    product = get_product_by_id(db, product_id)

    if not product:
        raise AppException(f"product with id {id} not found", status.HTTP_404_NOT_FOUND)

    return product


@router.get("/{product_name:str}", response_model=Product)
async def read_product_by_name(
    db: DBSession, product_name: str, current_user: CurrentUser
):
    product = get_product_by_name(db, product_name)

    if not product:
        raise AppException(
            f"Product with name: {product_name} not found", status.HTTP_404_NOT_FOUND
        )

    return product


@router.get("/category/{category:str}", response_model=list[Product])
async def read_products_by_category(
    db: DBSession, category: str, skip: int = 0, limit: int = 15
):
    return get_products_by_category(db, category, skip, limit)


@router.get("", response_model=list[Product])
async def get_all(db: DBSession, skip: int = 0, limit: int = 15):
    return get_all_products(db, skip, limit)


@router.post("", response_model=Product)
async def register_product(
    db: DBSession, product: ProductCreate, current_user: AdminUser
):
    return create_product(db, product)


@router.delete("/{product_id:uuid}")
async def remove_product(db: DBSession, product_id: UUID, current_user: AdminUser):
    delete_product(db, product_id)
    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"message": "App deleted successfully"}
    )
