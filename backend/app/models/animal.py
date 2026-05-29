from datetime import date

from sqlalchemy import Boolean, Date, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantModel


class Animal(TenantModel):
    __tablename__ = "animales"
    __table_args__ = (
        UniqueConstraint("numero_arete", "finca_id", name="uq_animales_arete_finca"),
    )

    numero_arete: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre: Mapped[str | None] = mapped_column(String(100), nullable=True)
    raza: Mapped[str | None] = mapped_column(String(100), nullable=True)
    fecha_nacimiento: Mapped[date | None] = mapped_column(Date, nullable=True)
    fecha_ultimo_parto: Mapped[date | None] = mapped_column(Date, nullable=True)
    rfid_tag: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Fase 2
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    baja_fecha: Mapped[date | None] = mapped_column(Date, nullable=True)
    baja_motivo: Mapped[str | None] = mapped_column(String(200), nullable=True)
