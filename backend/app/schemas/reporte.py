from datetime import date

from pydantic import BaseModel, Field


class ReporteRequest(BaseModel):
    tipo: str = Field(..., pattern="^(semanal|mensual)$")
    fecha_inicio: date
    fecha_fin: date


class ReporteJobRead(BaseModel):
    job_id: str
    status: str  # "pending" | "ready" | "failed"
