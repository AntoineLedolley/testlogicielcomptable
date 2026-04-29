from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_tables
from app.routers import factures, ecritures, immeubles, loyers, rapprochement, assistant, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title="CogirBook API",
    description="API comptable immobilière boostée à l'IA",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(factures.router, prefix="/api/factures", tags=["Factures"])
app.include_router(ecritures.router, prefix="/api/ecritures", tags=["Écritures"])
app.include_router(immeubles.router, prefix="/api/immeubles", tags=["Immeubles"])
app.include_router(loyers.router, prefix="/api/loyers", tags=["Loyers"])
app.include_router(rapprochement.router, prefix="/api/rapprochement", tags=["Rapprochement"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["Assistant IA"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
