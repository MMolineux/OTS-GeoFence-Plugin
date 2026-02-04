from pyle38 import Tile38
from app.core.config import settings
import json


class Tile38Service:
    def __init__(self):
        self.client = Tile38(settings.TILE38_URL)

    async def set_point(
        self, unit_id: str, lat: float, lon: float, collection: str = "units"
    ):
        """Update a unit's position in Tile38."""
        await self.client.set(collection, unit_id).point(lat, lon).exec()

    async def set_geofence(
        self,
        fence_id: str,
        shape_type: str,
        shape_data: dict,
        collection: str = "fences",
    ):
        """Register a geofence boundary in Tile38."""
        if shape_type == "circle":
            await (
                self.client.set(collection, fence_id)
                .circle(shape_data["lat"], shape_data["lon"], shape_data["radius"])
                .exec()
            )
        elif shape_type == "polygon":
            # shape_data["points"] should be list of [lat, lon]
            await (
                self.client.set(collection, fence_id)
                .polygon(shape_data["points"])
                .exec()
            )
        # Add more shape types as needed

    async def create_webhook_hook(
        self, hook_id: str, endpoint: str, collection: str = "units"
    ):
        """Create a Tile38 hook that calls back to our API when a geofence is breached."""
        # This is a broad hook that monitors all fences for units
        # Tile38 hooks are very powerful.
        await self.client.sethook(hook_id, endpoint).nearby(collection).fence().exec()


tile38_service = Tile38Service()


async def get_tile38():
    return tile38_service
