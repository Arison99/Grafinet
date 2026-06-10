import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.main_state import auth_service
from app.services.auth_service import AuthService


def _reset_auth_service_with_temp_store() -> Path:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
    tmp_path = Path(tmp.name)
    tmp.close()
    auth_service.__dict__.update(AuthService(tmp_path).__dict__)
    return tmp_path


def _auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_signup_login_and_logout_flow():
    temp_store = _reset_auth_service_with_temp_store()
    client = TestClient(app)

    signup_response = client.post(
        "/api/auth/signup",
        json={
            "username": "tester01",
            "email": "tester01@example.com",
            "password": "password123",
        },
    )
    assert signup_response.status_code == 200
    signup_data = signup_response.json()
    assert signup_data["success"] is True
    assert signup_data["token"]

    login_response = client.post(
        "/api/auth/login",
        json={"username": "tester01", "password": "password123"},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["success"] is True
    token = login_data["token"]

    ip_ok = client.get("/api/ip/8.8.8.8", headers=_auth_header(token))
    assert ip_ok.status_code == 200
    assert ip_ok.json()["found"] is True

    logout_response = client.post("/api/auth/logout", headers=_auth_header(token))
    assert logout_response.status_code == 200
    assert logout_response.json()["success"] is True

    ip_after_logout = client.get("/api/ip/8.8.8.8", headers=_auth_header(token))
    assert ip_after_logout.status_code == 401

    if temp_store.exists():
        temp_store.unlink()


def test_protected_routes_require_auth_header():
    _reset_auth_service_with_temp_store()
    client = TestClient(app)

    ip_response = client.get("/api/ip/8.8.8.8")
    map_response = client.get("/api/map/point/8.8.8.8")

    assert ip_response.status_code == 401
    assert map_response.status_code == 401


def test_login_rejects_wrong_password():
    temp_store = _reset_auth_service_with_temp_store()
    client = TestClient(app)

    client.post(
        "/api/auth/signup",
        json={
            "username": "tester02",
            "email": "tester02@example.com",
            "password": "password123",
        },
    )

    bad_login = client.post(
        "/api/auth/login",
        json={"username": "tester02", "password": "wrongpass123"},
    )

    assert bad_login.status_code == 401

    if temp_store.exists():
        temp_store.unlink()
