from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: UserRole


class TokenResponse(BaseModel):
    """Resposta do login: token JWT + dados do usuário para o frontend montar a sessão."""

    access_token: str
    token_type: str = "bearer"
    user: UserRead
