from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.ip import router as ip_router
from app.api.routes.map import router as map_router

app = FastAPI(title="Grafinet API", version="1.0.0")

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


app.include_router(ip_router, prefix="/api")
app.include_router(map_router, prefix="/api")
