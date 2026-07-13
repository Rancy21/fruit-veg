from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette import status

from ..exceptions import AppException
from ..models import DBRole, DBUser
from ..schemas import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_id(db: Session, user_id: int):
    return db.query(DBUser).filter(DBUser.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(DBUser).filter(DBUser.username == username).first()


def get_username_by_id(db: Session, user_id: int):
    stmt = select(DBUser.username).where(DBUser.id == user_id)
    username = db.scalar(stmt)

    if not username:
        raise AppException(
            f"user with id: {user_id} not found", status.HTTP_404_NOT_FOUND
        )

    return username


def get_user_by_email(db: Session, email: str):
    """Get user by email."""
    return db.query(DBUser).filter(DBUser.email == email).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)

    if get_user_by_username(db, user.username):
        raise AppException("Username already registered", status.HTTP_409_CONFLICT)
    if get_user_by_email(db, user.email):
        raise AppException("Email already registered", status.HTTP_409_CONFLICT)

    db_user = DBUser(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        location=user.location,
        hashed_password=hashed_password,
    )

    user_role = get_role_by_name(db, "user")
    if not user_role:
        user_role = create_role(db, "user", "Regular User")

    db_user.roles.append(user_role)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)

    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False

    return user


def create_role(db: Session, name: str, description: str = ""):
    db_role = DBRole(name=name, description=description)

    db.add(db_role)
    db.commit()
    db.refresh(db_role)

    return db_role


def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DBUser).offset(skip).limit(limit).all()


def get_role_by_name(db: Session, name: str):
    return db.query(DBRole).filter(DBRole.name == name).first()


def get_user_roles(db: Session, username: str) -> list[DBRole]:
    db_user = get_user_by_username(db, username)

    if not db_user:
        raise AppException(f"User: {username} not found", status.HTTP_404_NOT_FOUND)

    return db_user.roles
