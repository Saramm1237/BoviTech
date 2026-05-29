from datetime import datetime

from pydantic import BaseModel


class EventoTrazabilidadRead(BaseModel):
    id: str
    tipo_evento: str
    datos_evento: dict
    responsable_nombre: str
    created_at: datetime
