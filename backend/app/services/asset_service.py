"""Regras de negócio da carteira de ativos, independentes da camada HTTP."""

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models import Asset, User, UserRole
from app.schemas.asset import AssetCreate
from app.services.auth_service import get_user_by_email


class AssetServiceError(Exception):
    """Erro de regra de negócio, com mensagem pronta para o usuário."""


class DuplicateProcessError(AssetServiceError):
    pass


class AuthorNotFoundError(AssetServiceError):
    pass


def list_assets_for(db: Session, user: User) -> Sequence[Asset]:
    """NIT vê a carteira inteira; AUTOR vê apenas os ativos vinculados a ele (US03, US06)."""
    query = select(Asset).options(selectinload(Asset.author_user)).order_by(Asset.deposit_date.desc(), Asset.id.desc())
    if user.role != UserRole.NIT:
        query = query.where(Asset.author_user_id == user.id)
    return db.scalars(query).all()


def create_asset(db: Session, data: AssetCreate) -> Asset:
    """Cadastra um novo ativo (US04), opcionalmente vinculando um autor (US07)."""
    if db.scalar(select(Asset.id).where(Asset.process_number == data.process_number)) is not None:
        raise DuplicateProcessError(f"Já existe um ativo cadastrado com o processo {data.process_number}.")

    author_user = None
    if data.author_email:
        author_user = get_user_by_email(db, data.author_email)
        if author_user is None or author_user.role != UserRole.AUTOR:
            raise AuthorNotFoundError(f"Nenhum usuário com perfil AUTOR encontrado com o e-mail {data.author_email}.")

    asset = Asset(**data.model_dump(exclude={"author_email"}), author_user=author_user)
    db.add(asset)
    try:
        db.commit()
    except IntegrityError as exc:
        # Cobre a corrida entre a checagem acima e o INSERT (duas requisições simultâneas).
        db.rollback()
        raise DuplicateProcessError(f"Já existe um ativo cadastrado com o processo {data.process_number}.") from exc
    db.refresh(asset)
    return asset
