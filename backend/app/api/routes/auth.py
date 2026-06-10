from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_auth_token
from app.main_state import auth_service
from app.models.auth_model import AuthResponse, LoginRequest, SignupRequest

router = APIRouter(tags=["auth"])


@router.post("/auth/signup", response_model=AuthResponse)
def signup(payload: SignupRequest) -> AuthResponse:
    result = auth_service.signup(
        username=payload.username, email=payload.email, password=payload.password
    )
    if not result["success"]:
        raise HTTPException(
            status_code=result.get("status_code", 400), detail=result["message"]
        )
    return AuthResponse(**result)


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    result = auth_service.login(username=payload.username, password=payload.password)
    if not result["success"]:
        raise HTTPException(
            status_code=result.get("status_code", 401), detail=result["message"]
        )
    return AuthResponse(**result)


@router.post("/auth/logout", response_model=AuthResponse)
def logout(username: str = Depends(require_auth_token)) -> AuthResponse:
    revoked = auth_service.revoke_token_for_user(username)
    if not revoked:
        raise HTTPException(status_code=400, detail="Unable to logout user")

    return AuthResponse(success=True, message="Logout successful", username=username)
