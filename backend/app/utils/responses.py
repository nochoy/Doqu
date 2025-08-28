from typing import Any, Dict

from app.models.error import ErrorResponse


def get_responses(*codes: int) -> Dict[int | str, Dict[str, Any]]:
    """
    Generate a dictionary of response models and descriptions for given HTTP status codes.

    Args:
        *codes: Variable length argument list of HTTP status codes.

    Returns:
        A dictionary where the keys are the provided status codes and the values are dictionaries
        containing the error response model and description for each code.
    """
    base = {
        400: {"model": ErrorResponse, "description": "Error: Bad Request"},
        401: {"model": ErrorResponse, "description": "Error: Unauthorized"},
        404: {"model": ErrorResponse, "description": "Error: Not Found"},
    }

    return {code: base[code] for code in codes if code in base}
