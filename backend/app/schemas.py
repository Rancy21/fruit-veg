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
