from __future__ import annotations

from typing import Any

from app.core.mmdb_loader import IPNetDBLoader
from app.services.anomaly_service import AnomalyService


class IPService:
    def __init__(self, db: IPNetDBLoader) -> None:
        self.db = db
        self.anomaly = AnomalyService()

    def resolve_ip(self, ip: str) -> dict[str, Any]:
        data = self.db.lookup_ip(ip)

        if not data:
            return {
                "found": False,
                "ip": ip,
                "message": "IP not found in database",
            }

        asn = {
            "number": data.get("as"),
            "entity": data.get("as_entity"),
            "name": data.get("as_name"),
        }

        resolved = {
            "found": True,
            "ip": ip,
            "allocation": data.get("allocation"),
            "country": data.get("allocation_cc"),
            "asn": asn,
            "prefix": data.get("prefix"),
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
            "ix": data.get("ix"),
            "prefix_bogon": data.get("prefix_bogon", False),
            "rpki_status": data.get("rpki_status"),
        }

        resolved["anomaly"] = self.anomaly.detect(resolved)
        return resolved

    def map_point(self, ip: str) -> dict[str, Any]:
        data = self.resolve_ip(ip)
        if not data.get("found"):
            return data

        return {
            "found": True,
            "ip": ip,
            "lat": data.get("latitude"),
            "lon": data.get("longitude"),
            "asn": data.get("asn"),
            "prefix": data.get("prefix"),
            "anomaly": data.get("anomaly"),
        }
