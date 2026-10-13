from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.asset import Asset


class User(Base):
    """Usuário do sistema: membro da equipe do NIT ou autor/inventor."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        # native_enum=False grava o valor como texto + CHECK constraint,
        # funcionando igual no SQLite e no PostgreSQL.
        SAEnum(
            UserRole,
            name="user_role",
            native_enum=False,
            create_constraint=True,
            values_callable=lambda enum: [member.value for member in enum],
            length=20,
        ),
        default=UserRole.AUTOR,
    )

    # Ativos em que este usuário está vinculado como autor com acesso de acompanhamento (US07).
    assets: Mapped[list[Asset]] = relationship(back_populates="author_user")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role.value}>"
