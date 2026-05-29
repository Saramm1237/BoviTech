from datetime import date, timedelta

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.api.deps import AnyAuthUser, CurrentFincaId, DbSession
from app.models.animal import Animal
from app.models.registro_produccion import RegistroProduccion
from app.models.sesion_ordeno import SesionOrdeno
from app.schemas.produccion import (
    ProduccionDiariaRead,
    RegistroProduccionCreate,
    RegistroProduccionRead,
    SesionCreate,
    SesionRead,
)
from app.services.alert_engine import run_alert_engine

router = APIRouter(prefix="/sesiones", tags=["Sesiones de Ordeño"])

TURNO_LABEL = {"manana": "mañana", "tarde": "tarde"}


# ── GET /sesiones — listar con filtros opcionales ─────────────────────────────

@router.get("/", response_model=list[SesionRead])
def list_sesiones(
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
    fecha: date | None = Query(default=None),
    turno: str | None = Query(default=None),
):
    stmt = select(SesionOrdeno).where(SesionOrdeno.finca_id == finca_id)
    if fecha:
        stmt = stmt.where(SesionOrdeno.fecha == fecha)
    if turno:
        stmt = stmt.where(SesionOrdeno.turno == turno)
    stmt = stmt.order_by(SesionOrdeno.fecha.desc(), SesionOrdeno.created_at.desc())
    return db.scalars(stmt).all()


# ── POST /sesiones — crear sesión de ordeño ───────────────────────────────────

@router.post("/", response_model=SesionRead, status_code=status.HTTP_201_CREATED)
def create_sesion(
    payload: SesionCreate,
    db: DbSession,
    current_user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    existing = db.scalar(
        select(SesionOrdeno).where(
            SesionOrdeno.finca_id == finca_id,
            SesionOrdeno.fecha == payload.fecha,
            SesionOrdeno.turno == payload.turno,
        )
    )
    if existing:
        label = TURNO_LABEL.get(payload.turno, payload.turno)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una sesión de {label} para esta fecha",
        )

    sesion = SesionOrdeno(
        finca_id=finca_id,
        fecha=payload.fecha,
        turno=payload.turno,
        operario_id=current_user.id,
    )
    db.add(sesion)
    db.commit()
    db.refresh(sesion)
    return sesion


# ── GET /sesiones/{id}/registros — ver registros de una sesión ────────────────

@router.get("/{sesion_id}/registros", response_model=list[RegistroProduccionRead])
def list_registros(
    sesion_id: str,
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    _get_sesion_or_404(db, sesion_id, finca_id)
    registros = db.scalars(
        select(RegistroProduccion)
        .where(RegistroProduccion.sesion_id == sesion_id)
        .order_by(RegistroProduccion.created_at)
    ).all()
    return registros


# ── POST /sesiones/{id}/registros — registrar producción por animal ───────────

@router.post(
    "/{sesion_id}/registros",
    response_model=list[RegistroProduccionRead],
    status_code=status.HTTP_201_CREATED,
)
def create_registros(
    sesion_id: str,
    payload: list[RegistroProduccionCreate],
    background_tasks: BackgroundTasks,
    db: DbSession,
    current_user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La lista no puede estar vacía")

    sesion = _get_sesion_or_404(db, sesion_id, finca_id)

    # Validar que todos los animales pertenecen a la finca antes de crear
    for item in payload:
        animal = db.scalar(
            select(Animal).where(Animal.id == item.animal_id, Animal.finca_id == finca_id)
        )
        if animal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Animal {item.animal_id} no encontrado en la finca",
            )

    registros = []
    for item in payload:
        rp = RegistroProduccion(
            finca_id=finca_id,
            sesion_id=sesion_id,
            animal_id=item.animal_id,
            fecha=sesion.fecha,
            turno=sesion.turno,
            volumen_litros=item.volumen_litros,
            operario_id=current_user.id,
        )
        db.add(rp)
        registros.append(rp)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Uno o más animales ya tienen registro para esta sesión",
        )

    for rp in registros:
        db.refresh(rp)

    background_tasks.add_task(
        run_alert_engine,
        finca_id,
        [rp.animal_id for rp in registros],
    )
    return registros


# ── GET /animales/{id}/produccion — tendencia 30 días ────────────────────────
# (Endpoint alternativo en sesiones router para evitar modificar animales router)

@router.get("/produccion/{animal_id}/tendencia", response_model=list[ProduccionDiariaRead])
def get_produccion_tendencia(
    animal_id: str,
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
    periodo: str = Query(default="30d"),
):
    animal = db.scalar(select(Animal).where(Animal.id == animal_id, Animal.finca_id == finca_id))
    if animal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal no encontrado")

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


# ── Helper ────────────────────────────────────────────────────────────────────

def _get_sesion_or_404(db, sesion_id: str, finca_id: str) -> SesionOrdeno:
    sesion = db.scalar(
        select(SesionOrdeno).where(
            SesionOrdeno.id == sesion_id,
            SesionOrdeno.finca_id == finca_id,
        )
    )
    if sesion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")
    return sesion
