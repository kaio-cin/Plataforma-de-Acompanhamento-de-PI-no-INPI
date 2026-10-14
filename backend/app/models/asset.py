from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import AssetType

if TYPE_CHECKING:
    from app.models.user import User


class Asset(Base):
    """Ativo de propriedade intelectual acompanhado junto ao INPI (US04)."""

    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    asset_type: Mapped[AssetType] = mapped_column(
        SAEnum(
            AssetType,
            name="asset_type",
            native_enum=False,
            create_constraint=True,
            values_callable=lambda enum: [member.value for member in enum],
            length=40,
        )
    )
    # Número do processo no INPI (ex.: "BR 10 2023 001234-5"). É a chave usada
    # no cruzamento com os despachos da RPI (Step 3), por isso é único e indexado.
    process_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    deposit_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(100))
    # Nomes dos inventores/autores conforme o depósito, separados por vírgula.
    authors: Mapped[str] = mapped_column(String(1000))

    # Autor com acesso de acompanhamento ao processo (opcional — US07).
    # SET NULL: se o usuário for removido, o ativo continua cadastrado.
    author_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True, default=None
    )
    author_user: Mapped[User | None] = relationship(back_populates="assets")

    @property
    def author_email(self) -> str | None:
        """E-mail do autor vinculado, exposto diretamente na resposta da API."""
        return self.author_user.email if self.author_user else None

    def __repr__(self) -> str:
        return f"<Asset id={self.id} process={self.process_number!r} type={self.asset_type.value}>"
