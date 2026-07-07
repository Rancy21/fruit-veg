from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import User, UserCreate
from ..services.user_auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    login_user,
)
from ..services.user_crud import create_user

DBSession = Annotated[Session, Depends(get_db)]


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=User)
async def register(user: UserCreate, db: DBSession):
    return create_user(db=db, user=user)


@router.post("/token")
async def login_for_accesstoken(
    db: DBSession, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """Authenticate user and return access token"""

    user = login_user(db=db, username=form_data.username, password=form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expire = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": form_data.username},
        expire_delta=access_token_expire,
    )

    return {"access_token": access_token, "token_type": "Bearer"}
