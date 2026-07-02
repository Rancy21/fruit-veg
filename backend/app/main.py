from typing import Annotated

from fastapi import Depends, FastAPI

from .database import Base, engine
from .routes import auth
from .schemas import User
from .services.user_auth import get_current_active_user

app = FastAPI(title="Fruit-Veg Shop", version="1.0.0")

Base.metadata.create_all(bind=engine)

CurrentUser = Annotated[User, Depends(get_current_active_user)]

app.include_router(auth.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Fruit-Veg"}


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: CurrentUser):
    """Get current active user"""
    return current_user


@app.get("/protected")
async def protected_route(current_user: CurrentUser):
    return {"message": f"Hello {current_user.full_name}, this is a protected route"}
