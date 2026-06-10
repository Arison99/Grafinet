from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends

from app.api.deps import require_auth_token
from app.main_state import ip_service
from app.models.search_model import (
    RouteHop,
    RouteSimulationRequest,
    RouteSimulationResponse,
)

router = APIRouter(tags=["simulate"])


@router.post("/simulate/route", response_model=RouteSimulationResponse)
async def simulate_route(
    payload: RouteSimulationRequest,
    _username: str = Depends(require_auth_token),
) -> RouteSimulationResponse:
    hops = await asyncio.to_thread(
        ip_service.simulate_route,
        payload.source.strip(),
        payload.destination.strip(),
    )
    return RouteSimulationResponse(
        source=payload.source,
        destination=payload.destination,
        hops=[RouteHop(**hop) for hop in hops],
        hop_count=len(hops),
    )
