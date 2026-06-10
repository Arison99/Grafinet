from __future__ import annotations

import random
import re
import time
from typing import Any

from app.core.mmdb_loader import IPNetDBLoader
from app.services.anomaly_service import AnomalyService


class IPService:
    def __init__(self, db: IPNetDBLoader) -> None:
        self.db = db
        self.anomaly = AnomalyService()
        self._country_cache_ttl_seconds = 300
        self._country_asn_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}

    def resolve_ip(self, ip: str) -> dict[str, Any]:
        geo_asn = self.db.lookup_geo_asn_ip(ip)
        geo_country = self.db.lookup_geo_country_ip(ip)
        geo_city = self.db.lookup_geo_city_ip(ip)
        data = self.db.lookup_ip(ip)

        if not data:
            return {
                "found": False,
                "ip": ip,
                "message": "IP not found in IPNetDB prefix database",
                "country": self._extract_country_code(geo_country),
                "geo_asn": geo_asn,
                "geo_country": geo_country,
                "geo_city": geo_city,
            }

        latitude, longitude = self._resolve_coordinates(
            data.get("latitude"),
            data.get("longitude"),
            geo_city,
        )

        selected_asn = data.get("as")
        if selected_asn is None:
            origins = self._normalize_int_list(data.get("prefix_origins"))
            selected_asn = origins[0] if origins else None
        if selected_asn is None and geo_asn:
            selected_asn = geo_asn.get("autonomous_system_number")
        asn = {
            "number": selected_asn,
            "entity": data.get("as_entity") or (geo_asn or {}).get("autonomous_system_organization"),
            "name": data.get("as_name"),
        }
        asn_db = self.db.lookup_asn(selected_asn) if selected_asn is not None else None

        resolved = {
            "found": True,
            "ip": ip,
            "allocation": data.get("allocation"),
            "allocation_registry": data.get("allocation_registry"),
            "country": data.get("allocation_cc") or self._extract_country_code(geo_country),
            "asn": asn,
            "asn_db": asn_db,
            "geo_asn": geo_asn,
            "geo_country": geo_country,
            "geo_city": geo_city,
            "prefix": data.get("prefix"),
            "prefix_origins": self._normalize_int_list(data.get("prefix_origins")),
            "latitude": latitude,
            "longitude": longitude,
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

    def search_asns_by_country_mmdb(self, country: str, limit: int = 100) -> list[dict[str, Any]]:
        country_code = (country or "").strip().upper()
        if not country_code:
            return []

        now = time.time()
        cached = self._country_asn_cache.get(country_code)
        if cached is not None and (now - cached[0]) <= self._country_cache_ttl_seconds:
            return cached[1][: max(1, min(limit, 500))]

        items = self.db.iter_country_asns(country_code)
        items.sort(key=lambda item: int(item.get("prefix_count") or 0), reverse=True)
        self._country_asn_cache[country_code] = (now, items)

        return items[: max(1, min(limit, 500))]

    def _extract_country_code(self, geo_country: dict[str, Any] | None) -> str | None:
        if not geo_country:
            return None

        country = geo_country.get("country")
        if isinstance(country, dict) and country.get("iso_code"):
            return str(country.get("iso_code"))

        registered = geo_country.get("registered_country")
        if isinstance(registered, dict) and registered.get("iso_code"):
            return str(registered.get("iso_code"))

        return None

    def _resolve_coordinates(
        self,
        latitude: Any,
        longitude: Any,
        geo_city: dict[str, Any] | None,
    ) -> tuple[float | None, float | None]:
        lat = self._to_float(latitude)
        lon = self._to_float(longitude)
        if lat is not None and lon is not None:
            return lat, lon

        if not geo_city:
            return lat, lon

        location = geo_city.get("location")
        if not isinstance(location, dict):
            return lat, lon

        fallback_lat = self._to_float(location.get("latitude"))
        fallback_lon = self._to_float(location.get("longitude"))
        return fallback_lat, fallback_lon

    def _to_float(self, value: Any) -> float | None:
        if value is None:
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    # ------------------------------------------------------------------
    # Route simulation (exploratory / for fun – ignores BGP peer rules)
    # ------------------------------------------------------------------

    _TRANSIT_HUBS: list[str] = ["US", "DE", "NL", "GB", "JP", "SG", "FR", "HK"]

    _REGION_COUNTRIES: dict[str, set[str]] = {
        "NA": {"US", "CA", "MX"},
        "EU": {"DE", "NL", "GB", "FR", "SE", "CH", "IT", "ES", "BE", "AT", "PL", "RU", "UA", "NO", "DK"},
        "AS": {"JP", "SG", "CN", "KR", "IN", "HK", "TW", "ID", "TH", "MY", "VN", "PK", "BD"},
        "SA": {"BR", "AR", "CL", "CO", "PE", "VE"},
        "AF": {"ZA", "NG", "KE", "EG", "MA", "TZ", "GH"},
        "OC": {"AU", "NZ"},
    }

    _REGION_HUBS: dict[str, list[str]] = {
        "NA": ["US", "CA"],
        "EU": ["NL", "DE", "GB", "FR"],
        "AS": ["SG", "JP", "HK"],
        "SA": ["BR", "CL"],
        "AF": ["ZA", "EG"],
        "OC": ["AU", "NZ"],
    }

    _INTER_REGION_BRIDGES: dict[tuple[str, str], list[str]] = {
        ("NA", "EU"): ["US", "NL", "GB"],
        ("NA", "AS"): ["US", "JP", "SG"],
        ("NA", "SA"): ["US", "BR"],
        ("NA", "AF"): ["US", "GB"],
        ("NA", "OC"): ["US", "JP", "AU"],
        ("EU", "AS"): ["NL", "DE", "SG", "JP"],
        ("EU", "SA"): ["NL", "ES", "BR"],
        ("EU", "AF"): ["FR", "GB", "EG"],
        ("EU", "OC"): ["NL", "SG", "AU"],
        ("AS", "SA"): ["US", "SG"],
        ("AS", "AF"): ["SG", "EG", "ZA"],
        ("AS", "OC"): ["SG", "JP", "AU"],
        ("SA", "AF"): ["US", "BR", "ZA"],
        ("SA", "OC"): ["US", "CL", "AU"],
        ("AF", "OC"): ["SG", "ZA", "AU"],
    }

    def _country_region(self, country: str) -> str:
        for region, countries in self._REGION_COUNTRIES.items():
            if country in countries:
                return region
        return "NA"

    def _pick_transit_countries(self, src: str | None, dst: str | None, rng: random.Random) -> list[str]:
        if not src or not dst:
            return ["US"]
        if src == dst:
            return []

        src_region = self._country_region(src)
        dst_region = self._country_region(dst)
        result: list[str] = []

        def _add_country(country: str | None) -> None:
            if country and country not in {src, dst} and country not in result:
                result.append(country)

        src_hubs = [c for c in self._REGION_HUBS.get(src_region, []) if c not in {src, dst}]
        dst_hubs = [c for c in self._REGION_HUBS.get(dst_region, []) if c not in {src, dst}]

        if src_region == dst_region:
            if src_hubs and rng.random() < 0.8:
                _add_country(rng.choice(src_hubs))
            if src_hubs and rng.random() < 0.25:
                _add_country(rng.choice(src_hubs))
            return result[:2]

        region_key = tuple(sorted((src_region, dst_region)))
        bridge_candidates = [
            c for c in self._INTER_REGION_BRIDGES.get(region_key, self._TRANSIT_HUBS)
            if c not in {src, dst}
        ]

        if src_hubs and rng.random() < 0.7:
            _add_country(rng.choice(src_hubs))

        if bridge_candidates:
            _add_country(rng.choice(bridge_candidates))

        if dst_hubs and rng.random() < 0.75:
            _add_country(rng.choice(dst_hubs))

        return result[:3]

    def _pick_random_country_asn(
        self,
        country: str | None,
        rng: random.Random,
        exclude_asns: set[int],
        limit: int = 150,
    ) -> dict[str, Any] | None:
        if not country:
            return None

        pool = self.search_asns_by_country_mmdb(country, limit)
        candidates: list[dict[str, Any]] = []
        weights: list[float] = []

        for item in pool:
            asn = item.get("asn")
            if asn is None:
                continue
            try:
                asn_int = int(asn)
            except (TypeError, ValueError):
                continue
            if asn_int in exclude_asns:
                continue

            prefix_weight = max(1, int(item.get("prefix_count") or 1))
            candidates.append(item)
            weights.append(float(prefix_weight))

        if not candidates:
            return None

        selected = rng.choices(candidates, weights=weights, k=1)[0]
        return {
            "asn": int(selected["asn"]),
            "entity": selected.get("entity"),
            "country": country,
            "sample_ip": selected.get("sample_ip"),
            "prefix_count": selected.get("prefix_count"),
        }

    def _resolve_input_to_hop(self, raw: str, hop_type: str) -> dict[str, Any]:
        import ipaddress as _ip

        s = raw.strip()

        try:
            _ip.ip_address(s)
            data = self.db.lookup_ip(s)
            if data:
                geo = self.db.lookup_geo_asn_ip(s)
                return {
                    "hop": 0,
                    "type": hop_type,
                    "input": s,
                    "asn": data.get("as"),
                    "entity": data.get("as_entity") or data.get("as_name") or (geo or {}).get("autonomous_system_organization"),
                    "country": data.get("as_cc") or data.get("allocation_cc") or data.get("prefix_cc"),
                    "sample_ip": s,
                    "prefix_count": None,
                }
        except ValueError:
            pass

        asn_match = re.match(r"^(?:AS)?(\d+)$", s, re.IGNORECASE)
        if asn_match:
            asn_int = int(asn_match.group(1))
            asn_data = self.db.lookup_asn(asn_int)
            entity = (asn_data or {}).get("entity") or (asn_data or {}).get("as_name") or "Unknown"
            country = (asn_data or {}).get("as_cc") or None
            return {
                "hop": 0,
                "type": hop_type,
                "input": s,
                "asn": asn_int,
                "entity": entity,
                "country": country,
                "sample_ip": None,
                "prefix_count": None,
            }

        if len(s) == 2 and s.isalpha():
            country = s.upper()
            asns = self.search_asns_by_country_mmdb(country, 20)
            if asns:
                top = max(asns, key=lambda x: int(x.get("prefix_count") or 0))
                return {
                    "hop": 0,
                    "type": hop_type,
                    "input": s,
                    "asn": top["asn"],
                    "entity": top.get("entity"),
                    "country": country,
                    "sample_ip": top.get("sample_ip"),
                    "prefix_count": top.get("prefix_count"),
                }
            return {"hop": 0, "type": hop_type, "input": s, "asn": None, "entity": "Unknown", "country": country, "sample_ip": None, "prefix_count": None}

        return {"hop": 0, "type": hop_type, "input": s, "asn": None, "entity": "Unresolvable", "country": None, "sample_ip": None, "prefix_count": None}

    def simulate_route(self, source: str, destination: str) -> list[dict[str, Any]]:
        rng = random.Random()
        src_hop = self._resolve_input_to_hop(source, "source")
        dst_hop = self._resolve_input_to_hop(destination, "destination")

        transit_countries = self._pick_transit_countries(
            src_hop.get("country"),
            dst_hop.get("country"),
            rng,
        )
        rng.shuffle(transit_countries)

        if src_hop.get("country") and dst_hop.get("country") and src_hop.get("country") != dst_hop.get("country"):
            if dst_hop["country"] not in transit_countries:
                transit_countries.append(dst_hop["country"])

        # Keep the path practical while allowing variation across runs.
        transit_countries = transit_countries[:3]

        path: list[dict[str, Any]] = []
        src_hop["hop"] = 0
        path.append(src_hop)

        used_asns: set[int] = set()
        if src_hop.get("asn") is not None:
            try:
                used_asns.add(int(src_hop["asn"]))
            except (TypeError, ValueError):
                pass

        previous_country = src_hop.get("country")

        for country in transit_countries:
            peering_asn = self._pick_random_country_asn(country, rng, used_asns)
            if peering_asn is None:
                continue

            used_asns.add(int(peering_asn["asn"]))

            path.append({
                "hop": 0,
                "type": "peering",
                "input": f"{previous_country or '?'}->{country}",
                "asn": peering_asn["asn"],
                "entity": peering_asn.get("entity"),
                "country": country,
                "sample_ip": peering_asn.get("sample_ip"),
                "prefix_count": peering_asn.get("prefix_count"),
            })
            previous_country = country

            # Occasionally add an extra transit ASN in the same country for realism.
            if rng.random() < 0.45:
                local_transit = self._pick_random_country_asn(country, rng, used_asns)
                if local_transit is not None:
                    used_asns.add(int(local_transit["asn"]))
                    path.append({
                        "hop": 0,
                        "type": "transit",
                        "input": country,
                        "asn": local_transit["asn"],
                        "entity": local_transit.get("entity"),
                        "country": country,
                        "sample_ip": local_transit.get("sample_ip"),
                        "prefix_count": local_transit.get("prefix_count"),
                    })

        # Ensure at least one peering hop exists for cross-country simulations.
        if len(path) == 1 and src_hop.get("country") != dst_hop.get("country"):
            bridge_country = dst_hop.get("country") or src_hop.get("country")
            bridge_asn = self._pick_random_country_asn(bridge_country, rng, used_asns)
            if bridge_asn is not None:
                path.append({
                    "hop": 0,
                    "type": "peering",
                    "input": f"{src_hop.get('country') or '?'}->{bridge_country or '?'}",
                    "asn": bridge_asn["asn"],
                    "entity": bridge_asn.get("entity"),
                    "country": bridge_country,
                    "sample_ip": bridge_asn.get("sample_ip"),
                    "prefix_count": bridge_asn.get("prefix_count"),
                })

        dst_hop["hop"] = 0
        path.append(dst_hop)

        for index, hop in enumerate(path, start=1):
            hop["hop"] = index

        return path

    def _normalize_int_list(self, value: Any) -> list[int] | None:
        if value is None:
            return None

        if not isinstance(value, list):
            value = [value]

        normalized: list[int] = []
        for item in value:
            try:
                normalized.append(int(item))
            except (TypeError, ValueError):
                continue
        return normalized or None

    def _normalize_ix(self, raw_ix: Any) -> str | None:
        if raw_ix is None:
            return None

        if isinstance(raw_ix, str):
            return raw_ix.strip() or None

        if isinstance(raw_ix, dict):
            parts = [
                raw_ix.get("exchange"),
                raw_ix.get("name"),
                raw_ix.get("organization"),
            ]
            cleaned = [str(part).strip() for part in parts if part]
            return " | ".join(cleaned) if cleaned else None

        if isinstance(raw_ix, list):
            labels: list[str] = []
            for item in raw_ix:
                if isinstance(item, dict):
                    value = item.get("exchange") or item.get("name") or item.get("organization")
                    if value:
                        labels.append(str(value).strip())
                elif item:
                    labels.append(str(item).strip())
            labels = [label for label in labels if label]
            return ", ".join(labels) if labels else None

        return str(raw_ix)
