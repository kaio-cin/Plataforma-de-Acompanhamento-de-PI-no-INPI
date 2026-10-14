from collections.abc import Sequence

from fastapi import APIRouter, HTTPException, status

from app.models import Asset
from app.routes.deps import CurrentUser, DbSession, NitUser
from app.schemas.asset import AssetCreate, AssetRead
from app.services import asset_service

router = APIRouter(prefix="/assets", tags=["Ativos"])


@router.get("/", response_model=list[AssetRead], summary="Lista os ativos visíveis ao usuário (US06, US03)")
def list_assets(db: DbSession, user: CurrentUser) -> Sequence[Asset]:
    """Perfil NIT recebe a carteira completa; perfil AUTOR recebe só os ativos vinculados a ele."""
    return asset_service.list_assets_for(db, user)


@router.post(
    "/",
    response_model=AssetRead,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastra um novo ativo (US04) — apenas perfil NIT",
    responses={
        403: {"description": "Usuário sem perfil NIT"},
        409: {"description": "Número de processo já cadastrado"},
        422: {"description": "Dados inválidos ou autor não encontrado"},
    },
)
def create_asset(data: AssetCreate, db: DbSession, _user: NitUser) -> Asset:
    try:
        return asset_service.create_asset(db, data)
    except asset_service.DuplicateProcessError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except asset_service.AuthorNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc
