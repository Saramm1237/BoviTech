from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AlimentacionCreate(BaseModel):
    fecha: date
    animal_id: str
    tipo_alimento: str = Field(..., pattern="^(concentrado|forraje|suplemento)$")
    cantidad_kg: float = Field(..., gt=0)


class ItemGrupo(BaseModel):
    animal_id: str
    cantidad_kg: float = Field(..., gt=0)


class GrupoAlimentacionCreate(BaseModel):
    fecha: date
    animal_ids: list[str] = Field(..., min_length=1)
    tipo_alimento: str = Field(..., pattern="^(concentrado|forraje|suplemento)$")
    cantidad_kg_total: float = Field(..., gt=0)
    cantidades_individuales: list[ItemGrupo] | None = None


class AlimentacionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    finca_id: str
    animal_id: str
    fecha: date
    tipo_alimento: str
    cantidad_kg: float
    operario_id: str
    sesion_id: str | None = None
    created_at: datetime


class EficienciaRead(BaseModel):
    fecha: date
    litros_producidos: float | None
    kg_alimento: float | None
    eficiencia_litros_por_kg: float | None  # null si falta cualquiera de los dos
