from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import AnyAuthUser, CurrentUser, DbSession, UserFromRefresh
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.usuario import Usuario
from app.schemas.auth import ChangePasswordRequest, LoginRequest, TokenResponse, UserInToken

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def _build_token_response(user: Usuario) -> TokenResponse:
    token_data = {"sub": user.id, "finca_id": user.finca_id, "rol": user.rol}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=UserInToken.model_validate(user),
    )


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
