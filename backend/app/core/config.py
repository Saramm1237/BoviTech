import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    @field_validator("DATABASE_URL")
    @classmethod
    def fix_mysql_url(cls, v: str) -> str:
        # 1. Convertir mysql:// a mysql+pymysql://
        if v.startswith("mysql://") and "+pymysql" not in v:
            v = v.replace("mysql://", "mysql+pymysql://", 1)

        # 2. Proxy externo de Railway requiere SSL sin verificación estricta
        is_external = (
            "railway.internal" not in v
            and "localhost" not in v
            and "127.0.0.1" not in v
        )
        if is_external and "ssl_verify_cert" not in v:
            sep = "&" if "?" in v else "?"
            v += f"{sep}ssl_verify_cert=false&ssl_verify_identity=false"

        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        # Acepta tanto JSON string como lista ya parseada
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                return json.loads(v)
            # Soporte para lista separada por comas
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
