from fastapi import Response

from app.core.config import settings


def set_auth_cookie(response: Response, access_token: str) -> None:
    """
    Sets an authentication cookie in the response.

    Args:
        `response`: The HTTP response object where the cookie will be set.
        `access_token`: The access token to be stored in the cookie.

    The cookie is HTTP-only, has a SameSite policy of 'lax', and its
    security settings are determined by the application's configuration.
    The cookie will expire after a duration specified by the application's
    settings (30 days).
    """
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.SECURE_COOKIES,
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_DAYS * 60 * 60 * 24,  # 30 days in seconds
    )
