"""create alertas table

Revision ID: a007
Revises: a006
Create Date: 2026-05-28 00:07:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a007"
down_revision = "a006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "alertas",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("finca_id", sa.CHAR(36), sa.ForeignKey("fincas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("animal_id", sa.CHAR(36), sa.ForeignKey("animales.id"), nullable=False),
        sa.Column("tipo_alerta", sa.String(50), nullable=False),
        sa.Column("nivel", sa.String(20), nullable=False),
        sa.Column("mensaje", sa.Text, nullable=False),
        sa.Column("revisada", sa.Boolean, default=False, nullable=False),
        sa.Column("fecha_revision", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revisada_por_id", sa.CHAR(36), sa.ForeignKey("usuarios.id"), nullable=True),
        sa.Column("datos_extra", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_alertas_finca_id", "alertas", ["finca_id"])
    op.create_index("ix_alertas_animal_id", "alertas", ["animal_id"])


def downgrade() -> None:
    op.drop_table("alertas")
