import json
from typing import Optional, List
from sqlmodel import SQLModel, Field
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
    detect_on: str = Field(default="[]")

    shape_type: str = Field(description="circle, polygon, etc.")
    shape_data: str = Field(
        description="JSON string of the shape coordinates/parameters"
    )

    auto_registered: bool = False
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

    @property
    def detect_on_list(self) -> List[DetectionType]:
        try:
            return [DetectionType(x) for x in json.loads(self.detect_on)]
        except (json.JSONDecodeError, ValueError):
            return []

    @detect_on_list.setter
    def detect_on_list(self, value: List[DetectionType]):
        self.detect_on = json.dumps([x.value for x in value])


class GeofenceCreate(SQLModel):
    name: str
    uid: str
    description: Optional[str] = None
    mode: GeofenceMode = GeofenceMode.REPORT_ONLY
    detect_on: str = "[]"
    shape_type: str
    shape_data: str


class GeofenceUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mode: Optional[GeofenceMode] = None
    detect_on: Optional[str] = None
    shape_type: Optional[str] = None
    shape_data: Optional[str] = None
