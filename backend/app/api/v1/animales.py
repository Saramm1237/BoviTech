from datetime import date, timedelta

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.api.deps import AnyAuthUser, CurrentFincaId, DbSession, PropietarioOnly
from app.models.animal import Animal
from app.models.registro_alimentacion import RegistroAlimentacion
from app.models.registro_produccion import RegistroProduccion
from app.schemas.alimentacion import EficienciaRead
from app.schemas.animal import AnimalCreate, AnimalRead, AnimalUpdate
from app.schemas.produccion import ProduccionDiariaRead
from app.schemas.trazabilidad import EventoTrazabilidadRead
from app.services.trazabilidad_service import write_evento
from app.models.evento_trazabilidad import EventoTrazabilidad
from app.models.usuario import Usuario

router = APIRouter(prefix="/animales", tags=["Animales"])


@router.get("/", response_model=list[AnimalRead])
def list_animales(
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
    solo_activos: bool = Query(default=True),
):
    stmt = select(Animal).where(Animal.finca_id == finca_id)
    if solo_activos:
        stmt = stmt.where(Animal.activo.is_(True))
    stmt = stmt.order_by(Animal.numero_arete)
    return db.scalars(stmt).all()


@router.get("/{animal_id}", response_model=AnimalRead)
def get_animal(
    animal_id: str,
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    return _get_or_404(db, animal_id, finca_id)


@router.post("/", response_model=AnimalRead, status_code=status.HTTP_201_CREATED)
def create_animal(
    payload: AnimalCreate,
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    animal = Animal(**payload.model_dump(), finca_id=finca_id)
    db.add(animal)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un animal con este número de arete en la finca",
        )
    db.refresh(animal)
    return animal


@router.patch("/{animal_id}", response_model=AnimalRead)
def update_animal(
    animal_id: str,
    payload: AnimalUpdate,
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    animal = _get_or_404(db, animal_id, finca_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(animal, field, value)
    db.commit()
    db.refresh(animal)
    return animal


@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_animal(
    animal_id: str,
    db: DbSession,
    current_user: PropietarioOnly,
    finca_id: CurrentFincaId,
    baja_motivo: str = Query(default="Sin motivo especificado", max_length=200),
):
    animal = _get_or_404(db, animal_id, finca_id)
    today = date.today()
    animal.activo = False
    animal.baja_fecha = today
    animal.baja_motivo = baja_motivo
    write_evento(
        db,
        finca_id=finca_id,
        animal_id=animal_id,
        tipo_evento="baja",
        datos_evento={"motivo": baja_motivo, "fecha_baja": str(today)},
        responsable_id=current_user.id,
    )
    db.commit()


# ── GET /animales/{id}/produccion — tendencia diaria ─────────────────────────

@router.get("/{animal_id}/produccion", response_model=list[ProduccionDiariaRead])
def get_produccion_animal(
    animal_id: str,
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
    periodo: str = Query(default="30d"),
):
    _get_or_404(db, animal_id, finca_id)

    try:
        days = int(periodo.rstrip("d"))
    except ValueError:
        days = 30
    cutoff = date.today() - timedelta(days=days)

    rows = db.execute(
        select(
            RegistroProduccion.fecha,
            func.sum(RegistroProduccion.volumen_litros).label("total_litros"),
        )
        .where(RegistroProduccion.animal_id == animal_id, RegistroProduccion.fecha >= cutoff)
        .group_by(RegistroProduccion.fecha)
        .order_by(RegistroProduccion.fecha)
    ).all()

    return [{"fecha": r.fecha, "total_litros": float(r.total_litros)} for r in rows]


# ── GET /animales/{id}/trazabilidad — historial cronológico ──────────────────

@router.get("/{animal_id}/trazabilidad", response_model=list[EventoTrazabilidadRead])
def get_trazabilidad(
    animal_id: str,
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    _get_or_404(db, animal_id, finca_id)
    rows = db.execute(
        select(EventoTrazabilidad, Usuario.nombre.label("responsable_nombre"))
        .join(Usuario, EventoTrazabilidad.responsable_id == Usuario.id)
        .where(
            EventoTrazabilidad.animal_id == animal_id,
            EventoTrazabilidad.finca_id == finca_id,
        )
        .order_by(EventoTrazabilidad.created_at.asc())
    ).all()
    return [
        EventoTrazabilidadRead(
            id=e.id,
            tipo_evento=e.tipo_evento,
            datos_evento=e.datos_evento,
            responsable_nombre=nombre,
            created_at=e.created_at,
        )
        for e, nombre in rows
    ]


# ── GET /animales/{id}/eficiencia — eficiencia alimenticia por día ───────────

@router.get("/{animal_id}/eficiencia", response_model=EficienciaRead)
def get_eficiencia_animal(
    animal_id: str,
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
    fecha: date = Query(default_factory=date.today),
):
    _get_or_404(db, animal_id, finca_id)

    litros = db.scalar(
        select(func.sum(RegistroProduccion.volumen_litros)).where(
            RegistroProduccion.animal_id == animal_id,
            RegistroProduccion.fecha == fecha,
        )
    )
    kg = db.scalar(
        select(func.sum(RegistroAlimentacion.cantidad_kg)).where(
            RegistroAlimentacion.animal_id == animal_id,
            RegistroAlimentacion.fecha == fecha,
        )
    )

    litros_f = float(litros) if litros is not None else None
    kg_f = float(kg) if kg is not None else None
    eficiencia = (litros_f / kg_f) if (litros_f is not None and kg_f and kg_f > 0) else None

    return EficienciaRead(
        fecha=fecha,
        litros_producidos=litros_f,
        kg_alimento=kg_f,
        eficiencia_litros_por_kg=eficiencia,
    )


# ── Helper ────────────────────────────────────────────────────────────────────

def _get_or_404(db, animal_id: str, finca_id: str) -> Animal:
    animal = db.scalar(
        select(Animal).where(Animal.id == animal_id, Animal.finca_id == finca_id)
    )
    if animal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal no encontrado")
    return animal
