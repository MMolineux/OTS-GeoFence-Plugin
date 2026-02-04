


from enum import Enum
from ots_geofence_plugin.core.entities.events.base import BaseEvent
from ots_geofence_plugin.core.entities.geofence import DetectionType


class GeoFenceEvent(BaseEvent):
    detection_type: DetectionType
    subject: str