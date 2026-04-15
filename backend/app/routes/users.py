from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import User
from app.schemas import UserCreate, UserLogin, UserRead
from app.security import (
    hash_password,
    sanitize_email,
    sanitize_text,
    verify_password,
)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    session: Session = Depends(get_session),
) -> User:
    email = sanitize_email(payload.email)
    exists = session.exec(select(User).where(User.email == email)).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese correo.",
        )

    user = User(
        full_name=sanitize_text(payload.full_name, max_length=120),
        email=email,
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=UserRead)
def login_user(
    payload: UserLogin,
    session: Session = Depends(get_session),
) -> User:
    email = sanitize_email(payload.email)
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña inválidos.",
        )

    # Compatibilidad con usuarios creados antes del campo password_hash:
    # al primer login asignamos la contraseña ingresada y migramos el registro.
    if not user.password_hash:
        user.password_hash = hash_password(payload.password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña inválidos.",
        )
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session)) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return user
