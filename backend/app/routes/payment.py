"""
Payment API Endpoints

REST API endpoints for payment processing.
Handles payment initiation, verification, webhooks, and callbacks.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
import fastapi
from sqlalchemy.orm import Session

from ..routes.auth import DBSession
from ..services.user_auth import require_role
from ..utils import UserRole
from ..services.payment_service import (
    initiate_payment,
    verify_payment,
    handle_successful_payment,
    handle_failed_payment,
    PaymentError,
)
from ..services.flutterwave.webhook import (
    verify_webhook_signature,
    process_webhook_event,
    extract_webhook_data,
)
from ..schemas import (
    InitiatePaymentRequest,
    InitiatePaymentResponse,
    PaymentStatusResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post(
    "/initiate",
    response_model=InitiatePaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Initiate a payment",
    description="Start a payment process for an order using card details"
)
async def create_payment(
    db: DBSession,
    request: InitiatePaymentRequest,
    current_user = Depends(require_role([UserRole.USER]))
):
    """
    Initiate a payment for an order.

    This endpoint:
    - Validates the order and user
    - Creates a customer in Flutterwave
    - Encrypts and processes card details
    - Creates a charge
    - Returns payment status

    Requires authentication.
    """
    logger.info(f"Payment initiation requested for order {request.order_id} by user {current_user.id}")

    try:
        payment = initiate_payment(
            db=db,
            order_id=request.order_id,
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone,
            card_number=request.card_number,
            exp_month=request.exp_month,
            exp_year=request.exp_year,
            cvv=request.cvv,
            currency=request.currency,
            user_id=current_user.id
        )

        # Build response
        response = InitiatePaymentResponse(
            payment_id=payment.id,
            reference=payment.reference,
            status=payment.status.value,
            amount=payment.amount,
            currency=payment.currency,
            redirect_url=payment.payment_metadata.get("redirect_url") if payment.payment_metadata else None,
            message="Payment initiated successfully"
        )

        logger.info(f"Payment {payment.id} initiated successfully")
        return response

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error initiating payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate payment"
        )


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Flutterwave webhook handler",
    description="Handle webhook events from Flutterwave"
)
async def flutterwave_webhook(
    request: Request,
    db: DBSession
):
    """
    Handle webhook events from Flutterwave.

    This endpoint:
    - Verifies webhook signature
    - Processes payment events
    - Updates payment and order statuses
    - Returns success response

    No authentication required (verified by signature).
    """
    logger.info("Webhook received from Flutterwave")

    # Get raw body for signature verificationfastapi.status.HTTP_302_FOUND
    body = await request.body()
    body_str = body.decode('utf-8')

    # Get signature from header
    signature = request.headers.get("flutterwave-signature")

    if not signature:
        logger.warning("Webhook missing signature header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing webhook signature"
        )

    # Verify signature
    if not verify_webhook_signature(signature, body_str):
        logger.warning("Invalid webhook signature")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature"
        )

    logger.info("Webhook signature verified")

    # Parse payload
    try:
        import json
        payload = json.loads(body_str)
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload format"
        )

    # Extract event type and data
    event_type, event_data = extract_webhook_data(payload)

    logger.info(f"Processing webhook event: {event_type}")

    # Process the event
    try:
        result = process_webhook_event(event_type, event_data)

        # Update payment in database based on event
        if event_type == "charge.completed":
            reference = event_data.get("reference")
            if reference:
                handle_successful_payment(
                    db=db,
                    reference=reference,
                    charge_data=event_data
                )

        elif event_type == "charge.failed":
            reference = event_data.get("reference")
            if reference:
                handle_failed_payment(
                    db=db,
                    reference=reference,
                    failure_reason=event_data.get("message", "Payment failed")
                )

        logger.info(f"Webhook processed successfully: {event_type}")
        return {"status": "success", "message": f"Event {event_type} processed"}

    except PaymentError as e:
        logger.error(f"Payment error processing webhook: {str(e)}")
        # Still return 200 to prevent Flutterwave retries
        return {"status": "error", "message": str(e)}
    except Exception as e:
        logger.error(f"Unexpected error processing webhook: {str(e)}")
        # Still return 200 to prevent Flutterwave retries
        return {"status": "error", "message": "Processing failed"}


@router.get(
    "/callback",
    summary="Payment callback handler",
    description="Handle redirect after 3DS authentication"
)
async def payment_callback(
    db: DBSession,
    reference: str,
    status: str = None
):
    """
    Handle redirect from Flutterwave after 3DS or other authentication.

    This endpoint:
    - Receives the payment reference
    - Verifies payment status with Flutterwave
    - Updates order if needed
    - Redirects to frontend confirmation page

    No authentication required (uses reference for lookup).
    """
    logger.info(f"Payment callback received - Reference: {reference}, Status: {status}")

    try:
        # Verify payment status with Flutterwave
        result = verify_payment(db=db, reference=reference)

        logger.info(f"Payment verified - Status: {result['status']}")
        logger.info(f"Full result: {result}")

        # Redirect to frontend with status
        from fastapi.responses import RedirectResponse
        import os
        base_url = os.getenv("FRONTEND_BASE_URL", "https://arrowy-daisy-officeless.ngrok-free.dev")
        frontend_url = f"{base_url}/payment/callback?reference={reference}&status={result['status']}"
        
        logger.info(f"Redirecting to: {frontend_url}")

        return RedirectResponse(url=frontend_url, status_code=fastapi.status.HTTP_302_FOUND)

    except Exception as e:
        logger.error(f"Error in payment callback: {str(e)}")
        # Redirect to error page
        from fastapi.responses import RedirectResponse
        import os
        base_url = os.getenv("FRONTEND_BASE_URL", "https://arrowy-daisy-officeless.ngrok-free.dev")
        frontend_url = f"{base_url}/payment/error?reference={reference}&error=verification_failed"
        return RedirectResponse(url=frontend_url, status_code=fastapi.status.HTTP_302_FOUND)


@router.get(
    "/order/{order_id}",
    response_model=PaymentStatusResponse,
    summary="Get payment by order",
    description="Retrieve payment details for an order"
)
async def get_payment_by_order(
    db: DBSession,
    order_id: int,
    current_user = Depends(require_role([UserRole.USER]))
):
    """
    Get payment details by order ID.

    Returns payment information for a specific order.
    Requires authentication and ownership of the order.
    """
    logger.info(f"Payment lookup by order {order_id} by user {current_user.id}")

    from ..services.payment_service import get_payment_by_order
    from ..models import DBOrder

    # Check if user owns the order
    order = db.query(DBOrder).filter(
        DBOrder.id == order_id,
        DBOrder.user_id == current_user.id
    ).first()

    if not order:
        logger.warning(f"User {current_user.id} attempted to access order {order_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    payment = get_payment_by_order(db=db, order_id=order_id)

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payment found for this order"
        )

    return PaymentStatusResponse(
        id=payment.id,
        order_id=payment.order_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status.value,
        reference=payment.reference,
        flutterwave_charge_id=payment.flutterwave_charge_id,
        created_at=payment.created_at,
        updated_at=payment.updated_at
    )


@router.get(
    "/{payment_id}",
    response_model=PaymentStatusResponse,
    summary="Get payment status",
    description="Retrieve payment details and status by payment ID"
)
async def get_payment_status(
    db: DBSession,
    payment_id: str,
    current_user = Depends(require_role([UserRole.USER]))
):
    """
    Get payment status by ID.

    Verifies payment status with Flutterwave API and returns current state.
    Requires authentication.
    """
    logger.info(f"Payment status requested: {payment_id} by user {current_user.id}")

    try:
        result = verify_payment(db=db, payment_id=payment_id)

        # TODO: Add authorization check - ensure user owns the payment

        return PaymentStatusResponse(
            id=result["payment_id"],
            order_id=result["order_id"],
            amount=result["amount"],
            currency=result["currency"],
            status=result["status"],
            reference=result["reference"],
            flutterwave_charge_id=result.get("charge_data", {}).get("id"),
            created_at=result["payment_created_at"] if "payment_created_at" in result else None,
            updated_at=result["payment_updated_at"] if "payment_updated_at" in result else None
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving payment status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payment status"
        )
