from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import case, select

from app.api.deps import AnyAuthUser, CurrentFincaId, DbSession, PropietarioOnly
from app.models.alerta import Alerta
from app.models.animal import Animal
from app.models.finca import Finca
from app.schemas.alerta import AlertaConfigRead, AlertaConfigUpdate, AlertaRead

router = APIRouter(prefix="/alertas", tags=["Alertas"])


def _to_alerta_read(alerta: Alerta, animal: Animal | None) -> AlertaRead:
    return AlertaRead(
        id=alerta.id,
        finca_id=alerta.finca_id,
        animal_id=alerta.animal_id,
        tipo_alerta=alerta.tipo_alerta,
        nivel=alerta.nivel,
        mensaje=alerta.mensaje,
        revisada=alerta.revisada,
        fecha_revision=alerta.fecha_revision,
        datos_extra=alerta.datos_extra,
        created_at=alerta.created_at,
        animal_nombre=animal.nombre if animal else None,
        animal_numero_arete=animal.numero_arete if animal else None,
    )


@router.get("", response_model=list[AlertaRead])
def list_alertas(
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
    incluir_revisadas: bool = Query(default=False),
):
    stmt = (
        select(Alerta, Animal.nombre, Animal.numero_arete)
        .join(Animal, Alerta.animal_id == Animal.id)
        .where(Alerta.finca_id == finca_id)
    )
    if not incluir_revisadas:
        stmt = stmt.where(Alerta.revisada.is_(False))

    stmt = stmt.order_by(
        case((Alerta.nivel == "critico", 0), else_=1),
        Alerta.created_at.desc(),
    )

    return [
        AlertaRead(
            id=a.id,
            finca_id=a.finca_id,
            animal_id=a.animal_id,
            tipo_alerta=a.tipo_alerta,
            nivel=a.nivel,
            mensaje=a.mensaje,
            revisada=a.revisada,
            fecha_revision=a.fecha_revision,
            datos_extra=a.datos_extra,
            created_at=a.created_at,
            animal_nombre=nombre,
            animal_numero_arete=arete,
        )
        for a, nombre, arete in db.execute(stmt).all()
    ]


@router.post("/{alerta_id}/ack", response_model=AlertaRead)
def ack_alerta(
    alerta_id: str,
    db: DbSession,
    current_user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    alerta = db.scalar(
        select(Alerta).where(Alerta.id == alerta_id, Alerta.finca_id == finca_id)
    )
    if alerta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta no encontrada")

    animal = db.get(Animal, alerta.animal_id)
    alerta.revisada = True
    alerta.fecha_revision = datetime.now(timezone.utc)
    alerta.revisada_por_id = current_user.id
    db.commit()
    db.refresh(alerta)
    return _to_alerta_read(alerta, animal)


@router.get("/config", response_model=AlertaConfigRead)
def get_alert_config(
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    finca = db.get(Finca, finca_id)
    if finca is None:
        raise HTTPException(status_code=404, detail="Finca no encontrada")
    return finca


@router.patch("/config", response_model=AlertaConfigRead)
def update_alert_config(
    payload: AlertaConfigUpdate,
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    finca = db.get(Finca, finca_id)
    if finca is None:
        raise HTTPException(status_code=404, detail="Finca no encontrada")
    finca.umbral_alerta_porcentaje = payload.umbral_porcentaje
    db.commit()
    db.refresh(finca)
    return finca
