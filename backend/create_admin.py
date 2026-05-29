"""Script de primer arranque: crea la finca y el propietario inicial."""
import sys
from uuid import uuid4

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import Finca, Usuario


def main():
    db = SessionLocal()
    try:
        existing = db.query(Usuario).filter(Usuario.rol == "propietario").first()
        if existing:
            print(f"Ya existe un propietario: {existing.email}")
            return

        finca = Finca(id=str(uuid4()), nombre="Mi Finca BoviTech")
        db.add(finca)
        db.flush()

        email = "admin@bovitech.com"
        password = "Admin2026!"

        usuario = Usuario(
            id=str(uuid4()),
            finca_id=finca.id,
            email=email,
            nombre="Propietario",
            password_hash=get_password_hash(password),
            rol="propietario",
        )
        db.add(usuario)
        db.commit()

        print("=" * 45)
        print("✅  Propietario creado exitosamente")
        print(f"    Email:    {email}")
        print(f"    Password: {password}")
        print("    Cambia la contraseña al ingresar.")
        print("=" * 45)

    finally:
        db.close()


if __name__ == "__main__":
    main()
