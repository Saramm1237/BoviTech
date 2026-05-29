from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class SesionCreate(BaseModel):
    fecha: date
    turno: str = Field(..., pattern="^(manana|tarde)$")


class SesionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    finca_id: str
    fecha: date
    turno: str
    operario_id: str
    created_at: datetime
    updated_at: datetime


class RegistroProduccionCreate(BaseModel):
    animal_id: str
    volumen_litros: float = Field(..., gt=0, description="Litros con un decimal")


class RegistroProduccionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    finca_id: str
    sesion_id: str
    animal_id: str
    fecha: date
    turno: str
    volumen_litros: float
    operario_id: str
    created_at: datetime


class ProduccionDiariaRead(BaseModel):
    fecha: date
    total_litros: float
