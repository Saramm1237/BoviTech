from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.animales import router as animales_router
from app.api.v1.sesiones import router as sesiones_router
from app.api.v1.alertas import router as alertas_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.alimentacion import router as alimentacion_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(animales_router)
router.include_router(sesiones_router)
router.include_router(alertas_router)
router.include_router(dashboard_router)
router.include_router(alimentacion_router)
