from __future__ import annotations

import sys
from pathlib import Path

# Allow `python main.py` from backend/app by adding backend/ to sys.path.
if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import asyncio
import logging
import time
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

from app.api.routes.auth import router as auth_router
from app.api.routes.ip import router as ip_router
from app.api.routes.map import router as map_router
from app.api.routes.search import router as search_router
from app.api.routes.simulate import router as simulate_router
from app.main_state import auth_service, observability_service

app = FastAPI(title="Grafinet API", version="1.0.0")
logger = logging.getLogger("grafinet.api")

if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    start = time.perf_counter()
    request_id = str(uuid4())
    username = None
    error_text = None
    status_code = 500

    auth_header = request.headers.get("authorization")
    if auth_header:
        parts = auth_header.split(" ", 1)
        if len(parts) == 2 and parts[0].lower() == "bearer":
            username = auth_service.validate_token(parts[1].strip())

    try:
        response = await call_next(request)
        status_code = response.status_code
        response.headers["x-request-id"] = request_id
        return response
    except Exception as exc:
        error_text = str(exc)
        raise
    finally:
        duration_ms = (time.perf_counter() - start) * 1000
        client_ip = request.client.host if request.client else None

        await asyncio.to_thread(
            observability_service.log_api_request,
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=status_code,
            duration_ms=duration_ms,
            username=username,
            client_ip=client_ip,
            error=error_text,
        )
        logger.info(
            "request_id=%s method=%s path=%s status=%s duration_ms=%.2f user=%s",
            request_id,
            request.method,
            request.url.path,
            status_code,
            duration_ms,
            username or "anonymous",
        )


app.include_router(ip_router, prefix="/api")
app.include_router(map_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(simulate_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8010, reload=False)
