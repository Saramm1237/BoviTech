import csv
from datetime import date
from io import StringIO

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.api.deps import AnyAuthUser, CurrentFincaId, DbSession, PropietarioOnly
from app.models.animal import Animal
from app.models.evento_trazabilidad import EventoTrazabilidad
from app.models.usuario import Usuario
from app.schemas.trazabilidad import EventoTrazabilidadRead

router = APIRouter(prefix="/trazabilidad", tags=["Trazabilidad"])

TIPO_LABELS = {
    "ordeno": "Ordeño",
    "baja": "Baja del hato",
    "alimentacion": "Alimentación",
    "alta": "Alta en hato",
}


@router.get("/export")
def export_trazabilidad(
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
    animal_id: str = Query(...),
):
    animal = db.scalar(
        select(Animal).where(Animal.id == animal_id, Animal.finca_id == finca_id)
    )
    if animal is None:
        raise HTTPException(status_code=404, detail="Animal no encontrado")

    rows = db.execute(
        select(EventoTrazabilidad, Usuario.nombre.label("responsable"))
        .join(Usuario, EventoTrazabilidad.responsable_id == Usuario.id)
        .where(EventoTrazabilidad.animal_id == animal_id)
        .order_by(EventoTrazabilidad.created_at.asc())
    ).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Identificador Animal",
        "Numero Arete",
        "Nombre Animal",
        "Fecha Evento",
        "Tipo Evento",
        "Datos del Evento",
        "Responsable del Registro",
        "Resolucion ICA 017/2012",
    ])
    for evento, responsable in rows:
        writer.writerow([
            animal.id,
            animal.numero_arete,
            animal.nombre or "",
            evento.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            TIPO_LABELS.get(evento.tipo_evento, evento.tipo_evento),
            str(evento.datos_evento),
            responsable,
            "Cumple",
        ])

    output.seek(0)
    filename = f"trazabilidad_{animal.numero_arete}_{date.today()}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
