from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router as api_router
from app.core.socket import sio

app = FastAPI(
    title="GeoFence Service API",
    description="Standalone GeoFence Monitoring Service",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SocketIOApp:
    async def __call__(self, scope, receive, send):
        if scope["type"] == "lifespan":
            return
        await sio.handle_request(scope, receive, send)


app.mount("/socket.io", SocketIOApp())

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "healthy"}
