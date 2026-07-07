from typing import Annotated

from fastapi import APIRouter, Depends

from ..routes.auth import DBSession
from ..schemas import OrderItem, OrderItemCreate, OrderResponse, User
from ..services import order_service
from ..services.product_service import get_product_name_by_id
from ..services.user_auth import require_role
from ..services.user_crud import get_username_by_id
from ..utils import UserRole

CurrentUser = Annotated[User, Depends(require_role([UserRole.USER]))]

router = APIRouter(prefix="/orders")


@router.get("/{order_id:int}", response_model=OrderResponse)
async def read_order_by_id(db: DBSession, order_id: int, current_user: CurrentUser):
    db_order = order_service.get_order_by_id_and_user_id(db, order_id, current_user.id)
    user_name = get_username_by_id(db, db_order.user_id)

    return OrderResponse(
        user_name=user_name,
        total_price=db_order.total_price,
        status=db_order.status,
        created_at=db_order.created_at,
    )


@router.get("/{order_id:int}/items", response_model=list[OrderItem])
async def get_order_items(db: DBSession, order_id: int, current_user: CurrentUser):
    order_items: list[OrderItem] = []
    db_items = order_service.list_order_items_by_user_id(db, order_id, current_user.id)

    for item in db_items:
        product_name = get_product_name_by_id(db, item.product_id)

        order_item = OrderItem(
            id=item.id,
            order_id=item.order_id,
            product_name=product_name,
            quantity=item.quantity,
            price_at_purchase=item.price_at_purchase,
        )

        order_items.append(order_item)

    return order_items


@router.post("", response_model=OrderResponse)
async def register_order(
    db: DBSession, order_items: list[OrderItemCreate], current_user: CurrentUser
):
    db_order = order_service.create_order(db, order_items, current_user.id)

    user_name = get_username_by_id(db, db_order.user_id)

    return OrderResponse(
        user_name=user_name,
        total_price=db_order.total_price,
        status=db_order.status,
        created_at=db_order.created_at,
    )


@router.patch("/{order_id:int}/cancel", response_model=OrderResponse)
async def cancel_order(db: DBSession, order_id: int, current_user: CurrentUser):
    db_order = order_service.cancel_order(db, order_id, current_user.id)

    user_name = get_username_by_id(db, db_order.user_id)

    return OrderResponse(
        user_name=user_name,
        total_price=db_order.total_price,
        status=db_order.status,
        created_at=db_order.created_at,
    )


@router.patch("/{order_id:int}/complete", response_model=OrderResponse)
async def complete_order(db: DBSession, order_id: int, current_user: CurrentUser):
    db_order = order_service.set_order_to_completed(db, order_id, current_user.id)

    user_name = get_username_by_id(db, db_order.user_id)

    return OrderResponse(
        user_name=user_name,
        total_price=db_order.total_price,
        status=db_order.status,
        created_at=db_order.created_at,
    )
