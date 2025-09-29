"""Merge user and quiz branches

Revision ID: 1001941c015f
Revises: 52b8e238cc48, 731e18130e01
Create Date: 2025-09-29 05:51:20.737678

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel.sql.sqltypes

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '1001941c015f'
down_revision: Union[str, Sequence[str], None] = ('52b8e238cc48', '731e18130e01')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
