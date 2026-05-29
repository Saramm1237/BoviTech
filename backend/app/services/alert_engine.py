from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.alerta import Alerta
from app.models.animal import Animal
from app.models.finca import Finca
from app.models.registro_produccion import RegistroProduccion


def run_alert_engine(finca_id: str, animal_ids: list[str]) -> None:
    """BackgroundTask: evalúa alertas tras guardar registros de producción."""
    db: Session = SessionLocal()
    try:
        for animal_id in animal_ids:
            _check_production_drop(db, finca_id, animal_id)
        _check_24h_sin_registro(db, finca_id)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _check_production_drop(db: Session, finca_id: str, animal_id: str) -> None:
    finca = db.get(Finca, finca_id)
    umbral = (finca.umbral_alerta_porcentaje if finca else None) or 20

    today = date.today()
    seven_days_ago = today - timedelta(days=7)

    # Promedio de los 7 días anteriores a hoy (excluye el día actual)
    rows = db.execute(
        select(
            RegistroProduccion.fecha,
            func.sum(RegistroProduccion.volumen_litros).label("total"),
        )
        .where(
            RegistroProduccion.animal_id == animal_id,
            RegistroProduccion.fecha >= seven_days_ago,
            RegistroProduccion.fecha < today,
        )
        .group_by(RegistroProduccion.fecha)
    ).all()

    if len(rows) < 3:
        return  # Historial insuficiente para comparación significativa

    avg_7d = sum(float(r.total) for r in rows) / len(rows)
    if avg_7d == 0:
        return

    # Total de hoy acumulado hasta ahora
    today_total = db.scalar(
        select(func.sum(RegistroProduccion.volumen_litros)).where(
            RegistroProduccion.animal_id == animal_id,
            RegistroProduccion.fecha == today,
        )
    )
    today_total = float(today_total or 0)

    drop_pct = ((avg_7d - today_total) / avg_7d) * 100

    if drop_pct >= umbral:
        nivel = "critico"
    elif drop_pct >= 10:
        nivel = "advertencia"
    else:
        return

    alerta = Alerta(
        id=str(uuid4()),
        finca_id=finca_id,
        animal_id=animal_id,
        tipo_alerta="caida_produccion",
        nivel=nivel,
        mensaje=(
            f"Caída del {drop_pct:.0f}% respecto al promedio de 7 días "
            f"({avg_7d:.1f} L → {today_total:.1f} L)"
        ),
        datos_extra={
            "drop_pct": round(drop_pct, 1),
            "avg_7d": round(avg_7d, 1),
            "hoy": round(today_total, 1),
            "umbral": umbral,
        },
    )
    db.add(alerta)


def _check_24h_sin_registro(db: Session, finca_id: str) -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)

    active_animals = db.scalars(
        select(Animal).where(Animal.finca_id == finca_id, Animal.activo.is_(True))
    ).all()

    for animal in active_animals:
        last_rp = db.scalar(
            select(RegistroProduccion)
            .where(RegistroProduccion.animal_id == animal.id)
            .order_by(RegistroProduccion.created_at.desc())
            .limit(1)
        )

        if last_rp is None:
            continue  # Sin historial — no se alerta

        last_at = last_rp.created_at
        if last_at.tzinfo is None:
            last_at = last_at.replace(tzinfo=timezone.utc)
        if last_at > cutoff:
            continue  # Registrado hace menos de 24h

        # Verificar si ya existe alerta activa para este animal
        existing = db.scalar(
            select(Alerta).where(
                Alerta.animal_id == animal.id,
                Alerta.tipo_alerta == "sin_registro_24h",
                Alerta.revisada.is_(False),
            )
        )
        if existing is not None:
            continue

        alerta = Alerta(
            id=str(uuid4()),
            finca_id=finca_id,
            animal_id=animal.id,
            tipo_alerta="sin_registro_24h",
            nivel="advertencia",
            mensaje="Sin registro de producción por más de 24 horas",
        )
        db.add(alerta)
