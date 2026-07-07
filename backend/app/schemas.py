import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel
from pydantic.fields import Field


class UserRole(BaseModel):
    name: str

    class Config:
        from_attributes = True


class User(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    disabled: Optional[bool] = None

    roles: list[UserRole]

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str


class Product(BaseModel):
    id: str
    name: str
    category: str
    description: str
    price: float
    stock: int
    calories: Optional[float] = None
    carbs: Optional[float] = None
    sugar: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str
    category: str
    description: str
    price: float
    stock: int
    calories: Optional[float] = None
    carbs: Optional[float] = None
    sugar: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    image_url: Optional[str] = None


class OrderItemCreate(BaseModel):
    order_id: int
    product_id: str
    price_at_purchase: Decimal
    quantity: Decimal


class OrderResponse(BaseModel):
    user_name: str
    total_price: Decimal
    status: str
    created_at: datetime


class OrderItem(BaseModel):
    id: int
    order_id: int
    product_name: str
    quantity: Decimal
    price_at_purchase: Decimal
