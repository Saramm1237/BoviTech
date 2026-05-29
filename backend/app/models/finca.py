from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TimestampedModel


class Finca(TimestampedModel):
    __tablename__ = "fincas"

    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    nit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    municipio: Mapped[str | None] = mapped_column(String(100), nullable=True)
    departamento: Mapped[str | None] = mapped_column(String(100), nullable=True)
    umbral_alerta_porcentaje: Mapped[int] = mapped_column(Integer, nullable=False, default=20)
