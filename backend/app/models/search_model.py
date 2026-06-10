from __future__ import annotations

from pydantic import BaseModel


class CountryASNItem(BaseModel):
    country: str
    asn: int
    entity: str | None = None
    sample_ip: str | None = None
    hits: int
    observed_ips: int
    last_seen_at: int


class CountryASNResponse(BaseModel):
    country: str
    count: int
    items: list[CountryASNItem]


class APIRequestLogItem(BaseModel):
    request_id: str
    method: str
    path: str
    status_code: int
    duration_ms: float
    username: str | None = None
    client_ip: str | None = None
    error: str | None = None
    created_at: int


class APIRequestLogResponse(BaseModel):
    count: int
    items: list[APIRequestLogItem]


class RouteHop(BaseModel):
    hop: int
    type: str
    input: str
    asn: int | None = None
    entity: str | None = None
    country: str | None = None
    sample_ip: str | None = None
    prefix_count: int | None = None


class RouteSimulationRequest(BaseModel):
    source: str
    destination: str


class RouteSimulationResponse(BaseModel):
    source: str
    destination: str
    hops: list[RouteHop]
    hop_count: int
    note: str = "Simulated path for exploration with random peering hops; real BGP policy is not enforced."
