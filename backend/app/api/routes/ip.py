import ipaddress

from fastapi import APIRouter, HTTPException

from app.main_state import ip_service
from app.models.ip_model import IPLookupResponse

router = APIRouter(tags=["ip"])


@router.get("/ip/{ip}", response_model=IPLookupResponse)
def get_ip(ip: str) -> IPLookupResponse:
    try:
        ipaddress.ip_address(ip)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid IP address") from exc

    data = ip_service.resolve_ip(ip)
    return IPLookupResponse(**data)
