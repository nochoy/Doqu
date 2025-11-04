"""Modify quiz and question id to UUID

Revision ID: 38ad8e3e6aee
Revises: 1001941c015f
Create Date: 2025-09-29 05:52:09.284805

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel.sql.sqltypes

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '38ad8e3e6aee'
down_revision: Union[str, Sequence[str], None] = '1001941c015f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop foreign key constraint to allow PK modification
    op.drop_constraint('questions_quiz_id_fkey', 'questions', type_='foreignkey')

    # Handle quizzes table
    op.execute('ALTER TABLE quizzes ALTER COLUMN id DROP DEFAULT')
    op.alter_column('quizzes', 'id',
                    existing_type=sa.INTEGER(),
                    type_=sa.dialects.postgresql.UUID(as_uuid=True),
                    postgresql_using='gen_random_uuid()')
    op.execute('ALTER TABLE quizzes ALTER COLUMN id SET DEFAULT gen_random_uuid()')

    # Handle questions table id
    op.execute('ALTER TABLE questions ALTER COLUMN id DROP DEFAULT')
    op.alter_column('questions', 'id',
                    existing_type=sa.INTEGER(),
                    type_=sa.dialects.postgresql.UUID(as_uuid=True),
                    postgresql_using='gen_random_uuid()')
    op.execute('ALTER TABLE questions ALTER COLUMN id SET DEFAULT gen_random_uuid()')

    # Handle questions table quiz_id
    op.alter_column('questions', 'quiz_id',
                    existing_type=sa.INTEGER(),
                    type_=sa.dialects.postgresql.UUID(as_uuid=True),
                    postgresql_using='gen_random_uuid()')

    # Recreate foreign key constraint
    op.create_foreign_key(
        'questions_quiz_id_fkey',
        'questions', 'quizzes',
        ['quiz_id'], ['id']
    )
    op.create_index(op.f('ix_quizzes_id'), 'quizzes', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('questions_quiz_id_fkey', 'questions', type_='foreignkey')
    op.drop_index(op.f('ix_quizzes_id'), table_name='quizzes')

    # Recreate sequence for quizzes id
    op.execute('CREATE SEQUENCE quizzes_id_seq')
    op.alter_column('quizzes', 'id',
                    existing_type=sa.dialects.postgresql.UUID(as_uuid=True),
                    type_=sa.INTEGER(),
                    postgresql_using='0', # Dummy value, will be overwritten
                    server_default=sa.text("nextval('quizzes_id_seq')"),
                    nullable=False)

    # Recreate sequence for questions id
    op.execute('CREATE SEQUENCE questions_id_seq')
    op.alter_column('questions', 'id',
                    existing_type=sa.dialects.postgresql.UUID(as_uuid=True),
                    type_=sa.INTEGER(),
                    postgresql_using='0', # Dummy value
                    server_default=sa.text("nextval('questions_id_seq')"),
                    nullable=False)

    # Downgrade questions.quiz_id
    op.alter_column('questions', 'quiz_id',
                    existing_type=sa.dialects.postgresql.UUID(as_uuid=True),
                    type_=sa.INTEGER(),
                    postgresql_using='0') # Dummy value

    # Recreate foreign key
    op.create_foreign_key(
        'questions_quiz_id_fkey',
        'questions', 'quizzes',
        ['quiz_id'], ['id']
    )
