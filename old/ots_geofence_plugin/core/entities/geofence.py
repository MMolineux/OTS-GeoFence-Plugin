from typing import Literal
from pydantic import BaseModel
from enum import Enum


class DetectionType(str, Enum):
    inside = "inside"
    outside = "outside"
    enter = "enter"
    exit = "exit"
    cross = "cross"


class GeoFence(BaseModel):
    area_format: Literal[
        "bounds", "geojson", "circle", "tile", "quadkey", "hash", "sector"
    ]
    detection_type: DetectionType
