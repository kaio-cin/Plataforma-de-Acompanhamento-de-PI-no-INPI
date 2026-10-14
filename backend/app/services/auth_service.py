"""Regras de autenticação, independentes da camada HTTP."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models import User

# Hash usado quando o e-mail não existe, para o tempo de resposta não revelar
# quais e-mails estão cadastrados.
_DUMMY_HASH = hash_password("senha-inexistente")


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.strip().lower()))


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if user is None:
        verify_password(password, _DUMMY_HASH)
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def issue_token(user: User) -> str:
    return create_access_token(user.id, {"role": user.role.value, "email": user.email})
