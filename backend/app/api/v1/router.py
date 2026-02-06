from fastapi import APIRouter
from app.api.v1.endpoints import geofences, stats, events

router = APIRouter()

router.include_router(geofences.router, prefix="/geofences", tags=["geofences"])
router.include_router(stats.router, prefix="", tags=["stats"])
router.include_router(events.router, prefix="", tags=["events"])


@router.get("/")
async def root():
    return {"message": "Welcome to the GeoFence Service API v1"}
