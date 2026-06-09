from __future__ import annotations

import hashlib
import json
import secrets
from pathlib import Path
from typing import Any


class AuthService:
    def __init__(self, users_path: Path) -> None:
        self.users_path = users_path
        if not self.users_path.exists():
            self._write_users([])

    def signup(self, username: str, email: str, password: str) -> dict[str, Any]:
        users = self._read_users()

        existing = next(
            (
                user
                for user in users
                if user["username"].lower() == username.lower()
                or user["email"].lower() == email.lower()
            ),
            None,
        )
        if existing:
            return {"success": False, "message": "Username or email already exists"}

        salt = secrets.token_hex(16)
        password_hash = self._hash_password(password, salt)

        token = self._issue_token(username)

        users.append(
            {
                "username": username,
                "email": email,
                "salt": salt,
                "password_hash": password_hash,
                "token": token,
            }
        )
        self._write_users(users)

        return {
            "success": True,
            "message": "Account created successfully",
            "username": username,
            "token": token,
        }

    def login(self, username: str, password: str) -> dict[str, Any]:
        users = self._read_users()
        user = next(
            (item for item in users if item["username"].lower() == username.lower()),
            None,
        )
        if not user:
            return {"success": False, "message": "Invalid username or password"}

        expected_hash = self._hash_password(password, user["salt"])
        if user["password_hash"] != expected_hash:
            return {"success": False, "message": "Invalid username or password"}

        token = self._issue_token(user["username"])
        user["token"] = token
        self._write_users(users)

        return {
            "success": True,
            "message": "Login successful",
            "username": user["username"],
            "token": token,
        }

    def validate_token(self, token: str) -> str | None:
        users = self._read_users()
        user = next((item for item in users if item.get("token") == token), None)
        if not user:
            return None
        return str(user.get("username"))

    def revoke_token_for_user(self, username: str) -> bool:
        users = self._read_users()
        user = next(
            (item for item in users if item["username"].lower() == username.lower()),
            None,
        )
        if not user:
            return False

        user["token"] = None
        self._write_users(users)
        return True

    def _hash_password(self, password: str, salt: str) -> str:
        return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()

    def _issue_token(self, username: str) -> str:
        random_part = secrets.token_urlsafe(24)
        return f"grafinet-{username}-{random_part}"

    def _read_users(self) -> list[dict[str, Any]]:
        try:
            with self.users_path.open("r", encoding="utf-8") as file:
                data = json.load(file)
            if isinstance(data, list):
                return data
            return []
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def _write_users(self, users: list[dict[str, Any]]) -> None:
        self.users_path.parent.mkdir(parents=True, exist_ok=True)
        with self.users_path.open("w", encoding="utf-8") as file:
            json.dump(users, file, indent=2)
