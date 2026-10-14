from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.models import User
from app.routes.deps import CurrentUser, DbSession
from app.schemas.auth import LoginRequest, TokenResponse, UserRead
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticação"])

_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="E-mail ou senha incorretos.",
    headers={"WWW-Authenticate": "Bearer"},
)


def _token_response(user: User) -> TokenResponse:
    return TokenResponse(access_token=auth_service.issue_token(user), user=UserRead.model_validate(user))


@router.post("/login", response_model=TokenResponse, summary="Login com e-mail e senha (US01, US02)")
def login(credentials: LoginRequest, db: DbSession) -> TokenResponse:
    """Recebe JSON com e-mail e senha e devolve o token JWT com o perfil do usuário."""
    user = auth_service.authenticate(db, credentials.email, credentials.password)
    if user is None:
        raise _INVALID_CREDENTIALS
    return _token_response(user)


@router.post(
    "/token",
    response_model=TokenResponse,
    summary="Login via formulário OAuth2 (usado pelo botão Authorize do Swagger)",
)
def login_form(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession) -> TokenResponse:
    # No formulário OAuth2 o campo se chama "username"; aqui ele recebe o e-mail.
    user = auth_service.authenticate(db, form.username, form.password)
    if user is None:
        raise _INVALID_CREDENTIALS
    return _token_response(user)


@router.get("/me", response_model=UserRead, summary="Dados do usuário logado")
def read_current_user(user: CurrentUser) -> User:
    return user
