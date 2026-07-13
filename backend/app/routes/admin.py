from typing import Annotated

from fastapi import APIRouter, Depends

from ..routes.auth import DBSession
from ..schemas import OrderResponse
from ..services.order_service import admin_cancel_order, get_order_by_id, list_all_orders, list_order_items
from ..services.user_auth import require_role
from ..utils import UserRole

AdminUser = Annotated[dict, Depends(require_role([UserRole.ADMIN]))]

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/orders", response_model=list[OrderResponse])
async def admin_list_orders(
    db: DBSession, skip: int = 0, limit: int = 100, current_user: AdminUser = None
):
    """List all orders (admin only)"""
    orders = list_all_orders(db, skip, limit)

    return [
        OrderResponse(
            id=order.id,
            user_name=order.user.username,
            total_price=order.total_price,
            status=order.status,
            created_at=order.created_at,
        )
        for order in orders
    ]


@router.get("/orders/{order_id:int}", response_model=OrderResponse)
async def admin_read_order(
    db: DBSession, order_id: int, current_user: AdminUser
):
    """Get any order by ID (admin only)"""
    db_order = get_order_by_id(db, order_id)

    return OrderResponse(
        id=db_order.id,
        user_name=db_order.user.username,
        total_price=db_order.total_price,
        status=db_order.status,
        created_at=db_order.created_at,
    )


@router.get("/orders/{order_id:int}/items")
async def admin_read_order_items(
    db: DBSession, order_id: int, current_user: AdminUser
):
    """Get items for any order (admin only)"""
    get_order_by_id(db, order_id)
    items = list_order_items(db, order_id)

    return [
        {
            "id": item.id,
            "order_id": item.order_id,
            "product_name": item.product.name,
            "quantity": item.quantity,
            "price_at_purchase": item.price_at_purchase,
        }
        for item in items
    ]


@router.patch("/orders/{order_id:int}/cancel", response_model=OrderResponse)
async def admin_cancel_existing_order(
    db: DBSession, order_id: int, current_user: AdminUser
):
    """Cancel any order (admin only)"""
    db_order = admin_cancel_order(db, order_id)

    return OrderResponse(
        id=db_order.id,
        user_name=db_order.user.username,
        total_price=db_order.total_price,
        status=db_order.status,
        created_at=db_order.created_at,
    )
