import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any, Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND

from ..crud import authenticate_user, get_user_by_username
from ..database import get_db
from ..schemas import User

load_dotenv()

SECRET_KEY = str(os.getenv("SECRET_KEY"))
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set")


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_user(username: str, db: Session):
    """Fetch a user from database"""
    db_user = get_user_by_username(db, username)
    if not db_user:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail="User with this username does not exist",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return db_user


def login_user(username: str, password: str, db: Session):
    user = authenticate_user(db, username, password)
    return user


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
):
    """Retrieve current user from jwt token"""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate Credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user(db=db, username=username)
    if not user:
        raise credentials_exception

    return user


def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]):
    """Get the current active user"""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive User")
    return current_user


def create_access_token(data: dict[str, Any], expire_delta: Optional[timedelta] = None):
    """Create a Jwt access token"""
    to_encode = data.copy()
    if expire_delta:
        expire = datetime.now(timezone.utc) + expire_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
