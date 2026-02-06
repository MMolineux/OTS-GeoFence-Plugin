import asyncio
import aio_pika
import json
import logging
from app.core.config import settings
from app.core.socket import emit_event_new
from sqlmodel import select
from app.db.engine import get_session
from app.models.event import GeofenceEvent
from app.models.geofence import Geofence

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_geofence_name(session, geofence_id):
    geofence = session.get(Geofence, geofence_id)
    return geofence.name if geofence else None


class AlertWorker:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.queue = None

    async def setup_rmq(self):
        logger.info("Setting up RabbitMQ topology...")

        exchange = await self.channel.declare_exchange(
            settings.GEOFENCE_EXCHANGE,
            aio_pika.ExchangeType.FANOUT,
            durable=True,
            passive=False,
        )
        logger.info(f"Declared exchange '{settings.GEOFENCE_EXCHANGE}': {exchange}")

        self.queue = await self.channel.declare_queue(
            "geofence_alerts_queue",
            durable=True,
            auto_delete=False,
            arguments={
                "x-queue-type": "classic",
            },
        )
        logger.info(f"Declared queue 'geofence_alerts_queue': {self.queue}")

        await self.queue.bind(exchange)
        logger.info("Bound 'geofence_alerts_queue' to exchange")

    async def connect(self):
        self.connection = await aio_pika.connect_robust(settings.GEOFENCE_RABBITMQ_URL)
        self.channel = await self.connection.channel()

        await self.setup_rmq()

        logger.info("Alert Worker connected and ready")

    async def process_message(self, message: aio_pika.IncomingMessage):
        async with message.process():
            try:
                body = message.body.decode("utf-8")
                data = json.loads(body)

                event_type = data.get("event")
                hook_meta = data.get("hook", {}).get("meta", {})
                object_data = data.get("object", {})

                geofence_id = hook_meta.get("geofence_id")
                unit_id = object_data.get("id")
                geofence_name = hook_meta.get("geofence_name", "")

                logger.info(
                    f"Alert: {event_type} by {unit_id} in Geofence {geofence_id}"
                )

                session = next(get_session())
                with session:
                    geofence_event = GeofenceEvent(
                        geofence_id=int(geofence_id) if geofence_id else 0,
                        unit_uid=unit_id or "unknown",
                        event_type=event_type or "unknown",
                    )
                    session.add(geofence_event)
                    session.commit()

                    await emit_event_new(
                        {
                            "event_type": event_type,
                            "callsign": unit_id,
                            "geofence_id": int(geofence_id) if geofence_id else 0,
                            "geofence_name": geofence_name,
                        }
                    )

            except Exception as e:
                logger.error(f"Error processing alert: {e}")
                logger.error(f"Raw message: {message.body}")

    async def run(self):
        await self.connect()
        async with self.queue.iterator() as queue_iter:
            async for message in queue_iter:
                await self.process_message(message)


if __name__ == "__main__":
    worker = AlertWorker()
    try:
        asyncio.run(worker.run())
    except KeyboardInterrupt:
        pass
