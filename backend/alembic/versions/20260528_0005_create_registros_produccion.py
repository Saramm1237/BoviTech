"""create registros_produccion table

Revision ID: a005
Revises: a004
Create Date: 2026-05-28 00:05:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a005"
down_revision = "a004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "registros_produccion",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("finca_id", sa.CHAR(36), sa.ForeignKey("fincas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sesion_id", sa.CHAR(36), sa.ForeignKey("sesiones_ordeno.id"), nullable=False),
        sa.Column("animal_id", sa.CHAR(36), sa.ForeignKey("animales.id"), nullable=False),
        sa.Column("fecha", sa.Date, nullable=False),
        sa.Column("turno", sa.String(10), nullable=False),
        sa.Column("volumen_litros", sa.Numeric(6, 1), nullable=False),
        sa.Column("operario_id", sa.CHAR(36), sa.ForeignKey("usuarios.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_registros_produccion_finca_id", "registros_produccion", ["finca_id"])
    op.create_index("ix_registros_produccion_sesion_id", "registros_produccion", ["sesion_id"])
    op.create_index("ix_registros_produccion_animal_id", "registros_produccion", ["animal_id"])
    op.create_index("ix_registros_produccion_operario_id", "registros_produccion", ["operario_id"])
    op.create_unique_constraint(
        "uq_produccion_animal_dia_turno",
        "registros_produccion",
        ["animal_id", "fecha", "turno"],
    )


def downgrade() -> None:
    op.drop_table("registros_produccion")
