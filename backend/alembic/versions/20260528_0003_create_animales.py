"""create animales table

Revision ID: a003
Revises: a002
Create Date: 2026-05-28 00:03:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a003"
down_revision = "a002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "animales",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("finca_id", sa.CHAR(36), sa.ForeignKey("fincas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("numero_arete", sa.String(50), nullable=False),
        sa.Column("nombre", sa.String(100), nullable=True),
        sa.Column("raza", sa.String(100), nullable=True),
        sa.Column("fecha_nacimiento", sa.Date, nullable=True),
        sa.Column("fecha_ultimo_parto", sa.Date, nullable=True),
        sa.Column("rfid_tag", sa.String(100), nullable=True),
        sa.Column("activo", sa.Boolean, default=True, nullable=False),
        sa.Column("baja_fecha", sa.Date, nullable=True),
        sa.Column("baja_motivo", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_animales_finca_id", "animales", ["finca_id"])
    op.create_unique_constraint("uq_animales_arete_finca", "animales", ["numero_arete", "finca_id"])


def downgrade() -> None:
    op.drop_table("animales")
