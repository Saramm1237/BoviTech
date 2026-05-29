from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, CurrentFincaId, DbSession, PropietarioOnly
from app.core.security import get_password_hash
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioRead

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("", response_model=list[UsuarioRead])
def list_usuarios(
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    usuarios = db.scalars(
        select(Usuario)
        .where(Usuario.finca_id == finca_id)
        .order_by(Usuario.rol.desc(), Usuario.nombre)  # propietario primero
    ).all()
    return usuarios


@router.post("", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def create_usuario(
    payload: UsuarioCreate,
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    nuevo = Usuario(
        finca_id=finca_id,
        email=str(payload.email),
        nombre=payload.nombre,
        rol=payload.rol,
        password_hash=get_password_hash(payload.password),
    )
    db.add(nuevo)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con este email en la finca",
        )
    db.refresh(nuevo)
    return nuevo


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_usuario(
    usuario_id: str,
    db: DbSession,
    current_user: CurrentUser,
    _propietario: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    if usuario_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes eliminar tu propia cuenta",
        )

    usuario = db.scalar(
        select(Usuario).where(
            Usuario.id == usuario_id,
            Usuario.finca_id == finca_id,
        )
    )
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    usuario.activo = False
    db.commit()


@router.patch("/{usuario_id}/ver-alertas", response_model=UsuarioRead)
def toggle_ver_alertas(
    usuario_id: str,
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    """Habilitar/deshabilitar que el operario vea alertas (FR-7.2)."""
    usuario = db.scalar(
        select(Usuario).where(
            Usuario.id == usuario_id,
            Usuario.finca_id == finca_id,
        )
    )
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    usuario.ver_alertas = not usuario.ver_alertas
    db.commit()
    db.refresh(usuario)
    return usuario
