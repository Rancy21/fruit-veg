"""
Payment Service

Business logic for payment processing.
Handles payment initiation, verification, and status updates.
"""

import logging
from typing import Dict, Any, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from ..models import DBPayment, DBOrder, PaymentStatus
from ..utils import generate_payment_reference
from .flutterwave.client import (
    create_customer,
    create_card_payment_method,
    charge_card,
    get_charge
)
from .flutterwave.webhook import extract_webhook_data, process_webhook_event

logger = logging.getLogger(__name__)


class PaymentError(Exception):
    """Custom exception for payment errors"""
    pass


def initiate_payment(
    db: Session,
    order_id: int,
    email: str,
    first_name: str,
    last_name: str,
    phone: str,
    card_number: str,
    exp_month: str,
    exp_year: str,
    cvv: str,
    currency: str = "USD",
    user_id: Optional[int] = None
) -> DBPayment:
    """
    Initiate a payment for an order.

    This function:
    1. Validates the order exists and is in PENDING status
    2. Creates a customer in Flutterwave
    3. Creates a payment method with encrypted card
    4. Creates a charge in Flutterwave
    5. Creates a payment record in the database

    Args:
        db: Database session
        order_id: Order ID to pay for
        email: Customer email
        first_name: Customer first name
        last_name: Customer last name
        phone: Customer phone number
        card_number: Card number
        exp_month: Expiry month
        exp_year: Expiry year
        cvv: Card CVV
        currency: Currency code (default: USD)
        user_id: User ID (for authorization check)

    Returns:
        DBPayment: Payment record

    Raises:
        HTTPException: If order not found, invalid status, or payment fails
    """
    logger.info(f"Initiating payment for order {order_id}")

    # 1. Validate order exists and is pending
    order = db.query(DBOrder).filter(DBOrder.id == order_id).first()

    if not order:
        logger.error(f"Order {order_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found"
        )

    # Check if user owns this order (if user_id provided)
    if user_id and order.user_id != user_id:
        logger.error(f"User {user_id} not authorized to pay for order {order_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this order"
        )

    # Check order status
    if order.status != "PENDING":
        logger.error(f"Order {order_id} is not pending (status: {order.status})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order is already {order.status.lower()}"
        )

    # Check if payment already exists for this order
    existing_payment = db.query(DBPayment).filter(DBPayment.order_id == order_id).first()
    if existing_payment:
        logger.error(f"Payment already exists for order {order_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already initiated for this order"
        )

    # 2. Generate payment reference
    reference = generate_payment_reference()
    logger.info(f"Generated payment reference: {reference}")

    # 3. Create payment record in database (PENDING status)
    payment = DBPayment(
        order_id=order_id,
        amount=order.total_price,
        currency=currency,
        status=PaymentStatus.PENDING,
        reference=reference,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    logger.info(f"Created payment record: {payment.id}")

    try:
        # 4. Update payment status to PROCESSING
        payment.status = PaymentStatus.PROCESSING
        db.commit()

        # 5. Create customer in Flutterwave
        # Clean phone number: remove + and extract country code
        clean_phone = phone.replace("+", "").replace("-", "").replace(" ", "")

        # Extract country code (assume US +1 if 11 digits starting with 1)
        country_code = "1"
        phone_number = clean_phone

        if len(clean_phone) == 11 and clean_phone.startswith("1"):
            # US number with country code: +1234567890 -> 234567890, country_code=1
            phone_number = clean_phone[1:]
        elif len(clean_phone) > 10:
            # Other country codes - take last 10 digits as phone number
            phone_number = clean_phone[-10:]
            country_code = clean_phone[:-10]

        logger.info(f"Creating customer in Flutterwave with phone: {phone_number}, country_code: {country_code}")
        customer = create_customer(email, first_name, last_name, phone_number, country_code)
        customer_id = customer["id"]

        # 6. Create payment method
        logger.info("Creating payment method in Flutterwave")
        payment_method = create_card_payment_method(
            card_number, exp_month, exp_year, cvv
        )
        payment_method_id = payment_method["id"]

        # 7. Create charge
        logger.info(f"Creating charge for amount {order.total_price} {currency}")

        # Use ngrok URL for local development
        import os
        base_url = os.getenv("FRONTEND_BASE_URL", "https://arrowy-daisy-officeless.ngrok-free.dev")
        redirect_url = f"{base_url}/payment/callback"

        charge = charge_card(
            customer_id=customer_id,
            payment_method_id=payment_method_id,
            amount=float(order.total_price),
            currency=currency,
            reference=reference,
            redirect_url=redirect_url
        )

        charge_id = charge["id"]
        charge_status = charge["status"]

        # 8. Update payment with Flutterwave IDs
        payment.flutterwave_charge_id = charge_id
        payment.flutterwave_customer_id = customer_id
        payment.payment_method_id = payment_method_id
        payment.payment_metadata = {
            "customer_email": email,
            "customer_name": f"{first_name} {last_name}",
            "charge_status": charge_status,
        }

        # 9. Handle different charge statuses
        if charge_status == "succeeded":
            # Payment successful immediately
            payment.status = PaymentStatus.SUCCESSFUL
            order.status = "COMPLETED"
            logger.info(f"Payment {payment.id} successful")

        elif charge_status in ["pending", "requires_action"]:
            # Payment requires 3DS or other action
            # Keep status as PROCESSING, webhook will update it
            logger.info(f"Payment {payment.id} pending action: {charge_status}")

        else:
            # Payment failed
            payment.status = PaymentStatus.FAILED
            payment.payment_metadata["failure_reason"] = charge.get("message", "Unknown error")
            logger.error(f"Payment {payment.id} failed: {charge_status}")

        db.commit()
        db.refresh(payment)

        return payment

    except Exception as e:
        # If Flutterwave API fails, update payment status
        logger.error(f"Payment failed with error: {str(e)}")
        payment.status = PaymentStatus.FAILED
        payment.payment_metadata = {
            "error": str(e),
            "error_type": type(e).__name__
        }
        db.commit()
        db.refresh(payment)

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment processing failed: {str(e)}"
        )


