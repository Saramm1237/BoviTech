from datetime import date
from decimal import Decimal

from sqlalchemy import CHAR, Date, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantModel


class RegistroProduccion(TenantModel):
    __tablename__ = "registros_produccion"
    __table_args__ = (
        UniqueConstraint("animal_id", "fecha", "turno", name="uq_produccion_animal_dia_turno"),
    )

    sesion_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("sesiones_ordeno.id"), nullable=False, index=True
    )
    animal_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("animales.id"), nullable=False, index=True
    )
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    turno: Mapped[str] = mapped_column(String(10), nullable=False)  # 'manana' | 'tarde'
    volumen_litros: Mapped[Decimal] = mapped_column(Numeric(6, 1), nullable=False)
    operario_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("usuarios.id"), nullable=False, index=True
    )
