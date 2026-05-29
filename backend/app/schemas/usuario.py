from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioCreate(BaseModel):
    email: EmailStr
    nombre: str = Field(..., min_length=1, max_length=200)
    password: str = Field(..., min_length=8)
    rol: str = Field(default="operario", pattern="^operario$")


class UsuarioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    finca_id: str
    email: str
    nombre: str
    rol: str
    activo: bool
    ver_alertas: bool
    created_at: datetime
