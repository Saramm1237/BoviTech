"""create fincas table

Revision ID: a001
Revises:
Create Date: 2026-05-28 00:01:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "fincas",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("nombre", sa.String(200), nullable=False),
        sa.Column("nit", sa.String(20), nullable=True),
        sa.Column("municipio", sa.String(100), nullable=True),
        sa.Column("departamento", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("fincas")
