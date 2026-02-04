from typing import Optional
from sqlmodel import SQLModel, Field
from enum import Enum
import time


class ChannelType(str, Enum):
    WEBHOOK = "webhook"
    EMAIL = "email"
    SMS = "sms"
    DISCORD = "discord"
    SLACK = "slack"
    RABBITMQ = "rabbitmq"


class NotificationSeverity(str, Enum):
    emergency = "emergency"
    normal = "normal"


class NotificationChannel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: ChannelType
    config: str  # JSON string containing channel-specific config
    enabled: bool = True
    created_at: float = Field(default_factory=time.time)


class GeofenceTrigger(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    geofence_id: int = Field(foreign_key="geofence.id")
    channel_id: int = Field(foreign_key="notificationchannel.id")

    # Trigger conditions
    on_enter: bool = True
    on_exit: bool = False
    on_cross: bool = False
    on_inside: bool = False
    on_outside: bool = False

    # Filtering (JSON string for speed/type filters)
    filters: Optional[str] = None
    enabled: bool = True
