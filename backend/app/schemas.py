from typing import Optional

from pydantic import BaseModel


class User(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    disabled: Optional[bool] = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str


class Product(BaseModel):
    id: int
    name: str
    category: str
    description: str
    price: float
    stock: float

    class Config:
        from_attributes = True


class ProductCreatee(BaseModel):
    name: str
    category: str
    description: str
    price: float
    stock: float
