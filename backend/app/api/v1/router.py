from fastapi import APIRouter
from app.api.v1.endpoints import geofences

router = APIRouter()

router.include_router(geofences.router, prefix="/geofences", tags=["geofences"])


@router.get("/")
async def root():
    return {"message": "Welcome to the GeoFence Service API v1"}
