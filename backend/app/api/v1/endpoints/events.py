from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlmodel import select, outerjoin
from app.db.engine import get_session
from app.models.event import GeofenceEvent
from app.models.geofence import Geofence

router = APIRouter()


class EventWithGeofenceName(GeofenceEvent):
    geofence_name: Optional[str] = None


@router.get("/events", response_model=List[EventWithGeofenceName])
async def read_events(
    session=Depends(get_session),
    offset: int = 0,
    limit: int = 50,
):
    stmt = (
        select(
            GeofenceEvent.id,
            GeofenceEvent.geofence_id,
            GeofenceEvent.unit_uid,
            GeofenceEvent.unit_callsign,
            GeofenceEvent.event_type,
            GeofenceEvent.timestamp,
            GeofenceEvent.raw_detail,
            Geofence.name.label("geofence_name"),
        )
        .outerjoin(Geofence, GeofenceEvent.geofence_id == Geofence.id)
        .order_by(GeofenceEvent.timestamp.desc())
        .offset(offset)
        .limit(limit)
    )
    results = session.exec(stmt).all()

    return [
        {
            "id": r[0],
            "geofence_id": r[1],
            "unit_uid": r[2],
            "unit_callsign": r[3],
            "event_type": r[4],
            "timestamp": r[5],
            "raw_detail": r[6],
            "geofence_name": r[7],
        }
        for r in results
    ]
