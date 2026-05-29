from datetime import date, timedelta

from fastapi import APIRouter
from sqlalchemy import func, select

from app.api.deps import AnyAuthUser, CurrentFincaId, DbSession
from app.models.alerta import Alerta
from app.models.animal import Animal
from app.models.registro_produccion import RegistroProduccion
from app.schemas.dashboard import AnimalRankingItem, DashboardRead

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardRead)
def get_dashboard(
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    today = date.today()
    seven_days_ago = today - timedelta(days=7)

    # ── Producción hoy (null si no hay registros) ─────────────────────────────
    hoy_total = db.scalar(
        select(func.sum(RegistroProduccion.volumen_litros)).where(
            RegistroProduccion.finca_id == finca_id,
            RegistroProduccion.fecha == today,
        )
    )

    # ── Producción últimos 7 días ─────────────────────────────────────────────
    siete_dias = db.scalar(
        select(func.sum(RegistroProduccion.volumen_litros)).where(
            RegistroProduccion.finca_id == finca_id,
            RegistroProduccion.fecha >= seven_days_ago,
        )
    ) or 0.0

    # ── Alertas activas ───────────────────────────────────────────────────────
    alertas_count = db.scalar(
        select(func.count())
        .select_from(Alerta)
        .where(Alerta.finca_id == finca_id, Alerta.revisada.is_(False))
    ) or 0

    # ── Producción por animal hoy (para ranking) ──────────────────────────────
    rows = db.execute(
        select(
            Animal.id,
            Animal.numero_arete,
            Animal.nombre,
            func.sum(RegistroProduccion.volumen_litros).label("litros"),
        )
        .join(RegistroProduccion, Animal.id == RegistroProduccion.animal_id)
        .where(
            RegistroProduccion.finca_id == finca_id,
            RegistroProduccion.fecha == today,
        )
        .group_by(Animal.id, Animal.numero_arete, Animal.nombre)
    ).all()

    def to_ranking(r) -> AnimalRankingItem:
        return AnimalRankingItem(
            animal_id=r.id,
            numero_arete=r.numero_arete,
            nombre=r.nombre,
            litros_hoy=float(r.litros),
        )

    sorted_desc = sorted(rows, key=lambda r: float(r.litros), reverse=True)
    sorted_asc = sorted(rows, key=lambda r: float(r.litros))

    top5 = [to_ranking(r) for r in sorted_desc[:5]]
    bottom5 = [to_ranking(r) for r in sorted_asc[:5]]

    # ── Último registro ───────────────────────────────────────────────────────
    last_rp = db.scalar(
        select(RegistroProduccion)
        .where(RegistroProduccion.finca_id == finca_id)
        .order_by(RegistroProduccion.created_at.desc())
        .limit(1)
    )

    return DashboardRead(
        produccion_hoy_litros=float(hoy_total) if hoy_total is not None else None,
        produccion_7_dias_litros=float(siete_dias),
        alertas_activas_count=alertas_count,
        top_5_mayor=top5,
        top_5_menor=bottom5,
        ultimo_registro_at=last_rp.created_at if last_rp else None,
    )
