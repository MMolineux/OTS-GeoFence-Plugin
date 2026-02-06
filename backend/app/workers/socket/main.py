import socketio
from app.core.socket import sio


@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(sio, host="0.0.0.0", port=5000)
