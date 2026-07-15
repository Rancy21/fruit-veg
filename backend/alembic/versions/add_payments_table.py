"""add payments table

Revision ID: add_payments_table
Revises: 
Create Date: 2025-01-13 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


# revision identifiers, used by Alembic.
revision = 'add_payments_table'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create payment_status enum
    payment_status_enum = sa.Enum('pending', 'processing', 'successful', 'failed', 'cancelled', name='paymentstatus')
    payment_status_enum.create(op.get_bind(), checkfirst=True)
    
    # Create payments table
    op.create_table(
        'payments',
        sa.Column('id', UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('flutterwave_charge_id', sa.String(), nullable=True),
        sa.Column('flutterwave_customer_id', sa.String(), nullable=True),
        sa.Column('payment_method_id', sa.String(), nullable=True),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('status', payment_status_enum, nullable=False, server_default='pending'),
        sa.Column('reference', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('payment_metadata', JSONB(), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
    )
    
    # Create indexes
    op.create_index('ix_payments_id', 'payments', ['id'])
    op.create_index('ix_payments_order_id', 'payments', ['order_id'])
    op.create_index('ix_payments_reference', 'payments', ['reference'], unique=True)
    op.create_index('ix_payments_flutterwave_charge_id', 'payments', ['flutterwave_charge_id'])
    op.create_index('ix_payments_status', 'payments', ['status'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_payments_status', 'payments')
    op.drop_index('ix_payments_flutterwave_charge_id', 'payments')
    op.drop_index('ix_payments_reference', 'payments')
    op.drop_index('ix_payments_order_id', 'payments')
    op.drop_index('ix_payments_id', 'payments')
    
    # Drop table
    op.drop_table('payments')
    
    # Drop enum
    payment_status_enum = sa.Enum('pending', 'processing', 'successful', 'failed', 'cancelled', name='paymentstatus')
    payment_status_enum.drop(op.get_bind(), checkfirst=True)
