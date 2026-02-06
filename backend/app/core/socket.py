import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=False,
)


async def emit_geofence_created(geofence_id: int, geofence_name: str):
    await sio.emit("geofence:created", {"id": geofence_id, "name": geofence_name})


async def emit_geofence_updated(geofence_id: int, geofence_name: str):
    await sio.emit("geofence:updated", {"id": geofence_id, "name": geofence_name})


async def emit_geofence_deleted(geofence_id: int):
    await sio.emit("geofence:deleted", {"id": geofence_id})


async def emit_event_new(event_data: dict):
    await sio.emit("event:new", event_data)
