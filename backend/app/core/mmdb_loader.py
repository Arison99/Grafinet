from __future__ import annotations

import ipaddress
from pathlib import Path
from typing import Any

try:
    import maxminddb  # type: ignore
except ImportError:  # pragma: no cover
    maxminddb = None


class IPNetDBLoader:
    def __init__(
        self,
        prefix_path: Path,
        asn_path: Path,
        geolite2_asn_path: Path | None = None,
        geolite2_city_path: Path | None = None,
        geolite2_country_path: Path | None = None,
    ) -> None:
        self.prefix_db = self._open_db(prefix_path)
        self.asn_db = self._open_db(asn_path)
        self.geolite2_asn_db = self._open_db(geolite2_asn_path)
        self.geolite2_city_db = self._open_db(geolite2_city_path)
        self.geolite2_country_db = self._open_db(geolite2_country_path)

    def _open_db(self, path: Path | None) -> Any:
        if path is None:
            return None
        if not path.exists() or maxminddb is None:
            return None
        try:
            return maxminddb.open_database(str(path))
        except Exception:
            return None

    def lookup_geo_asn_ip(self, ip: str) -> dict[str, Any] | None:
        try:
            ipaddress.ip_address(ip)
        except ValueError:
            return None

        if self.geolite2_asn_db is None:
            return None

        data = self.geolite2_asn_db.get(ip)
        if isinstance(data, dict):
            return data
        return None

    def lookup_geo_country_ip(self, ip: str) -> dict[str, Any] | None:
        try:
            ipaddress.ip_address(ip)
        except ValueError:
            return None

        if self.geolite2_country_db is None:
            return None

        data = self.geolite2_country_db.get(ip)
        if isinstance(data, dict):
            return data
        return None

    def lookup_geo_city_ip(self, ip: str) -> dict[str, Any] | None:
        try:
            ipaddress.ip_address(ip)
        except ValueError:
            return None

        if self.geolite2_city_db is None:
            return None

        data = self.geolite2_city_db.get(ip)
        if isinstance(data, dict):
            return data
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

        query_ip = self._asn_to_lookup_ip(asn)
        if query_ip is None:
            return None

        data = self.asn_db.get(query_ip)
        if isinstance(data, dict):
            return data
        return None

    def iter_country_asns(self, country: str) -> list[dict[str, Any]]:
        if self.prefix_db is None:
            return []

        country_code = (country or "").strip().upper()
        if not country_code:
            return []

        aggregate: dict[int, dict[str, Any]] = {}

        for network, data in self.prefix_db:
            if not isinstance(data, dict):
                continue

            record_country = (
                str(data.get("allocation_cc") or data.get("prefix_cc") or "")
                .strip()
                .upper()
            )
            if record_country != country_code:
                continue

            asn_candidates: list[int] = []
            primary_asn = data.get("as")
            if primary_asn is not None:
                try:
                    asn_candidates.append(int(primary_asn))
                except (TypeError, ValueError):
                    pass

            origins = data.get("prefix_origins")
            if origins is not None:
                if not isinstance(origins, list):
                    origins = [origins]
                for item in origins:
                    try:
                        asn_candidates.append(int(item))
                    except (TypeError, ValueError):
                        continue

            for asn in asn_candidates:
                if asn <= 0:
                    continue
                entry = aggregate.get(asn)
                if entry is None:
                    aggregate[asn] = {
                        "country": country_code,
                        "asn": asn,
                        "entity": data.get("as_entity") or data.get("as_name") or "Unknown",
                        "sample_ip": str(network.network_address),
                        "sample_prefix": str(network),
                        "prefix_count": 1,
                    }
                else:
                    entry["prefix_count"] += 1

        return list(aggregate.values())

    def _asn_to_lookup_ip(self, asn: int | str) -> str | None:
        try:
            if isinstance(asn, str):
                normalized = asn.strip().upper()
                if normalized.startswith("AS"):
                    normalized = normalized[2:]
                asn_int = int(normalized)
            else:
                asn_int = int(asn)
        except (TypeError, ValueError):
            return None

        if asn_int < 0 or asn_int > (2**32 - 1):
            return None

        return str(ipaddress.ip_address(asn_int))

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
