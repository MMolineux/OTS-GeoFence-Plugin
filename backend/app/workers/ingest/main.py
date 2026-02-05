import asyncio
import aio_pika
import logging
from app.core.config import settings
from app.workers.ingest.parser import CoTParser
from app.services.tile38 import tile38_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def process_message(message: aio_pika.IncomingMessage):
    async with message.process():
        parsed = CoTParser.parse(message.body)
        if not parsed:
            return

        await tile38_service.set_point(
            unit_id=parsed.uid, lat=parsed.point.lat, lon=parsed.point.lon
        )

        if parsed.is_geofence:
            logger.info(f"Detected native geofence: {parsed.uid}")


async def main():
    connection = await aio_pika.connect_robust(settings.COT_RABBITMQ_URL)

    async with connection:
        channel = await connection.channel()

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
