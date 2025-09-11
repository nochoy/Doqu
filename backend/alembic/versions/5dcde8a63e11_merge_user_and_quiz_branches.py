"""Merge user and quiz branches

Revision ID: 5dcde8a63e11
Revises: 8f951c01403b, 62d5cc8fa12d
Create Date: 2025-09-10 23:40:20.099736

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = '5dcde8a63e11'
down_revision: Union[str, Sequence[str], None] = ('8f951c01403b', '62d5cc8fa12d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
