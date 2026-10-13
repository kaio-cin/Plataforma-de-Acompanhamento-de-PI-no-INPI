"""Configurações da aplicação, lidas de variáveis de ambiente ou do arquivo .env."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Sistema de Acompanhamento de PI no INPI"
    api_prefix: str = "/api"

    # SQLite no MVP. Para PostgreSQL, basta trocar a URL:
    # postgresql+psycopg://usuario:senha@host:5432/pi_inpi
    database_url: str = "sqlite:///./pi_inpi.db"

    # JWT — em produção, defina JWT_SECRET_KEY no .env com um valor longo e aleatório.
    jwt_secret_key: str = "dev-secret-troque-em-producao"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8

    # Origens autorizadas a chamar a API (frontend Vite em desenvolvimento).
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
