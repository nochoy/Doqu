from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """
    A Pydantic model representing an error response.

    Attributes:
        detail (str): Human-readable description of the error.
    """
    
    detail: str
