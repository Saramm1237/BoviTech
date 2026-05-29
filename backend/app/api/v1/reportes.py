from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from fastapi.responses import Response

from app.api.deps import AnyAuthUser, CurrentFincaId, PropietarioOnly
from app.schemas.reporte import ReporteJobRead, ReporteRequest
from app.services.report_generator import jobs, run_report_job

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.post("/pdf", response_model=ReporteJobRead, status_code=status.HTTP_202_ACCEPTED)
def request_pdf(
    payload: ReporteRequest,
    background_tasks: BackgroundTasks,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    job_id = str(uuid4())
    jobs[job_id] = {"status": "pending", "data": None}
    background_tasks.add_task(
        run_report_job, job_id, finca_id, payload.fecha_inicio, payload.fecha_fin, "pdf"
    )
    return ReporteJobRead(job_id=job_id, status="pending")


@router.post("/excel", response_model=ReporteJobRead, status_code=status.HTTP_202_ACCEPTED)
def request_excel(
    payload: ReporteRequest,
    background_tasks: BackgroundTasks,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    job_id = str(uuid4())
    jobs[job_id] = {"status": "pending", "data": None}
    background_tasks.add_task(
        run_report_job, job_id, finca_id, payload.fecha_inicio, payload.fecha_fin, "excel"
    )
    return ReporteJobRead(job_id=job_id, status="pending")


@router.get("/{job_id}/status", response_model=ReporteJobRead)
def get_status(job_id: str, _user: AnyAuthUser):
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return ReporteJobRead(job_id=job_id, status=job["status"])


@router.get("/{job_id}/download")
def download_report(job_id: str, _user: AnyAuthUser):
    job = jobs.get(job_id)
    if job is None or job["status"] != "ready":
        raise HTTPException(status_code=404, detail="Reporte no disponible aún")
    return Response(
        content=job["data"],
        media_type=job["content_type"],
        headers={"Content-Disposition": f'attachment; filename="{job["filename"]}"'},
    )
