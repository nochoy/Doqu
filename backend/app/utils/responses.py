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

    Raises:
        ValueError: If any provided status code is not supported.
    """
    base = {
        400: {"model": ErrorResponse, "status_code": 400, "description": "Error: Bad Request"},
        401: {"model": ErrorResponse, "status_code": 401, "description": "Error: Unauthorized"},
        403: {"model": ErrorResponse, "status_code": 403, "description": "Error: Forbidden"},
        404: {"model": ErrorResponse, "status_code": 404, "description": "Error: Not Found"},
        409: {"model": ErrorResponse, "status_code": 409, "description": "Error: Conflict"},
        500: {"model": ErrorResponse, "status_code": 500, "description": "Error: Internal Server Error"},
    }

    unknown = [c for c in codes if c not in base]
    if unknown:
        raise ValueError(f"Unsupported response code(s): {unknown}")
    return {code: base[code] for code in codes}