def verify_payment(
    db: Session,
    payment_id: Optional[str] = None,
    reference: Optional[str] = None
) -> Dict[str, Any]:
    """
    Verify a payment status by re-checking with Flutterwave.

    Always verify payment status server-side before trusting.
    Can lookup by payment_id or reference.

    Args:
        db: Database session
        payment_id: Payment UUID (optional)
        reference: Payment reference (optional)

    Returns:
        Dict containing payment and charge data

    Raises:
        HTTPException: If payment not found
    """
    logger.info(f"Verifying payment - ID: {payment_id}, Reference: {reference}")

    # Find payment
    payment = None
    if payment_id:
        payment = db.query(DBPayment).filter(DBPayment.id == payment_id).first()
    elif reference:
        payment = db.query(DBPayment).filter(DBPayment.reference == reference).first()

    if not payment:
        logger.error("Payment not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # If no Flutterwave charge ID, payment hasn't been processed
    if not payment.flutterwave_charge_id:
        logger.warning(f"Payment {payment.id} has no charge ID")
        return {
            "payment_id": payment.id,
            "status": payment.status.value,
            "message": "Payment not yet processed"
        }

    # Verify with Flutterwave
    try:
        charge = get_charge(payment.flutterwave_charge_id)

        charge_status = charge.get("status")
        logger.info(f"Charge status from Flutterwave: {charge_status}")

        # Update payment status based on Flutterwave response
        if charge_status == "succeeded" and payment.status != PaymentStatus.SUCCESSFUL:
            payment.status = PaymentStatus.SUCCESSFUL
            # Update order status
            order = db.query(DBOrder).filter(DBOrder.id == payment.order_id).first()
            if order:
                order.status = "COMPLETED"
            db.commit()
            logger.info(f"Payment {payment.id} verified as successful")

        elif charge_status == "failed" and payment.status != PaymentStatus.FAILED:
            payment.status = PaymentStatus.FAILED
            db.commit()
            logger.info(f"Payment {payment.id} verified as failed")

        return {
            "payment_id": payment.id,
            "order_id": payment.order_id,
            "reference": payment.reference,
            "status": payment.status.value,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "charge_status": charge_status,
            "charge_data": charge
        }

    except Exception as e:
        logger.error(f"Failed to verify payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to verify payment: {str(e)}"
        )


def handle_successful_payment(
    db: Session,
    reference: str,
    charge_data: Optional[Dict[str, Any]] = None
) -> DBPayment:
    """
    Handle a successful payment (called from webhook or callback).

    Updates payment status to SUCCESSFUL and order status to COMPLETED.

    Args:
        db: Database session
        reference: Payment reference
        charge_data: Optional charge data from Flutterwave

    Returns:
        DBPayment: Updated payment record

    Raises:
        PaymentError: If payment not found
    """
    logger.info(f"Handling successful payment: {reference}")

    payment = db.query(DBPayment).filter(DBPayment.reference == reference).first()

    if not payment:
        logger.error(f"Payment not found for reference: {reference}")
        raise PaymentError(f"Payment not found for reference: {reference}")

    # Idempotency check - if already successful, skip
    if payment.status == PaymentStatus.SUCCESSFUL:
        logger.info(f"Payment {payment.id} already marked as successful")
        return payment

    # Update payment status
    payment.status = PaymentStatus.SUCCESSFUL

    if charge_data:
        payment.payment_metadata = {
            **(payment.payment_metadata or {}),
            "charge_data": charge_data,
            "processed_at": str(db.execute("SELECT NOW()").scalar())
        }

    # Update order status
    order = db.query(DBOrder).filter(DBOrder.id == payment.order_id).first()
    if order:
        order.status = "COMPLETED"
        logger.info(f"Order {order.id} marked as COMPLETED")

    db.commit()
    db.refresh(payment)

    logger.info(f"Payment {payment.id} marked as SUCCESSFUL")

    return payment


def handle_failed_payment(
    db: Session,
    reference: str,
    failure_reason: Optional[str] = None
) -> DBPayment:
    """
    Handle a failed payment (called from webhook).

    Updates payment status to FAILED.

    Args:
        db: Database session
        reference: Payment reference
        failure_reason: Reason for failure

    Returns:
        DBPayment: Updated payment record

    Raises:
        PaymentError: If payment not found
    """
    logger.warning(f"Handling failed payment: {reference}")

    payment = db.query(DBPayment).filter(DBPayment.reference == reference).first()

    if not payment:
        logger.error(f"Payment not found for reference: {reference}")
        raise PaymentError(f"Payment not found for reference: {reference}")

    # Update payment status
    payment.status = PaymentStatus.FAILED

    if failure_reason:
        payment.payment_metadata = {
            **(payment.payment_metadata or {}),
            "failure_reason": failure_reason,
            "failed_at": str(db.execute("SELECT NOW()").scalar())
        }

    db.commit()
    db.refresh(payment)

    logger.info(f"Payment {payment.id} marked as FAILED")

    return payment


def get_payment_by_order(db: Session, order_id: int) -> Optional[DBPayment]:
    """
    Get payment details for an order.

    Args:
        db: Database session
        order_id: Order ID

    Returns:
        DBPayment if found, None otherwise
    """
    return db.query(DBPayment).filter(DBPayment.order_id == order_id).first()


def get_payment_by_reference(db: Session, reference: str) -> Optional[DBPayment]:
    """
    Get payment details by reference.

    Args:
        db: Database session
        reference: Payment reference

    Returns:
        DBPayment if found, None otherwise
    """
    return db.query(DBPayment).filter(DBPayment.reference == reference).first()
