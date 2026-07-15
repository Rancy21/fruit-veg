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
    phone_number: Optional[str] = None
    location: Optional[str] = None
    disabled: Optional[bool] = None

    roles: list[UserRole]

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    phone_number: Optional[str] = None
    location: Optional[str] = None


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    location: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


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
    id: int
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


class SearchRequest(BaseModel):
    query:str


# Payment Schemas
class PaymentStatus(str):
    """Payment status enum for API responses"""
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESSFUL = "successful"
    FAILED = "failed"
    CANCELLED = "cancelled"


class InitiatePaymentRequest(BaseModel):
    """Request to initiate a payment"""
    order_id: int
    email: str
    first_name: str
    last_name: str
    phone: str
    card_number: str
    exp_month: str
    exp_year: str
    cvv: str
    currency: Optional[str] = "USD"


class InitiatePaymentResponse(BaseModel):
    """Response after initiating a payment"""
    payment_id: uuid.UUID
    reference: str
    status: str
    amount: Decimal
    currency: str
    redirect_url: Optional[str] = None
    message: Optional[str] = None


class PaymentStatusResponse(BaseModel):
    """Payment status response"""
    id: uuid.UUID
    order_id: int
    amount: Decimal
    currency: str
    status: str
    reference: str
    flutterwave_charge_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CardDetails(BaseModel):
    """Card details for payment"""
    card_number: str
    exp_month: str
    exp_year: str
    cvv: str


class WebhookPayload(BaseModel):
    """Flutterwave webhook payload"""
    event: str
    data: dict
