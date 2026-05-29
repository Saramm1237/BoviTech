"""create eventos_trazabilidad table (append-only)

Revision ID: a008
Revises: a007
Create Date: 2026-05-28 00:08:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a008"
down_revision = "a007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "eventos_trazabilidad",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("finca_id", sa.CHAR(36), sa.ForeignKey("fincas.id"), nullable=False),
        sa.Column("animal_id", sa.CHAR(36), sa.ForeignKey("animales.id"), nullable=False),
        sa.Column("tipo_evento", sa.String(50), nullable=False),
        sa.Column("datos_evento", sa.JSON, nullable=False),
        sa.Column("responsable_id", sa.CHAR(36), sa.ForeignKey("usuarios.id"), nullable=False),
        # Sin updated_at — append-only por diseño (ICA 017)
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_eventos_trazabilidad_finca_id", "eventos_trazabilidad", ["finca_id"])
    op.create_index("ix_eventos_trazabilidad_animal_id", "eventos_trazabilidad", ["animal_id"])


def downgrade() -> None:
    op.drop_table("eventos_trazabilidad")
