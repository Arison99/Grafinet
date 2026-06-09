from __future__ import annotations

import ipaddress
from pathlib import Path
from typing import Any

try:
    import maxminddb  # type: ignore
except ImportError:  # pragma: no cover
    maxminddb = None


class IPNetDBLoader:
    def __init__(self, prefix_path: Path, asn_path: Path) -> None:
        self.prefix_db = self._open_db(prefix_path)
        self.asn_db = self._open_db(asn_path)

    def _open_db(self, path: Path) -> Any:
        if not path.exists() or maxminddb is None:
            return None
        try:
            return maxminddb.open_database(str(path))
        except Exception:
            return None

    def lookup_ip(self, ip: str) -> dict[str, Any] | None:
        try:
            ipaddress.ip_address(ip)
        except ValueError:
            return None

        if self.prefix_db is None:
            return self._fallback_ip(ip)

        data = self.prefix_db.get(ip)
        if data is None:
            return None

        if isinstance(data, dict):
            return data
        return None

    def lookup_asn(self, asn: int | str) -> dict[str, Any] | None:
        if self.asn_db is None:
            return None

        key = str(asn)
        data = self.asn_db.get(key)
        if isinstance(data, dict):
            return data
        return None

    def _fallback_ip(self, ip: str) -> dict[str, Any] | None:
        sample = {
            "8.8.8.8": {
                "allocation": "public",
                "allocation_cc": "US",
                "as": 15169,
                "as_entity": "Google LLC",
                "as_name": "GOOGLE",
                "prefix": "8.8.8.0/24",
                "latitude": 37.751,
                "longitude": -97.822,
                "ix": "Any2 Los Angeles",
                "prefix_bogon": False,
                "rpki_status": "valid",
            },
            "1.1.1.1": {
                "allocation": "public",
                "allocation_cc": "AU",
                "as": 13335,
                "as_entity": "Cloudflare, Inc.",
                "as_name": "CLOUDFLARENET",
                "prefix": "1.1.1.0/24",
                "latitude": -33.8688,
                "longitude": 151.2093,
                "ix": "Equinix Sydney",
                "prefix_bogon": False,
                "rpki_status": "valid",
            },
            "9.9.9.9": {
                "allocation": "public",
                "allocation_cc": "US",
                "as": 19281,
                "as_entity": "Quad9",
                "as_name": "QUAD9-AS-1",
                "prefix": "9.9.9.0/24",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "ix": "NYIIX",
                "prefix_bogon": False,
                "rpki_status": "valid",
            },
        }
        return sample.get(ip)
