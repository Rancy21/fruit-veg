import logging
import traceback
from typing import Annotated

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.convertors import register_url_convertor

from .database import Base, engine
from .exceptions import AppException
from .routes import auth, order, product
from .routes.auth import DBSession
from .schemas import OrderResponse, User
from .services.order_service import list_orders_by_user
from .services.user_auth import require_role
from .utils import UserRole, UUIDConvertor

app = FastAPI(title="Fruit-Veg Shop", version="1.0.0")

logger = logging.getLogger("uvicorn.error")

Base.metadata.create_all(bind=engine)

CurrentUser = Annotated[User, Depends(require_role([UserRole.USER]))]

register_url_convertor("uuid", UUIDConvertor())

app.include_router(auth.router)
app.include_router(product.router)
app.include_router(order.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Fruit-Veg"}


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: CurrentUser):
    """Get current active user"""
    return current_user


@app.get("/users/me/orders", response_model=list[OrderResponse])
def list_user_orders(
    db: DBSession, current_user: CurrentUser, skip: int = 0, limit: int = 10
):
    return list_orders_by_user(db, current_user.id, skip, limit)


@app.get("/protected")
async def protected_route(current_user: CurrentUser):
    return {"message": f"Hello {current_user.full_name}, this is a protected route"}


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.exception_handler(Exception)
async def common_exception_handler(request: Request, exc: Exception):
    error_traceback = "".join(
        traceback.format_exception(type(exc), exc, exc.__traceback__)
    )

    logger.error(f"Unhandled error happened: {exc}\n{error_traceback}")
    return JSONResponse(
        status_code=500, content={"detail": "An internal server error occured"}
    )
