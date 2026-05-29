from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token, decode_refresh_token
from app.models.usuario import Usuario

security = HTTPBearer()


# ── Extraer claims del JWT de acceso ─────────────────────────────────────────

def get_token_claims(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    return payload


# ── Extraer claims del JWT de refresco ───────────────────────────────────────

def get_refresh_claims(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    payload = decode_refresh_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de refresco inválido o expirado",
        )
    return payload


# ── Usuario actual (cualquier token de acceso válido) ────────────────────────

def get_current_user(
    claims: Annotated[dict, Depends(get_token_claims)],
    db: Annotated[Session, Depends(get_db)],
) -> Usuario:
    user = db.get(Usuario, claims["sub"])
    if user is None or not user.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )
    return user


# ── Usuario desde token de refresco ──────────────────────────────────────────

def get_user_from_refresh(
    claims: Annotated[dict, Depends(get_refresh_claims)],
    db: Annotated[Session, Depends(get_db)],
) -> Usuario:
    user = db.get(Usuario, claims["sub"])
    if user is None or not user.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )
    return user


# ── finca_id desde el token (NUNCA del body) ─────────────────────────────────

def get_current_finca_id(
    claims: Annotated[dict, Depends(get_token_claims)],
) -> str:
    finca_id = claims.get("finca_id")
    if not finca_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sin finca",
        )
    return finca_id


# ── Guards de rol ─────────────────────────────────────────────────────────────

def require_propietario(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if current_user.rol != "propietario":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el propietario puede realizar esta acción",
        )
    return current_user


def require_operario_or_propietario(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if current_user.rol not in ("propietario", "operario"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado",
        )
    return current_user


# ── Aliases tipados para uso limpio en endpoints ──────────────────────────────

CurrentUser = Annotated[Usuario, Depends(get_current_user)]
UserFromRefresh = Annotated[Usuario, Depends(get_user_from_refresh)]
CurrentFincaId = Annotated[str, Depends(get_current_finca_id)]
PropietarioOnly = Annotated[Usuario, Depends(require_propietario)]
AnyAuthUser = Annotated[Usuario, Depends(require_operario_or_propietario)]
DbSession = Annotated[Session, Depends(get_db)]
