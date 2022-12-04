"""create tag table

Revision ID: 4bc6b716d115
Revises: 
Create Date: 2022-12-04 08:37:56.430514

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4bc6b716d115'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """tag table 作成
    """
    op.create_table(
        'tag',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('created_by', sa.Integer, nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.UniqueConstraint("created_by", "name",
                            name="created_by_name_unique_constraint"),
    )


def downgrade() -> None:
    """ tag table のドロップ
    """
    op.drop_table('tag')
