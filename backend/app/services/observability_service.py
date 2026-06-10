from __future__ import annotations

import sqlite3
import time
from pathlib import Path
from typing import Any


class ObservabilityService:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self._init_db()

    def log_api_request(
        self,
        *,
        request_id: str,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        username: str | None,
        client_ip: str | None,
        error: str | None,
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO api_request_logs (
                    request_id,
                    method,
                    path,
                    status_code,
                    duration_ms,
                    username,
                    client_ip,
                    error,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    request_id,
                    method,
                    path,
                    status_code,
                    round(duration_ms, 2),
                    username,
                    client_ip,
                    error,
                    self._now(),
                ),
            )
            conn.commit()

    def record_lookup(self, payload: dict[str, Any]) -> None:
        if not payload.get("found"):
            return

        country = payload.get("country")
        asn_value = (payload.get("asn") or {}).get("number")
        if not country or asn_value is None:
            return

        try:
            asn = int(asn_value)
        except (TypeError, ValueError):
            return

        country_code = str(country).strip().upper()
        if len(country_code) < 2:
            return

        entity = (
            (payload.get("asn_db") or {}).get("entity")
            or (payload.get("asn") or {}).get("entity")
            or "Unknown"
        )
        sample_ip = str(payload.get("ip") or "")
        prefix = payload.get("prefix")

        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO ip_observations (
                    ip,
                    country,
                    asn,
                    entity,
                    prefix,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (sample_ip, country_code, asn, entity, prefix, self._now()),
            )

            existing = conn.execute(
                """
                SELECT hits
                FROM asn_country_cache
                WHERE country = ? AND asn = ?
                """,
                (country_code, asn),
            ).fetchone()

            if existing is None:
                conn.execute(
                    """
                    INSERT INTO asn_country_cache (
                        country,
                        asn,
                        entity,
                        sample_ip,
                        hits,
                        last_seen_at
                    )
                    VALUES (?, ?, ?, ?, 1, ?)
                    """,
                    (country_code, asn, entity, sample_ip, self._now()),
                )
            else:
                conn.execute(
                    """
                    UPDATE asn_country_cache
                    SET
                        entity = ?,
                        sample_ip = ?,
                        hits = hits + 1,
                        last_seen_at = ?
                    WHERE country = ? AND asn = ?
                    """,
                    (entity, sample_ip, self._now(), country_code, asn),
                )

            conn.commit()

    def search_asns_by_country(self, country: str, limit: int = 100) -> list[dict[str, Any]]:
        country_code = country.strip().upper()
        if not country_code:
            return []

        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT
                    c.country,
                    c.asn,
                    c.entity,
                    c.sample_ip,
                    c.hits,
                    c.last_seen_at,
                    COUNT(DISTINCT o.ip) AS observed_ips
                FROM asn_country_cache c
                LEFT JOIN ip_observations o
                    ON o.country = c.country
                    AND o.asn = c.asn
                WHERE c.country = ?
                GROUP BY c.country, c.asn, c.entity, c.sample_ip, c.hits, c.last_seen_at
                ORDER BY c.hits DESC, c.last_seen_at DESC
                LIMIT ?
                """,
                (country_code, max(1, min(limit, 500))),
            ).fetchall()

        return [
            {
                "country": str(row[0]),
                "asn": int(row[1]),
                "entity": str(row[2]) if row[2] is not None else None,
                "sample_ip": str(row[3]) if row[3] is not None else None,
                "hits": int(row[4]),
                "last_seen_at": int(row[5]),
                "observed_ips": int(row[6] or 0),
            }
            for row in rows
        ]

    def list_api_logs(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT
                    request_id,
                    method,
                    path,
                    status_code,
                    duration_ms,
                    username,
                    client_ip,
                    error,
                    created_at
                FROM api_request_logs
                ORDER BY id DESC
                LIMIT ?
                """,
                (max(1, min(limit, 500)),),
            ).fetchall()

        return [
            {
                "request_id": str(row[0]),
                "method": str(row[1]),
                "path": str(row[2]),
                "status_code": int(row[3]),
                "duration_ms": float(row[4]),
                "username": str(row[5]) if row[5] is not None else None,
                "client_ip": str(row[6]) if row[6] is not None else None,
                "error": str(row[7]) if row[7] is not None else None,
                "created_at": int(row[8]),
            }
            for row in rows
        ]

    def _connect(self) -> sqlite3.Connection:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS api_request_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    request_id TEXT NOT NULL,
                    method TEXT NOT NULL,
                    path TEXT NOT NULL,
                    status_code INTEGER NOT NULL,
                    duration_ms REAL NOT NULL,
                    username TEXT,
                    client_ip TEXT,
                    error TEXT,
                    created_at INTEGER NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS ip_observations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ip TEXT NOT NULL,
                    country TEXT NOT NULL,
                    asn INTEGER NOT NULL,
                    entity TEXT,
                    prefix TEXT,
                    created_at INTEGER NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS asn_country_cache (
                    country TEXT NOT NULL,
                    asn INTEGER NOT NULL,
                    entity TEXT,
                    sample_ip TEXT,
                    hits INTEGER NOT NULL DEFAULT 0,
                    last_seen_at INTEGER NOT NULL,
                    PRIMARY KEY (country, asn)
                )
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_ip_observations_country_asn
                ON ip_observations(country, asn)
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_api_request_logs_created_at
                ON api_request_logs(created_at)
                """
            )
            conn.commit()

    def _now(self) -> int:
        return int(time.time())
