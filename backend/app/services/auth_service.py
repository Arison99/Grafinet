from __future__ import annotations

import hashlib
import secrets
import sqlite3
import time
from pathlib import Path
from typing import Any


class AuthService:
    def __init__(
        self,
        db_path: Path,
        token_ttl_seconds: int = 86400,
        max_failed_attempts: int = 5,
        lockout_seconds: int = 300,
    ) -> None:
        self.db_path = db_path
        self.token_ttl_seconds = token_ttl_seconds
        self.max_failed_attempts = max_failed_attempts
        self.lockout_seconds = lockout_seconds
        self._init_db()

    def signup(self, username: str, email: str, password: str) -> dict[str, Any]:
        with self._connect() as conn:
            existing = conn.execute(
                """
                SELECT 1
                FROM users
                WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
                """,
                (username, email),
            ).fetchone()

        if existing is not None:
            return {"success": False, "message": "Username or email already exists"}

        salt = secrets.token_hex(16)
        password_hash = self._hash_password(password, salt)

        token = self._issue_token(username)
        token_expires_at = self._now() + self.token_ttl_seconds

        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO users (
                    username, email, salt, password_hash, token, token_expires_at,
                    failed_attempts, lockout_until
                )
                VALUES (?, ?, ?, ?, ?, ?, 0, 0)
                """,
                (username, email, salt, password_hash, token, token_expires_at),
            )
            conn.commit()

        return {
            "success": True,
            "message": "Account created successfully",
            "username": username,
            "token": token,
        }

    def login(self, username: str, password: str) -> dict[str, Any]:
        now = self._now()
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT id, username, salt, password_hash, failed_attempts, lockout_until
                FROM users
                WHERE LOWER(username) = LOWER(?)
                """,
                (username,),
            ).fetchone()

            if row is None:
                return {
                    "success": False,
                    "message": "Invalid username or password",
                    "status_code": 401,
                }

            if row[5] > now:
                return {
                    "success": False,
                    "message": "Too many failed attempts. Try again later.",
                    "status_code": 429,
                }

            expected_hash = self._hash_password(password, row[2])
            if row[3] != expected_hash:
                failed_attempts = row[4] + 1
                lockout_until = 0
                if failed_attempts >= self.max_failed_attempts:
                    lockout_until = now + self.lockout_seconds
                    failed_attempts = 0

                conn.execute(
                    """
                    UPDATE users
                    SET failed_attempts = ?, lockout_until = ?
                    WHERE id = ?
                    """,
                    (failed_attempts, lockout_until, row[0]),
                )
                conn.commit()

                status_code = 429 if lockout_until else 401
                message = (
                    "Too many failed attempts. Try again later."
                    if lockout_until
                    else "Invalid username or password"
                )
                return {
                    "success": False,
                    "message": message,
                    "status_code": status_code,
                }

            token = self._issue_token(row[1])
            token_expires_at = now + self.token_ttl_seconds

            conn.execute(
                """
                UPDATE users
                SET token = ?, token_expires_at = ?, failed_attempts = 0, lockout_until = 0
                WHERE id = ?
                """,
                (token, token_expires_at, row[0]),
            )
            conn.commit()

        return {
            "success": True,
            "message": "Login successful",
            "username": row[1],
            "token": token,
        }

    def validate_token(self, token: str) -> str | None:
        now = self._now()
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT username
                FROM users
                WHERE token = ? AND token_expires_at > ?
                """,
                (token, now),
            ).fetchone()

        if row is None:
            return None
        return str(row[0])

    def revoke_token_for_user(self, username: str) -> bool:
        with self._connect() as conn:
            result = conn.execute(
                """
                UPDATE users
                SET token = NULL, token_expires_at = 0
                WHERE LOWER(username) = LOWER(?)
                """,
                (username,),
            )
            conn.commit()
            return result.rowcount > 0

    def _hash_password(self, password: str, salt: str) -> str:
        return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()

    def _issue_token(self, username: str) -> str:
        random_part = secrets.token_urlsafe(24)
        return f"grafinet-{username}-{random_part}"

    def _now(self) -> int:
        return int(time.time())

    def _connect(self) -> sqlite3.Connection:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL UNIQUE,
                    salt TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    token TEXT,
                    token_expires_at INTEGER NOT NULL DEFAULT 0,
                    failed_attempts INTEGER NOT NULL DEFAULT 0,
                    lockout_until INTEGER NOT NULL DEFAULT 0
                )
                """
            )
            conn.commit()
