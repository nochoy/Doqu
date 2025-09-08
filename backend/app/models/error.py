from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """
    A Pydantic model representing an error response.

    Attributes:
        status_code (int): HTTP status code of the error.
        detail (str): Human-readable description of the error.
    """
    status_code: int
    detail: str
