from enum import Enum
from uuid import UUID
import uuid
import secrets
import string

from starlette.convertors import Convertor


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UUIDConvertor(Convertor):
    """UUID Convertor with a regex"""

    # Standard UUID regex pattern
    regex = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"

    def convert(self, value: str) -> UUID:
        return UUID(value)

    def to_string(self, value: UUID) -> str:
        return str(value)


def generate_payment_reference() -> str:
    """
    Generate a unique payment reference.
    Format: FV-{timestamp}-{random}
    """
    import time
    timestamp = int(time.time())
    random_str = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    return f"FV-{timestamp}-{random_str}"


def validate_card_number(card_number: str) -> bool:
    """
    Validate card number using Luhn algorithm.
    """
    # Remove spaces and dashes
    card_number = card_number.replace(" ", "").replace("-", "")
    
    if not card_number.isdigit():
        return False
    
    if len(card_number) < 13 or len(card_number) > 19:
        return False
    
    # Luhn algorithm
    digits = [int(d) for d in card_number]
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    
    checksum = sum(odd_digits)
    for d in even_digits:
        doubled = d * 2
        if doubled > 9:
            doubled = doubled - 9
        checksum += doubled
    
    return checksum % 10 == 0


def validate_expiry_date(exp_month: str, exp_year: str) -> bool:
    """
    Validate card expiry date.
    """
    from datetime import datetime
    
    try:
        month = int(exp_month)
        year = int(exp_year)
        
        # Ensure year is 4 digits
        if year < 100:
            year += 2000
        
        # Check if month is valid
        if month < 1 or month > 12:
            return False
        
        # Check if date is in the future
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        if year < current_year:
            return False
        if year == current_year and month < current_month:
            return False
        
        return True
    except ValueError:
        return False


def validate_cvv(cvv: str) -> bool:
    """
    Validate CVV.
    """
    return cvv.isdigit() and 3 <= len(cvv) <= 4
