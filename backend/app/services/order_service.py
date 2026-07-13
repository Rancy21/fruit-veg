from decimal import Decimal

from fastapi import status
from sqlalchemy.orm import Session

from ..exceptions import AppException
from ..models import DBOrder, DBOrderItem, DBProduct
from ..schemas import OrderItemCreate
from ..utils import OrderStatus


def get_order_by_id(db: Session, order_id: int):
    db_order = db.query(DBOrder).filter(DBOrder.id == order_id).first()

    if not db_order:
        raise AppException(f"order: {order_id} not found", status.HTTP_404_NOT_FOUND)

    return db_order


def get_order_by_id_and_user_id(db: Session, order_id: int, user_id: int):
    db_order = (
        db.query(DBOrder)
        .filter(DBOrder.id == order_id, DBOrder.user_id == user_id)
        .first()
    )

    if not db_order:
        raise AppException(f"order: {order_id} not found", status.HTTP_404_NOT_FOUND)

    return db_order


def list_orders_by_user(db: Session, user_id: int, skip: int, limit: int):
    return (
        db.query(DBOrder)
        .filter(DBOrder.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def list_all_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DBOrder).offset(skip).limit(limit).all()


def list_order_items(db: Session, order_id: int):
    return db.query(DBOrderItem).filter(DBOrderItem.order_id == order_id).all()


def list_order_items_by_user_id(db: Session, order_id: int, user_id: int):
    db_order = get_order_by_id_and_user_id(db, order_id, user_id)

    return db.query(DBOrderItem).filter(DBOrderItem.order_id == db_order.id).all()


def cancel_order(db: Session, order_id: int, user_id: int):
    db_order = (
        db.query(DBOrder)
        .filter(DBOrder.id == order_id, DBOrder.user_id == user_id)
        .first()
    )

    if not db_order:
        raise AppException(
            f"order with id: {order_id} and user_id: {user_id} not found",
            status.HTTP_404_NOT_FOUND,
        )

    if db_order.status == OrderStatus.COMPLETED:
        raise AppException(
            f"Cannot cancel order: {order_id}. The order has been completed",
            status.HTTP_409_CONFLICT,
        )
    db_order.status = OrderStatus.CANCELLED

    db.commit()
    db.refresh(db_order)
    return db_order


def admin_cancel_order(db: Session, order_id: int):
    db_order = get_order_by_id(db, order_id)

    if db_order.status == OrderStatus.COMPLETED:
        raise AppException(
            f"Cannot cancel order: {order_id}. The order has been completed",
            status.HTTP_409_CONFLICT,
        )

    db_order.status = OrderStatus.CANCELLED

    db.commit()
    db.refresh(db_order)
    return db_order


def create_order(db: Session, order_items: list[OrderItemCreate], user_id: int):
    db_order = DBOrder(user_id=user_id, status=OrderStatus.PENDING)

    total_price: Decimal = Decimal("0")

    for item in order_items:
        total_price += item.price_at_purchase * item.quantity
        db_order_item = DBOrderItem(
            product_id=item.product_id,
            price_at_purchase=item.price_at_purchase,
            quantity=item.quantity,
        )
        db_order.items.append(db_order_item)

    db_order.total_price = total_price

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order


def set_order_to_completed(db: Session, order_id, user_id: int):
    db_order = (
        db.query(DBOrder)
        .filter(DBOrder.id == order_id, DBOrder.user_id == user_id)
        .first()
    )

    if not db_order:
        raise AppException(
            f"order with id: {order_id} not found", status.HTTP_404_NOT_FOUND
        )

    if db_order.status == OrderStatus.CANCELLED:
        raise AppException(
            f"Cannot complete order: {order_id}. The order has been cancelled",
            status.HTTP_409_CONFLICT,
        )

    for item in db_order.items:
        db_product = db.query(DBProduct).filter(DBProduct.id == item.product_id).first()
        if db_product:
            db_product.quantity -= int(item.quantity)

    db_order.status = OrderStatus.COMPLETED

    db.commit()
    db.refresh(db_order)

    return db_order
