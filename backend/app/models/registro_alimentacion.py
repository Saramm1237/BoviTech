from datetime import date
from decimal import Decimal

from sqlalchemy import CHAR, Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantModel


class RegistroAlimentacion(TenantModel):
    __tablename__ = "registros_alimentacion"

    animal_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("animales.id"), nullable=False, index=True
    )
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    tipo_alimento: Mapped[str] = mapped_column(String(50), nullable=False)  # 'concentrado' | 'forraje' | 'suplemento'
    cantidad_kg: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    operario_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("usuarios.id"), nullable=False, index=True
    )
    sesion_id: Mapped[str | None] = mapped_column(
        CHAR(36), ForeignKey("sesiones_ordeno.id"), nullable=True, index=True
    )
