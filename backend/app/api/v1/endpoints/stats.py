import time
from fastapi import APIRouter, Depends
from sqlmodel import func, select
from app.db.engine import get_session
from app.models.geofence import Geofence, GeofenceMode
from app.models.event import GeofenceEvent

router = APIRouter()


def get_count(session, stmt):
    result = session.exec(stmt)
    return result.one() if result else 0


@router.get("/stats")
async def get_stats(session=Depends(get_session)):
    now = time.time()
    today_start = now - (now % 86400)

    active_count = get_count(
        session,
        select(func.count())
        .select_from(Geofence)
        .where(Geofence.mode != GeofenceMode.ARCHIVE),
    )

    events_today = get_count(
        session,
        select(func.count())
        .select_from(GeofenceEvent)
        .where(GeofenceEvent.timestamp >= today_start),
    )

    units_tracked = get_count(
        session,
        select(func.count(func.distinct(GeofenceEvent.unit_uid))).where(
            GeofenceEvent.timestamp >= today_start
        ),
    )

    total_events = (
        get_count(
            session,
            select(func.count())
            .select_from(GeofenceEvent)
            .where(GeofenceEvent.timestamp >= today_start),
        )
        or 1
    )

    breach_events = get_count(
        session,
        select(func.count())
        .select_from(GeofenceEvent)
        .where(
            GeofenceEvent.timestamp >= today_start,
            GeofenceEvent.event_type.in_(["enter", "exit"]),
        ),
    )

    breach_rate = round((breach_events / total_events) * 100, 1)

    return {
        "active_geofences": active_count,
        "events_today": events_today,
        "units_tracked": units_tracked,
        "breach_rate": breach_rate,
    }
