from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, Query

from app.api.deps import require_auth_token
from app.main_state import ip_service, observability_service
from app.models.search_model import (
    APIRequestLogResponse,
    CountryASNItem,
    CountryASNResponse,
)

router = APIRouter(tags=["search"])


@router.get("/search/country/{country}", response_model=CountryASNResponse)
async def get_country_asns(
    country: str,
    limit: int = Query(default=100, ge=1, le=500),
    _username: str = Depends(require_auth_token),
) -> CountryASNResponse:
    mmdb_items = await asyncio.to_thread(
        ip_service.search_asns_by_country_mmdb,
        country,
        limit,
    )
    stats_items = await asyncio.to_thread(
        observability_service.search_asns_by_country,
        country,
        500,
    )

    stats_by_asn = {int(item["asn"]): item for item in stats_items}
    enriched = []
    for item in mmdb_items:
        asn = int(item["asn"])
        stats = stats_by_asn.get(asn)
        enriched.append(
            {
                "country": item["country"],
                "asn": asn,
                "entity": item.get("entity"),
                "sample_ip": item.get("sample_ip"),
                "hits": int((stats or {}).get("hits", 0)),
                "observed_ips": int((stats or {}).get("observed_ips", 0)),
                "last_seen_at": int((stats or {}).get("last_seen_at", 0)),
            }
        )

    return CountryASNResponse(
        country=country.strip().upper(),
        count=len(enriched),
        items=[CountryASNItem(**item) for item in enriched],
    )


@router.get("/observability/requests", response_model=APIRequestLogResponse)
async def get_observability_requests(
    limit: int = Query(default=50, ge=1, le=500),
    _username: str = Depends(require_auth_token),
) -> APIRequestLogResponse:
    items = await asyncio.to_thread(observability_service.list_api_logs, limit)
    return APIRequestLogResponse(count=len(items), items=items)
