"""add nikki tag relationship table 

Revision ID: 7d9e44394524
Revises: 92cb9a3fc6df
Create Date: 2022-12-04 10:44:42.043937

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7d9e44394524'
down_revision = '92cb9a3fc6df'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('nikkitag',
    sa.Column('niiki_id', sa.Integer(), nullable=False),
    sa.Column('tag_id', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('niiki_id', 'tag_id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('nikkitag')
    # ### end Alembic commands ###