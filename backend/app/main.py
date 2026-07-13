import logging
import traceback
from typing import Annotated

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware import cors
from starlette.convertors import register_url_convertor

from .routes import search

from .database import Base, engine
from .exceptions import AppException
from .routes import admin, auth, order, product
from .routes.auth import DBSession
from .schemas import OrderResponse, PasswordChange, User, UserUpdate
from .services.order_service import list_orders_by_user
from .services.user_crud import change_password, update_user
from .services.user_auth import require_role
from .utils import UserRole, UUIDConvertor

app = FastAPI(title="Fruit-Veg Shop", version="1.0.0")

logger = logging.getLogger("uvicorn.error")

Base.metadata.create_all(bind=engine)

CurrentUser = Annotated[User, Depends(require_role([UserRole.USER]))]

register_url_convertor("uuid", UUIDConvertor())

app.add_middleware(cors.CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_headers=["*"], allow_methods=["*"])

app.include_router(auth.router)
app.include_router(product.router)
app.include_router(order.router)
app.include_router(search.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Fruit-Veg"}


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: CurrentUser):
    """Get current active user"""
    return current_user


@app.patch("/users/me", response_model=User)
async def update_users_me(
    db: DBSession, data: UserUpdate, current_user: CurrentUser
):
    """Update current user's profile information"""
    return update_user(db, current_user.id, data)


@app.patch("/users/me/password")
async def update_users_password(
    db: DBSession, data: PasswordChange, current_user: CurrentUser
):
    """Change current user's password"""
    change_password(db, current_user.id, data)
    return {"message": "Password updated successfully"}


@app.get("/users/me/orders", response_model=list[OrderResponse])
def list_user_orders(
    db: DBSession, current_user: CurrentUser, skip: int = 0, limit: int = 10
):
    db_orders = list_orders_by_user(db, current_user.id, skip, limit)

    results = []
    for db_order in db_orders:
        response = OrderResponse(
            id=db_order.id,
            user_name=db_order.user.username,
            total_price=db_order.total_price,
            status=db_order.status,
            created_at=db_order.created_at,
        )
        results.append(response)

    return results


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
