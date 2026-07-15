"""
Flutterwave Card Data Encryption

Implements AES-256-GCM encryption for sensitive card data as required by Flutterwave v4 API.
All card details (number, expiry, CVV) must be encrypted before being sent to the API.
"""

import base64
import secrets
import string
import logging
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logger = logging.getLogger(__name__)


class AESEncryptor:
    """
    AES-256-GCM encryptor for Flutterwave card data.
    
    Uses the Flutterwave encryption key to encrypt sensitive card information.
    All fields in a single request should use the same nonce.
    """
    
    def __init__(self, encryption_key: str):
        """
        Initialize the encryptor with the base64-encoded encryption key.
        
        Args:
            encryption_key: Base64-encoded AES-256 key from Flutterwave dashboard
        """
        try:
            self.aes_key = base64.b64decode(encryption_key)
            logger.debug("AES encryptor initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AES encryptor: {str(e)}")
            raise ValueError("Invalid encryption key. Must be base64-encoded.")
    
    @staticmethod
    def generate_nonce(length: int = 12) -> str:
        """
        Generate a random nonce for encryption.
        
        The nonce must be exactly 12 characters and should be unique for each request.
        The same nonce must be used for all fields encrypted in the same request.
        
        Args:
            length: Length of nonce (default: 12, as required by Flutterwave)
            
        Returns:
            str: Random alphanumeric nonce
        """
        if length != 12:
            logger.warning(f"Nonce length should be 12, got {length}")
        
        characters = string.ascii_letters + string.digits
        nonce = "".join(secrets.choice(characters) for _ in range(length))
        
        logger.debug(f"Generated nonce: {nonce}")
        return nonce
    
    def encrypt(self, plain_text: str, nonce: str) -> str:
        """
        Encrypt a plain text string using AES-256-GCM.
        
        Args:
            plain_text: The data to encrypt (e.g., card number, CVV)
            nonce: 12-character nonce (must be the same for all fields in a request)
            
        Returns:
            str: Base64-encoded encrypted data
            
        Raises:
            ValueError: If plain_text or nonce is empty
            Exception: If encryption fails
        """
        if not plain_text or not nonce:
            raise ValueError("Both plain_text and nonce are required")
        
        if len(nonce) != 12:
            raise ValueError(f"Nonce must be exactly 12 characters, got {len(nonce)}")
        
        try:
            # Create AES-GCM cipher
            aes_gcm = AESGCM(self.aes_key)
            
            # Encrypt the data
            # The nonce must be bytes, and we pass None for associated_data
            cipher_text = aes_gcm.encrypt(
                nonce.encode('utf-8'), 
                plain_text.encode('utf-8'), 
                None
            )
            
            # Return base64-encoded ciphertext
            encrypted = base64.b64encode(cipher_text).decode('utf-8')
            
            logger.debug(f"Encrypted data successfully (length: {len(encrypted)})")
            return encrypted
            
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise
    
    def validate_key(self) -> bool:
        """
        Validate that the encryption key is properly configured.
        
        Returns:
            bool: True if key is valid, False otherwise
        """
        try:
            if not self.aes_key:
                return False
            if len(self.aes_key) != 32:  # AES-256 requires 32-byte key
                logger.error(f"Invalid key length: {len(self.aes_key)} bytes (expected 32)")
                return False
            return True
        except Exception as e:
            logger.error(f"Key validation failed: {str(e)}")
            return False


# Example usage (for documentation purposes)
"""
import os

# Initialize with encryption key from environment
encryptor = AESEncryptor(os.getenv("FLW_ENCRYPTION_KEY"))

# Generate nonce for a payment request
nonce = AESEncryptor.generate_nonce()

# Encrypt card details (use same nonce for all fields)
encrypted_card = encryptor.encrypt("4187425075116567", nonce)
encrypted_month = encryptor.encrypt("12", nonce)
encrypted_year = encryptor.encrypt("2025", nonce)
encrypted_cvv = encryptor.encrypt("123", nonce)

# Send to Flutterwave with the nonce
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
"""
