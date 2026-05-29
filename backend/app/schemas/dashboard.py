from datetime import datetime

from pydantic import BaseModel


class AnimalRankingItem(BaseModel):
    animal_id: str
    numero_arete: str
    nombre: str | None
    litros_hoy: float


class DashboardRead(BaseModel):
    produccion_hoy_litros: float | None  # null cuando no hay registros hoy
    produccion_7_dias_litros: float
    alertas_activas_count: int
    top_5_mayor: list[AnimalRankingItem]
    top_5_menor: list[AnimalRankingItem]
    ultimo_registro_at: datetime | None
