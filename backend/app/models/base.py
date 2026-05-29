from datetime import datetime
from uuid import uuid4

from sqlalchemy import CHAR, DateTime, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampedModel(Base):
    """Base for any table with id + timestamps."""
    __abstract__ = True

    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class TenantModel(TimestampedModel):
    """Base for any table scoped to a finca (multi-tenant)."""
    __abstract__ = True

    finca_id: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("fincas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
