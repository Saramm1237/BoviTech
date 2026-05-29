"""create usuarios table

Revision ID: a002
Revises: a001
Create Date: 2026-05-28 00:02:00
"""

from alembic import op
import sqlalchemy as sa

revision = "a002"
down_revision = "a001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("finca_id", sa.CHAR(36), sa.ForeignKey("fincas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("nombre", sa.String(200), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("rol", sa.String(20), nullable=False),
        sa.Column("activo", sa.Boolean, default=True, nullable=False),
        sa.Column("ver_alertas", sa.Boolean, default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index("ix_usuarios_finca_id", "usuarios", ["finca_id"])
    op.create_index("ix_usuarios_email", "usuarios", ["email"], unique=True)


def downgrade() -> None:
    op.drop_table("usuarios")
