import ipaddress

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_auth_token
from app.main_state import ip_service, observability_service
from app.models.ip_model import IPLookupResponse

router = APIRouter(tags=["ip"])


@router.get("/ip/{ip}", response_model=IPLookupResponse)
def get_ip(ip: str, _username: str = Depends(require_auth_token)) -> IPLookupResponse:
    try:
        ipaddress.ip_address(ip)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid IP address") from exc

    data = ip_service.resolve_ip(ip)
    observability_service.record_lookup(data)
    return IPLookupResponse(**data)
