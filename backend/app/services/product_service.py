from uuid import UUID

from fastapi import status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..exceptions import AppException
from ..models import DBProduct
from ..schemas import ProductCreate


def get_product_by_id(db: Session, id: UUID):
    return db.query(DBProduct).filter(DBProduct.id == str(id)).first()


def get_product_name_by_id(db: Session, product_id: str):
    stmt = select(DBProduct.name).where(DBProduct.id == product_id)
    product_name = db.scalar(stmt)
    if not product_name:
        raise AppException(
            f"product with id: {product_id} not found", status.HTTP_404_NOT_FOUND
        )

    return product_name


def get_product_by_name(db: Session, name: str):
    return db.query(DBProduct).filter(DBProduct.name == name).first()


def get_products_by_category(db: Session, category: str, skip: int, limit: int):
    return (
        db.query(DBProduct)
        .filter(DBProduct.category == category)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_products(db: Session, skip: int, limit: int):
    return db.query(DBProduct).offset(skip).limit(limit).all()


def create_product(db: Session, product: ProductCreate):
    if get_product_by_name(db, product.name):
        raise AppException(
            f"product with name {product.name} already exists", status.HTTP_409_CONFLICT
        )

    db_product = DBProduct(
        id=str(product.id),
        name=product.name,
        category=product.category,
        description=product.description,
        price=product.price,
        stock=product.stock,
        calories=product.calories,
        carbs=product.calories,
        sugar=product.sugar,
        protein=product.protein,
        fat=product.fat,
        image_url=product.image_url,
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product


def delete_product(db: Session, product_id: UUID):
    db_product = db.query(DBProduct).filter(DBProduct.id == str(product_id)).first()

    if not db_product:
        raise AppException(
            f"Product with id: {product_id} not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    db.delete(db_product)

    db.commit()
