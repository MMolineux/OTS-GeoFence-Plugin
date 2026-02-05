from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
import time


class DetectionType(str, Enum):
    inside = "inside"
    outside = "outside"
    enter = "enter"
    exit = "exit"
    cross = "cross"


class GeofenceMode(str, Enum):
    ACTIVE = "active"
    REPORT_ONLY = "report-only"
    INACTIVE = "inactive"
    ARCHIVE = "archive"


class Geofence(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    uid: str = Field(index=True, unique=True)
    description: Optional[str] = None
    mode: GeofenceMode = Field(default=GeofenceMode.REPORT_ONLY)
    detect_on: list[DetectionType] = Field(default=[])

    # Shape stored as JSON (GeoJSON or Tile38 format)
    shape_type: str = Field(description="circle, polygon, etc.")
    shape_data: str = Field(
        description="JSON string of the shape coordinates/parameters"
    )

    # Metadata
    auto_registered: bool = False
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)


class GeofenceCreate(SQLModel):
    name: str
    uid: str
    description: Optional[str] = None
    mode: GeofenceMode = GeofenceMode.REPORT_ONLY
    shape_type: str
    shape_data: str


class GeofenceUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mode: Optional[GeofenceMode] = None
    shape_type: Optional[str] = None
    shape_data: Optional[str] = None
