from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.evento_trazabilidad import EventoTrazabilidad


def write_evento(
    db: Session,
    *,
    finca_id: str,
    animal_id: str,
    tipo_evento: str,
    datos_evento: dict,
    responsable_id: str,
) -> EventoTrazabilidad:
    """Añade un evento de trazabilidad a la sesión (no hace commit)."""
    evento = EventoTrazabilidad(
        id=str(uuid4()),
        finca_id=finca_id,
        animal_id=animal_id,
        tipo_evento=tipo_evento,
        datos_evento=datos_evento,
        responsable_id=responsable_id,
    )
    db.add(evento)
    return evento
