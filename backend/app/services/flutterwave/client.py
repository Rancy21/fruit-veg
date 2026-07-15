"""
Flutterwave API Client

High-level client for interacting with Flutterwave v4 API.
Handles customer creation, payment method management, and charge creation.
"""

import os
import uuid
import httpx
import logging
from typing import Optional, Dict, Any

from .auth import flw_auth
from .crypto import AESEncryptor

logger = logging.getLogger(__name__)

# Environment variables
BASE_URL = os.getenv("FLW_BASE_URL")
ENCRYPTION_KEY = os.getenv("FLW_ENCRYPTION_KEY")

# Initialize encryptor
encryptor = AESEncryptor(ENCRYPTION_KEY)


def _headers(idempotency_key: Optional[str] = None) -> Dict[str, str]:
    """
    Build headers for Flutterwave API requests.
    
    Args:
        idempotency_key: Optional unique key to prevent duplicate requests
        
    Returns:
        Dict containing required headers
    """
    headers = {
        "Authorization": f"Bearer {flw_auth.get_token()}",
        "Content-Type": "application/json",
        "X-Trace-Id": str(uuid.uuid4()),
    }
    
    if idempotency_key:
        headers["X-Idempotency-Key"] = idempotency_key
    
    logger.debug(f"Request headers prepared. Trace-ID: {headers['X-Trace-Id']}")
    return headers


