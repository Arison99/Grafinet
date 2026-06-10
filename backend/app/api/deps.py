from fastapi import Header, HTTPException

from app.main_state import auth_service


def require_auth_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization scheme")

    token = parts[1].strip()
    username = auth_service.validate_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return username
