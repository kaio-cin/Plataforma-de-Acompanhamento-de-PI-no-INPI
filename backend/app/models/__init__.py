"""Importa todos os models para registrá-los no metadata do SQLAlchemy."""

from app.models.asset import Asset
from app.models.enums import AssetType, UserRole
from app.models.user import User

__all__ = ["Asset", "AssetType", "User", "UserRole"]
