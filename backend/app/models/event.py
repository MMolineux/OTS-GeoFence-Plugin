from typing import Optional
from sqlmodel import SQLModel, Field
import time


class GeofenceEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    geofence_id: int = Field(foreign_key="geofence.id", index=True)
    unit_uid: str = Field(index=True)
    unit_callsign: Optional[str] = None
    event_type: str  # enter, exit, cross, etc.
    timestamp: float = Field(default_factory=time.time)

    # Raw detail from Tile38 or CoT
    raw_detail: Optional[str] = None
