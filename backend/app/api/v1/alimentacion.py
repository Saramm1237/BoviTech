from datetime import date as date_type

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.api.deps import AnyAuthUser, CurrentFincaId, DbSession
from app.models.animal import Animal
from app.models.registro_alimentacion import RegistroAlimentacion
from app.schemas.alimentacion import (
    AlimentacionCreate,
    AlimentacionRead,
    GrupoAlimentacionCreate,
)

router = APIRouter(prefix="/alimentacion", tags=["Alimentación"])


@router.get("/", response_model=list[AlimentacionRead])
def list_alimentacion(
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
    fecha: date_type | None = Query(default=None),
    animal_id: str | None = Query(default=None),
):
    stmt = select(RegistroAlimentacion).where(RegistroAlimentacion.finca_id == finca_id)
    if fecha:
        stmt = stmt.where(RegistroAlimentacion.fecha == fecha)
    if animal_id:
        stmt = stmt.where(RegistroAlimentacion.animal_id == animal_id)
    stmt = stmt.order_by(RegistroAlimentacion.fecha.desc(), RegistroAlimentacion.created_at.desc())
    return db.scalars(stmt).all()


@router.post("/", response_model=AlimentacionRead, status_code=status.HTTP_201_CREATED)
def create_alimentacion(
    payload: AlimentacionCreate,
    db: DbSession,
    current_user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    _verificar_animal(db, payload.animal_id, finca_id)

    record = RegistroAlimentacion(
        finca_id=finca_id,
        animal_id=payload.animal_id,
        fecha=payload.fecha,
        tipo_alimento=payload.tipo_alimento,
        cantidad_kg=payload.cantidad_kg,
        operario_id=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/grupo", response_model=list[AlimentacionRead], status_code=status.HTTP_201_CREATED)
def create_alimentacion_grupo(
    payload: GrupoAlimentacionCreate,
    db: DbSession,
    current_user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    # Verificar todos los animales pertenecen a la finca
    for animal_id in payload.animal_ids:
        _verificar_animal(db, animal_id, finca_id)

    # Determinar cantidades individuales
    if payload.cantidades_individuales:
        kg_map = {item.animal_id: item.cantidad_kg for item in payload.cantidades_individuales}
    else:
        kg_igualado = round(payload.cantidad_kg_total / len(payload.animal_ids), 3)
        kg_map = {animal_id: kg_igualado for animal_id in payload.animal_ids}

    records = []
    for animal_id in payload.animal_ids:
        kg = kg_map.get(animal_id, payload.cantidad_kg_total / len(payload.animal_ids))
        record = RegistroAlimentacion(
            finca_id=finca_id,
            animal_id=animal_id,
            fecha=payload.fecha,
            tipo_alimento=payload.tipo_alimento,
            cantidad_kg=kg,
            operario_id=current_user.id,
        )
        db.add(record)
        records.append(record)

    db.commit()
    for r in records:
        db.refresh(r)
    return records


# ── Helper ─────────────────────────────────────────────────────────────────────

def _verificar_animal(db, animal_id: str, finca_id: str) -> None:
    animal = db.scalar(select(Animal).where(Animal.id == animal_id, Animal.finca_id == finca_id))
    if animal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Animal {animal_id} no encontrado en la finca",
        )
