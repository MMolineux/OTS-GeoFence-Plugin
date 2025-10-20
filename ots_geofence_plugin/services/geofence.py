from pyle38 import Tile38

from ots_geofence_plugin.models.config import Config
from ots_geofence_plugin.services.notification import NotificationService


class GeoFenceService:
    def __init__(self, cfg: Config,notif:NotificationService):
        self._t38 = Tile38(**cfg.tile38.model_dump())
        self._notif = notif

    def _get_ampq_uri(self) -> str:
        return "ampq://"
    def set_geofence(self,uid):
        d = self._t38.sethook(uid,)

    def update_geofence(self): ...

    def delete_geofence(self): ...

    def set_point(self): ...
