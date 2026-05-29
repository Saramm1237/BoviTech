from uuid import uuid4

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.deps import AnyAuthUser, CurrentUser, DbSession, UserFromRefresh
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.finca import Finca
from app.models.usuario import Usuario
from app.schemas.auth import ChangePasswordRequest, LoginRequest, TokenResponse, UserInToken


class RegisterRequest(BaseModel):
    nombre_finca: str = Field(..., min_length=1, max_length=200)
    nombre: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(..., min_length=8)

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def _build_token_response(user: Usuario) -> TokenResponse:
    token_data = {"sub": user.id, "finca_id": user.finca_id, "rol": user.rol}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=UserInToken.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DbSession):
    finca = Finca(id=str(uuid4()), nombre=payload.nombre_finca)
    db.add(finca)
    db.flush()

    usuario = Usuario(
        id=str(uuid4()),
        finca_id=finca.id,
        email=str(payload.email),
        nombre=payload.nombre,
        password_hash=get_password_hash(payload.password),
        rol="propietario",
    )
    db.add(usuario)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con este email",
        )
    db.refresh(usuario)
    return _build_token_response(usuario)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession):
    user = db.scalar(select(Usuario).where(Usuario.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    return _build_token_response(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(current_user: UserFromRefresh):
    return _build_token_response(current_user)


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    db: DbSession,
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta",
        )
    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}


@router.get("/me", response_model=UserInToken)
def get_me(current_user: AnyAuthUser):
    return current_user
