from app.models.geofence import DetectionType
from pyle38 import Tile38
from app.core.config import settings


class Tile38Service:
    def __init__(self):
        self.client = Tile38(settings.TILE38_URL)

    async def set_point(
        self, unit_id: str, lat: float, lon: float, collection: str = "units"
    ):
        """Update a unit's position in Tile38."""
        await self.client.set(collection, unit_id).point(lat, lon).exec()

    async def create_hook(
        self,
        geofence_id: int,
        geofence_name: str,
        lat: float,
        lon: float,
        radius_meters: float,
        detect_on: list[DetectionType] | None = None,
        collection: str = "units",
    ):
        hook_name = f"hook-{geofence_id}"
        endpoint = settings.GEOFENCE_RABBITMQ_URL
        detect_list = (
            [d.value for d in detect_on]
            if detect_on
            else ["enter", "exit", "inside", "outside"]
        )

        await (
            self.client.sethook(hook_name, endpoint)
            .nearby(collection)
            .point(lat, lon, radius_meters)
            .meta({"geofence_id": str(geofence_id), "geofence_name": geofence_name})
            .detect(detect_list)
            .activate()
        )
        print(f"Created Tile38 hook: {hook_name}")

    async def delete_hook(self, geofence_id: int):
        hook_name = f"hook-{geofence_id}"
        await self.client.delhook(hook_name)
        print(f"Deleted Tile38 hook: {hook_name}")


tile38_service = Tile38Service()


async def get_tile38():
    return tile38_service