def get_customer_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a customer from Flutterwave by email.
    
    Args:
        email: Customer email address
        
    Returns:
        Dict containing customer data if found, None otherwise
    """
    logger.info(f"Fetching customer by email: {email}")
    
    try:
        response = httpx.get(
            f"{BASE_URL}/customers",
            headers=_headers(),
            params={"email": email},
            timeout=30.0
        )
        response.raise_for_status()
        
        data = response.json()
        
        # Check if we got any customers back
        if data.get("data") and len(data["data"]) > 0:
            # Return the first matching customer
            customer = data["data"][0]
            logger.info(f"Found existing customer. ID: {customer.get('id')}")
            return customer
        
        logger.info("No customer found with this email")
        return None
        
    except Exception as e:
        logger.error(f"Error fetching customer: {str(e)}")
        return None


def create_customer(
    email: str, 
    first_name: str, 
    last_name: str, 
    phone: str,
    country_code: str = "1"
) -> Dict[str, Any]:
    """
    Create a customer object in Flutterwave.
    
    If customer already exists (409 Conflict), retrieves and returns the existing customer.
    
    Args:
        email: Customer email address
        first_name: Customer first name
        last_name: Customer last name
        phone: Customer phone number
        country_code: Phone country code (default: "1" for US)
        
    Returns:
        Dict containing customer data including customer ID
        
    Raises:
        httpx.HTTPStatusError: If API request fails with non-409 error
    """
    logger.info(f"Creating customer: {email}")
    
    payload = {
        "email": email,
        "name": {
            "first": first_name,
            "last": last_name
        },
        "phone": {
            "country_code": country_code,
            "number": phone
        }
    }
    
    try:
        response = httpx.post(
            f"{BASE_URL}/customers",
            headers=_headers(),
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        
        data = response.json()["data"]
        logger.info(f"Customer created successfully. ID: {data.get('id')}")
        
        return data
        
    except httpx.HTTPStatusError as e:
        # Handle 409 Conflict - customer already exists
        if e.response.status_code == 409:
            logger.warning(f"Customer already exists, fetching existing customer: {email}")
            
            # Try to get the existing customer
            existing_customer = get_customer_by_email(email)
            
            if existing_customer:
                logger.info(f"Retrieved existing customer. ID: {existing_customer.get('id')}")
                return existing_customer
            else:
                # Shouldn't happen, but log it
                logger.error("Customer exists but couldn't be retrieved")
                raise
        else:
            logger.error(f"Failed to create customer: {e.response.status_code} - {e.response.text}")
            raise
    except Exception as e:
        logger.error(f"Unexpected error creating customer: {str(e)}")
        raise


def create_card_payment_method(
    card_number: str, 
    exp_month: str, 
    exp_year: str, 
    cvv: str
) -> Dict[str, Any]:
    """
    Create a card payment method with encrypted card details.
    
    Args:
        card_number: Card number (PAN)
        exp_month: Expiry month (MM or M)
        exp_year: Expiry year (YY or YYYY)
        cvv: Card verification value (CVV/CVC)
        
    Returns:
        Dict containing payment method data including payment method ID
        
    Raises:
        httpx.HTTPStatusError: If API request fails
        ValueError: If card details are invalid
    """
    logger.info("Creating card payment method")
    
    # Normalize expiry month to 2 digits (M -> MM)
    if len(exp_month) == 1:
        exp_month = "0" + exp_month
    
    # Normalize expiry year to 2 digits (YYYY -> YY)
    if len(exp_year) == 4:
        exp_year = exp_year[-2:]  # Take last 2 digits: 2025 -> 25
    
    logger.info(f"Normalized expiry: {exp_month}/{exp_year}")
    
    # Generate nonce for this payment method (same for all card fields)
    nonce = encryptor.generate_nonce()
    
    # Encrypt card details
    try:
        encrypted_card = encryptor.encrypt(card_number, nonce)
        encrypted_month = encryptor.encrypt(exp_month, nonce)
        encrypted_year = encryptor.encrypt(exp_year, nonce)
        encrypted_cvv = encryptor.encrypt(cvv, nonce)
        
        logger.debug("Card details encrypted successfully")
        
    except Exception as e:
        logger.error(f"Failed to encrypt card details: {str(e)}")
        raise
    
    payload = {
        "type": "card",
        "card": {
            "encrypted_card_number": encrypted_card,
            "encrypted_expiry_month": encrypted_month,
            "encrypted_expiry_year": encrypted_year,
            "encrypted_cvv": encrypted_cvv,
            "nonce": nonce,
        }
    }
    
    try:
        response = httpx.post(
            f"{BASE_URL}/payment-methods",
            headers=_headers(idempotency_key=str(uuid.uuid4())),
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        
        data = response.json()["data"]
        logger.info(f"Payment method created successfully. ID: {data.get('id')}")
        
        return data
        
    except httpx.HTTPStatusError as e:
        logger.error(f"Failed to create payment method: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating payment method: {str(e)}")
        raise


def charge_card(
    customer_id: str,
    payment_method_id: str,
    amount: float,
    currency: str,
    reference: str,
    redirect_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a charge using a customer and payment method.
    
    Args:
        customer_id: Flutterwave customer ID
        payment_method_id: Flutterwave payment method ID
        amount: Amount to charge (in smallest currency unit, e.g., cents for USD)
        currency: Currency code (e.g., "USD", "NGN")
        reference: Unique transaction reference
        redirect_url: URL to redirect after 3DS authentication (optional for sandbox)
        
    Returns:
        Dict containing charge data including charge ID and status
        
    Raises:
        httpx.HTTPStatusError: If API request fails
    """
    logger.info(f"Creating charge: {reference} - {amount} {currency}")
    
    payload = {
        "reference": reference,
        "currency": currency,
        "customer_id": customer_id,
        "payment_method_id": payment_method_id,
        "amount": amount,
    }
    
    # Add redirect URL if provided (required for 3DS)
    if redirect_url:
        payload["redirect_url"] = redirect_url
    
    try:
        response = httpx.post(
            f"{BASE_URL}/charges",
            headers=_headers(idempotency_key=str(uuid.uuid4())),
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        
        data = response.json()["data"]
        logger.info(f"Charge created successfully. ID: {data.get('id')}, Status: {data.get('status')}")
        
        return data
        
    except httpx.HTTPStatusError as e:
        logger.error(f"Failed to create charge: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating charge: {str(e)}")
        raise


def get_charge(charge_id: str) -> Dict[str, Any]:
    """
    Retrieve charge details by ID.
    
    Used to verify charge status after webhook or callback.
    
    Args:
        charge_id: Flutterwave charge ID
        
    Returns:
        Dict containing charge data
        
    Raises:
        httpx.HTTPStatusError: If API request fails
    """
    logger.info(f"Fetching charge: {charge_id}")
    
    try:
        response = httpx.get(
            f"{BASE_URL}/charges/{charge_id}",
            headers=_headers(),
            timeout=30.0
        )
        response.raise_for_status()
        
        data = response.json()["data"]
        logger.info(f"Charge fetched. Status: {data.get('status')}")
        
        return data
        
    except httpx.HTTPStatusError as e:
        logger.error(f"Failed to fetch charge: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching charge: {str(e)}")
        raise


def get_charge_by_reference(reference: str) -> Dict[str, Any]:
    """
    Retrieve charge details by reference.
    
    Alternative way to verify charge using the unique reference.
    
    Args:
        reference: Unique transaction reference
        
    Returns:
        Dict containing charge data
        
    Raises:
        httpx.HTTPStatusError: If API request fails
    """
    logger.info(f"Fetching charge by reference: {reference}")
    
    try:
        response = httpx.get(
            f"{BASE_URL}/charges",
            headers=_headers(),
            params={"reference": reference},
            timeout=30.0
        )
        response.raise_for_status()
        
        data = response.json()["data"]
        logger.info(f"Charge fetched by reference. Status: {data.get('status')}")
        
        return data
        
    except httpx.HTTPStatusError as e:
        logger.error(f"Failed to fetch charge by reference: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching charge by reference: {str(e)}")
        raise
