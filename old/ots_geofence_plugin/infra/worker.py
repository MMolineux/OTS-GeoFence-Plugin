from abc import ABC, abstractmethod
import json
from typing import Callable, Optional, Protocol
from attr import dataclass
from bs4 import BeautifulSoup
from flask import Flask
import pika
import pika.channel
import pika.spec
from sqlalchemy import true
from threading import Thread
from pika.channel import Channel

from ots_geofence_plugin.infra.rmq_base import RabbitMQClient
from opentakserver.extensions import logger
from xml.etree.ElementTree import ElementTree


class CoTListener(RabbitMQClient):
    """RMQ client worker to listen for already _parsed_ CoT events from cot_parser and execute a processor"""

    def __init__(self, app: Flask):
        self._app = app

        try:
            self.rabbit_connection = pika.SelectConnection(
                pika.ConnectionParameters(
                    self._app.config.get("OTS_RABBITMQ_SERVER_ADDRESS")
                ),
                self.on_connection_open,
            )
            self.rabbit_channel: Channel = None
            self.iothread = Thread(target=self.rabbit_connection.ioloop.start)
            self.iothread.daemon = True
            self.iothread.start()
            self.is_consuming = False
        except BaseException as e:
            logger.error("Failed to connect to rabbitmq: {}".format(e))
            return

    def on_connection_open(self, connection):
        self.rabbit_connection.channel(on_open_callback=self.on_channel_open)
        self.rabbit_connection.add_on_close_callback(self.on_close)
        logger.debug("rabbit connection open")

    def on_channel_open(self, channel: pika.channel.Channel):
        self._chan = channel
        # declare queue and bind
        self._chan.queue_declare(queue="gf-listen", durable=False, auto_delete=true)
        self._chan.queue_bind(queue="gf-listen", exchange="cot_controller")

        self._chan.basic_consume(
            queue="gf-listen",
            on_message_callback=self.on_message,
            auto_ack=true,
            consumer_tag="GeoFencePlugin.CoTListener",
        )

    def on_message(
        self,
        unused_channel,
        basic_deliver,
        properties: pika.spec.BasicProperties,
        body: bytes,
    ):
        logger.debug(f"[{properties.message_id}] new message body {body}")
        try:
            msg_raw = json.load(body)
            uid = msg_raw.get("uid")
            cot = BeautifulSoup(msg_raw.get("cot"), "xml")
            msg = CoTMessage(uid, cot)

            if self._processor(msg):
                logger.debug(
                    f"[{properties.message_id}] processed message successfully"
                )
            else:
                logger.warning(f"[{properties.message_id}] failed to process message")

        except Exception:
            logger.exception(
                f"[{properties.message_id}] exception encountered while processing message"
            )
