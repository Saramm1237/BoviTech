"""add umbral_alerta_porcentaje to fincas

Revision ID: a009
Revises: a008
Create Date: 2026-05-28 00:09:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a009"
down_revision = "a008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "fincas",
        sa.Column("umbral_alerta_porcentaje", sa.Integer, nullable=False, server_default="20"),
    )


def downgrade() -> None:
    op.drop_column("fincas", "umbral_alerta_porcentaje")
