from datetime import date

from sqlalchemy import CHAR, Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantModel


class SesionOrdeno(TenantModel):
    __tablename__ = "sesiones_ordeno"

    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    turno: Mapped[str] = mapped_column(String(10), nullable=False)  # 'manana' | 'tarde'
    operario_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("usuarios.id"), nullable=False, index=True
    )
