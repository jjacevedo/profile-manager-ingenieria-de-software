import re
from html import escape
from typing import Optional

from fastapi import Header, HTTPException, status


def sanitize_text(value: str, *, max_length: int = 1200) -> str:
    cleaned = "".join(ch for ch in value if ch.isprintable())
    cleaned = escape(cleaned.strip())
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned[:max_length]


def sanitize_email(value: str) -> str:
    cleaned = sanitize_text(value, max_length=120).lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", cleaned):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Correo electrónico inválido.",
        )
    return cleaned


def auth_placeholder(x_user_id: Optional[str] = Header(default=None)) -> Optional[int]:
    if x_user_id is None:
        return None
    if not x_user_id.isdigit():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Header X-User-Id inválido.")
    return int(x_user_id)
