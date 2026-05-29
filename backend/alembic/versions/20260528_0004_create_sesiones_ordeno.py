"""create sesiones_ordeno table

Revision ID: a004
Revises: a003
Create Date: 2026-05-28 00:04:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a004"
down_revision = "a003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sesiones_ordeno",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("finca_id", sa.CHAR(36), sa.ForeignKey("fincas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("fecha", sa.Date, nullable=False),
        sa.Column("turno", sa.String(10), nullable=False),
        sa.Column("operario_id", sa.CHAR(36), sa.ForeignKey("usuarios.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_sesiones_ordeno_finca_id", "sesiones_ordeno", ["finca_id"])
    op.create_index("ix_sesiones_ordeno_operario_id", "sesiones_ordeno", ["operario_id"])


def downgrade() -> None:
    op.drop_table("sesiones_ordeno")
