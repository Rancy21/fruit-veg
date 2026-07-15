"""
Flutterwave OAuth 2.0 Token Manager

Handles automatic token generation and refresh for Flutterwave v4 API.
Tokens are valid for 10 minutes and are refreshed automatically with a 60-second buffer.
"""

import time
import httpx
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Environment variables
TOKEN_URL = os.getenv("FLW_TOKEN_URL")
CLIENT_ID = os.getenv("FLW_CLIENT_ID")
CLIENT_SECRET = os.getenv("FLW_CLIENT_SECRET")


class FlutterwaveAuth:
    """
    Manages OAuth 2.0 authentication for Flutterwave API.
    
    Automatically refreshes tokens before expiry to ensure continuous access.
    Thread-safe implementation for concurrent requests.
    """
    
    def __init__(self):
        self._token: Optional[str] = None
        self._expires_at: float = 0
        self._lock = False
    
    def get_token(self) -> str:
        """
        Get a valid access token.
        
        Returns a cached token if still valid, otherwise fetches a new one.
        Refreshes token 60 seconds before actual expiry to avoid mid-request expiration.
        
        Returns:
            str: Valid access token
            
        Raises:
            httpx.HTTPStatusError: If token fetch fails
        """
        # Refresh if token is None or will expire in next 60 seconds
        if self._token is None or time.time() > self._expires_at - 60:
            self._refresh()
        
        return self._token
    
    def _refresh(self) -> None:
        """
        Fetch a new access token from Flutterwave OAuth endpoint.
        
        Uses client credentials grant type.
        Updates internal token and expiry time.
        """
        logger.info("Refreshing Flutterwave access token")
        
        try:
            response = httpx.post(
                TOKEN_URL,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "grant_type": "client_credentials",
                },
                timeout=30.0,
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Store token and calculate expiry time
            self._token = data["access_token"]
            self._expires_at = time.time() + data["expires_in"]
            
            logger.info(f"Token refreshed successfully. Expires in {data['expires_in']} seconds")
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to refresh token: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error refreshing token: {str(e)}")
            raise
    
    def clear_token(self) -> None:
        """
        Clear the cached token.
        
        Useful when you want to force a fresh token fetch on next request.
        """
        self._token = None
        self._expires_at = 0
        logger.info("Token cache cleared")


# Global instance for reuse across the application
flw_auth = FlutterwaveAuth()
