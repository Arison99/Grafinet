import ipaddress

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_auth_token
from app.main_state import ip_service
from app.models.ip_model import MapPointResponse

router = APIRouter(tags=["map"])


@router.get("/map/point/{ip}", response_model=MapPointResponse)
def get_map_point(
    ip: str, _username: str = Depends(require_auth_token)
) -> MapPointResponse:
    try:
        ipaddress.ip_address(ip)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid IP address") from exc

    data = ip_service.map_point(ip)
    return MapPointResponse(**data)
