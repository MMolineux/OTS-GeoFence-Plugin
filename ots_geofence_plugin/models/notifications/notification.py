import enum
from pydantic import BaseModel, Field
from datetime import datetime

from ots_geofence_plugin.models.notifications.channel import Channel


class NotificationSeverity(str, enum.Enum):
    emergency = "emergency"
    normal = "normal"


class Notification(BaseModel):
    created_at: datetime
    relayed_at: datetime
    expire_at: datetime

    message: str
    severity: NotificationSeverity = Field(NotificationSeverity.normal)

    channel: Channel
