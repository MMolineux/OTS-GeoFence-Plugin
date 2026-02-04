from fastapi import FastAPI
from app.api.v1.router import router as api_router

app = FastAPI(
    title="GeoFence Service API",
    description="Standalone GeoFence Monitoring Service",
    version="0.1.0"
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "healthy"}
