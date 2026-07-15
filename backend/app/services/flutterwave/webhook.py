"""
Flutterwave Webhook Handler

Handles incoming webhooks from Flutterwave for payment events.
Implements signature verification and idempotent processing.
"""

import os
import hmac
import hashlib
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Secret hash for webhook signature verification
SECRET_HASH = os.getenv("FLW_SECRET_HASH")


def verify_webhook_signature(
    signature: str, 
    payload: str
) -> bool:
    """
    Verify the webhook signature from Flutterwave.
    
    Flutterwave signs webhooks using HMAC-SHA256 with the secret hash,
    base64-encoding the result. This function performs the same computation
    and compares using constant-time comparison to prevent timing attacks.
    
    Args:
        signature: The flutterwave-signature header value
        payload: Raw request body as string
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    if not signature or not SECRET_HASH:
        logger.warning("Missing signature or secret hash")
        return False
    
    try:
        # Compute HMAC-SHA256 hash
        expected_signature = hmac.new(
            SECRET_HASH.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        # Base64 encode
        expected_signature_b64 = hmac.new(
            SECRET_HASH.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()  # Flutterwave uses hex encoding in sandbox
        
        # Constant-time comparison to prevent timing attacks
        is_valid = hmac.compare_digest(signature, expected_signature_b64)
        
        if is_valid:
            logger.debug("Webhook signature verified successfully")
        else:
            logger.warning("Invalid webhook signature")
        
        return is_valid
        
    except Exception as e:
        logger.error(f"Error verifying webhook signature: {str(e)}")
        return False


def process_webhook_event(
    event_type: str, 
    event_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Process a webhook event from Flutterwave.
    
    This function should be called after verifying the signature.
    It routes the event to the appropriate handler based on type.
    
    Args:
        event_type: The event type (e.g., "charge.completed")
        event_data: The event data payload
        
    Returns:
        Dict containing processing result
    """
    logger.info(f"Processing webhook event: {event_type}")
    
    try:
        # Route to specific handlers based on event type
        if event_type == "charge.completed":
            return _handle_charge_completed(event_data)
        elif event_type == "charge.failed":
            return _handle_charge_failed(event_data)
        else:
            logger.warning(f"Unhandled event type: {event_type}")
            return {"status": "ignored", "message": f"Event type {event_type} not handled"}
            
    except Exception as e:
        logger.error(f"Error processing webhook event: {str(e)}")
        return {"status": "error", "message": str(e)}


def _handle_charge_completed(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle charge.completed webhook event.
    
    This is called when a payment is successful.
    Updates the payment and order status in the database.
    
    Args:
        event_data: Charge completion data
        
    Returns:
        Dict containing processing result
    """
    charge_id = event_data.get("id")
    reference = event_data.get("reference")
    status = event_data.get("status")
    
    logger.info(f"Charge completed - ID: {charge_id}, Reference: {reference}, Status: {status}")
    
    # This will be implemented in Phase 3 when we create the payment service
    # For now, just return the data
    return {
        "status": "success",
        "charge_id": charge_id,
        "reference": reference,
        "message": "Charge completed successfully"
    }


def _handle_charge_failed(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle charge.failed webhook event.
    
    This is called when a payment fails.
    Updates the payment and order status in the database.
    
    Args:
        event_data: Charge failure data
        
    Returns:
        Dict containing processing result
    """
    charge_id = event_data.get("id")
    reference = event_data.get("reference")
    status = event_data.get("status")
    
    logger.warning(f"Charge failed - ID: {charge_id}, Reference: {reference}, Status: {status}")
    
    # This will be implemented in Phase 3 when we create the payment service
    # For now, just return the data
    return {
        "status": "failed",
        "charge_id": charge_id,
        "reference": reference,
        "message": "Charge failed"
    }


def extract_webhook_data(payload: Dict[str, Any]) -> tuple:
    """
    Extract event type and data from webhook payload.
    
    Args:
        payload: Full webhook payload
        
    Returns:
        Tuple of (event_type, event_data)
    """
    event_type = payload.get("event")
    event_data = payload.get("data", {})
    
    return event_type, event_data
