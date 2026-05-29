from datetime import datetime

from sqlalchemy import CHAR, Boolean, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantModel


class Alerta(TenantModel):
    __tablename__ = "alertas"

    animal_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("animales.id"), nullable=False, index=True
    )
    tipo_alerta: Mapped[str] = mapped_column(String(50), nullable=False)  # 'caida_produccion' | 'sin_registro_24h'
    nivel: Mapped[str] = mapped_column(String(20), nullable=False)  # 'critico' | 'advertencia'
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    revisada: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fecha_revision: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revisada_por_id: Mapped[str | None] = mapped_column(
        CHAR(36), ForeignKey("usuarios.id"), nullable=True
    )
    datos_extra: Mapped[dict | None] = mapped_column(JSON, nullable=True)
