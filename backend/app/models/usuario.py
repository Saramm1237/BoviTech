from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantModel


class Usuario(TenantModel):
    __tablename__ = "usuarios"

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(20), nullable=False)  # 'propietario' | 'operario'
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    ver_alertas: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
