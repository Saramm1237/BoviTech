"""create registros_alimentacion table

Revision ID: a006
Revises: a005
Create Date: 2026-05-28 00:06:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a006"
down_revision = "a005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "registros_alimentacion",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("finca_id", sa.CHAR(36), sa.ForeignKey("fincas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("animal_id", sa.CHAR(36), sa.ForeignKey("animales.id"), nullable=False),
        sa.Column("fecha", sa.Date, nullable=False),
        sa.Column("tipo_alimento", sa.String(50), nullable=False),
        sa.Column("cantidad_kg", sa.Numeric(8, 2), nullable=False),
        sa.Column("operario_id", sa.CHAR(36), sa.ForeignKey("usuarios.id"), nullable=False),
        sa.Column("sesion_id", sa.CHAR(36), sa.ForeignKey("sesiones_ordeno.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_registros_alimentacion_finca_id", "registros_alimentacion", ["finca_id"])
    op.create_index("ix_registros_alimentacion_animal_id", "registros_alimentacion", ["animal_id"])
    op.create_index("ix_registros_alimentacion_operario_id", "registros_alimentacion", ["operario_id"])
    op.create_index("ix_registros_alimentacion_sesion_id", "registros_alimentacion", ["sesion_id"])


def downgrade() -> None:
    op.drop_table("registros_alimentacion")
