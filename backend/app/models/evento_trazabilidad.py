from datetime import datetime
from uuid import uuid4

from sqlalchemy import CHAR, DateTime, ForeignKey, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class EventoTrazabilidad(Base):
    """Append-only: sin updated_at — cumplimiento ICA 017."""
    __tablename__ = "eventos_trazabilidad"

    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid4())
    )
    finca_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("fincas.id"), nullable=False, index=True
    )
    animal_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("animales.id"), nullable=False, index=True
    )
    tipo_evento: Mapped[str] = mapped_column(String(50), nullable=False)
    datos_evento: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    responsable_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("usuarios.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # NUNCA agregar updated_at — tabla append-only por diseño (ICA 017)
