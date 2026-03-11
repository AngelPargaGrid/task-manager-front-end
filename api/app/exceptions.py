"""Custom API exceptions and error handlers.

Error codes per PRD section 8.2:
- VALIDATION_ERROR (400)
- UNAUTHORIZED (401)
- FORBIDDEN (403)
- NOT_FOUND (404)
- CONFLICT (409)
- RATE_LIMIT_EXCEEDED (429)
- INTERNAL_ERROR (500)
"""


class APIException(Exception):
    """Base API exception."""

    status_code = 500
    code = "INTERNAL_ERROR"
    message = "An unexpected error occurred"

    def __init__(self, message=None, code=None, status_code=None, errors=None):
        super().__init__()
        self.message = message or self.message
        self.code = code or self.code
        self.status_code = status_code or self.status_code
        self.errors = errors

    def to_dict(self):
        result = {
            "status": "error",
            "message": self.message,
            "code": self.code,
        }
        if self.errors is not None:
            result["errors"] = self.errors
        return result


class ValidationException(APIException):
    """Input validation failed (400)."""

    status_code = 400
    code = "VALIDATION_ERROR"
    message = "Validation failed"

    def __init__(self, message=None, errors=None):
        super().__init__(message=message or self.message, errors=errors)


class UnauthorizedException(APIException):
    """Authentication required (401)."""

    status_code = 401
    code = "UNAUTHORIZED"
    message = "Authentication required"


class ForbiddenException(APIException):
    """Insufficient permissions (403)."""

    status_code = 403
    code = "FORBIDDEN"
    message = "Insufficient permissions"


class NotFoundException(APIException):
    """Resource not found (404)."""

    status_code = 404
    code = "NOT_FOUND"
    message = "Resource not found"


class ConflictException(APIException):
    """Duplicate or conflicting resource (409)."""

    status_code = 409
    code = "CONFLICT"
    message = "Resource conflict"


class RateLimitException(APIException):
    """Too many requests (429)."""

    status_code = 429
    code = "RATE_LIMIT_EXCEEDED"
    message = "Too many requests"
