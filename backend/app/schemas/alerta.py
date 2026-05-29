from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AlertaRead(BaseModel):
    id: str
    finca_id: str
    animal_id: str
    tipo_alerta: str
    nivel: str
    mensaje: str
    revisada: bool
    fecha_revision: datetime | None
    datos_extra: dict | None
    created_at: datetime
    animal_nombre: str | None = None
    animal_numero_arete: str | None = None


class AlertaConfigUpdate(BaseModel):
    umbral_porcentaje: int = Field(..., ge=10, le=50)


class AlertaConfigRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    umbral_alerta_porcentaje: int
