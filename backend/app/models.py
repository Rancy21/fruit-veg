import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from .database import Base

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("role_id", Integer, ForeignKey("roles.id")),
)


class DBUser(Base):
    __tablename__: str = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    phone_number = Column(String, nullable=True)
    location = Column(String, nullable=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    roles = relationship("DBRole", secondary=user_roles, back_populates="users")


class DBRole(Base):
    __tablename__: str = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str] = mapped_column(String)

    users = relationship("DBUser", secondary=user_roles, back_populates="roles")


class DBProduct(Base):
    __tablename__: str = "products"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, index=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    category: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String)
    price: Mapped[Decimal] = mapped_column(Numeric, index=True)
    stock: Mapped[int] = mapped_column(Integer)
    calories: Mapped[Decimal] = mapped_column(Numeric, nullable=True)
    carbs: Mapped[Decimal] = mapped_column(Numeric, nullable=True)
    sugar: Mapped[Decimal] = mapped_column(Numeric, nullable=True)
    protein: Mapped[Decimal] = mapped_column(Numeric, nullable=True)
    fat: Mapped[Decimal] = mapped_column(Numeric, nullable=True)
    image_url: Mapped[str] = mapped_column(String, nullable=True)


class DBOrder(Base):
    __tablename__: str = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    total_price: Mapped[Decimal] = mapped_column(Numeric)
    status: Mapped[str] = mapped_column(String, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user = relationship("DBUser")
    items = relationship("DBOrderItem", back_populates="order")


class DBOrderItem(Base):
    __tablename__: str = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id: Mapped[str] = mapped_column(
        String, ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric)
    price_at_purchase: Mapped[Decimal] = mapped_column(Numeric)

    product = relationship("DBProduct")
    order = relationship("DBOrder", back_populates="items")


class PaymentStatus(str, PyEnum):
    """Payment status enum"""
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESSFUL = "successful"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DBPayment(Base):
    """Payment model for tracking Flutterwave payments"""
    __tablename__: str = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    flutterwave_charge_id = Column(String, nullable=True, index=True)
    flutterwave_customer_id = Column(String, nullable=True)
    payment_method_id = Column(String, nullable=True)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    reference = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    payment_metadata = Column(JSONB, nullable=True)

    # Relationships
    order = relationship("DBOrder", backref="payment")
