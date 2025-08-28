from pydantic import BaseModel


class ErrorResponse(BaseModel):
  """
  A Pydantic model representing an error response.

  Attributes:
      error (str): A description of the error.
  """
  detail: str