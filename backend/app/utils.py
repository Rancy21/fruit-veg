from enum import Enum
from uuid import UUID

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
