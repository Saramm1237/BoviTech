from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AnimalBase(BaseModel):
    numero_arete: str = Field(..., min_length=1, max_length=50)
    nombre: str | None = Field(None, max_length=100)
    raza: str | None = Field(None, max_length=100)
    fecha_nacimiento: date | None = None
    fecha_ultimo_parto: date | None = None


class AnimalCreate(AnimalBase):
    pass  # finca_id siempre desde el JWT


class AnimalUpdate(BaseModel):
    nombre: str | None = Field(None, max_length=100)
    raza: str | None = Field(None, max_length=100)
    fecha_nacimiento: date | None = None
    fecha_ultimo_parto: date | None = None


class AnimalRead(AnimalBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    finca_id: str
    activo: bool
    baja_fecha: date | None = None
    baja_motivo: str | None = None
    created_at: datetime
    updated_at: datetime
