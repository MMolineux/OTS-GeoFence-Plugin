import asyncio
import aio_pika
import logging
from app.core.config import settings
from app.worker.parser import CoTParser
from app.services.tile38 import tile38_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def process_message(message: aio_pika.IncomingMessage):
    async with message.process():
        parsed = CoTParser.parse(message.body)
        if not parsed:
            return

        # Update unit position in Tile38
        await tile38_service.set_point(
            unit_id=parsed.uid, lat=parsed.point.lat, lon=parsed.point.lon
        )

        # Handle auto-registration of geofences
        if parsed.is_geofence:
            logger.info(f"Detected native geofence: {parsed.uid}")
            # In a real implementation, we would also save this to PostgreSQL
            # and then register it in Tile38 if not already present


async def main():
    connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)

    async with connection:
        channel = await connection.channel()

        # We listen to the cot_controller exchange (fanout in OTS)
        # We create our own unique, auto-delete queue
        exchange = await channel.declare_exchange(
            "cot_controller", aio_pika.ExchangeType.FANOUT, durable=True
        )
        queue = await channel.declare_queue(exclusive=True, auto_delete=True)
        await queue.bind(exchange)

        logger.info("Worker started. Listening for CoT messages...")

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                await process_message(message)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
