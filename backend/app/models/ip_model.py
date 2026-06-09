from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ASNModel(BaseModel):
    number: int | None = None
    entity: str | None = None
    name: str | None = None


class AnomalyModel(BaseModel):
    anomaly: bool
    score: int
    reasons: list[str]


class IPLookupResponse(BaseModel):
    found: bool
    ip: str
    message: str | None = None
    allocation: str | None = None
    country: str | None = None
    asn: ASNModel | None = None
    prefix: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    ix: str | None = None
    prefix_bogon: bool | None = None
    rpki_status: str | None = None
    anomaly: AnomalyModel | None = None


class MapPointResponse(BaseModel):
    found: bool
    ip: str
    lat: float | None = None
    lon: float | None = None
    asn: ASNModel | None = None
    prefix: str | None = None
    anomaly: dict[str, Any] | None = None
