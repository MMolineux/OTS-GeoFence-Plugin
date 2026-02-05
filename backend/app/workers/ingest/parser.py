from lxml import etree
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time


class CoTPoint(BaseModel):
    lat: float
    lon: float
    hae: float = 0.0
    ce: float = 0.0
    le: float = 0.0


class ParsedCoT(BaseModel):
    uid: str
    type: str
    time: str
    start: str
    stale: str
    how: str
    point: CoTPoint
    callsign: Optional[str] = None

    # Metadata for geofences
    is_geofence: bool = False
    geofence_data: Optional[Dict[str, Any]] = None


class CoTParser:
    @staticmethod
    def parse(body: bytes) -> Optional[ParsedCoT]:
        try:
            root = etree.fromstring(body)
            if root.tag != "event":
                return None

            event_type = root.get("type")
            uid = root.get("uid")

            point_el = root.find("point")
            if point_el is None:
                return None

            point = CoTPoint(
                lat=float(point_el.get("lat")),
                lon=float(point_el.get("lon")),
                hae=float(point_el.get("hae", 0.0)),
                ce=float(point_el.get("ce", 0.0)),
                le=float(point_el.get("le", 0.0)),
            )

            parsed = ParsedCoT(
                uid=uid,
                type=event_type,
                time=root.get("time"),
                start=root.get("start"),
                stale=root.get("stale"),
                how=root.get("how"),
                point=point,
            )

            detail = root.find("detail")
            if detail is not None:
                contact = detail.find("contact")
                if contact is not None:
                    parsed.callsign = contact.get("callsign")

                # Check for native __geofence
                if event_type == "u-d-g":
                    parsed.is_geofence = True
                    parsed.geofence_data = CoTParser._parse_geofence_detail(detail)

            return parsed
        except Exception as e:
            # In a real app, we'd log this, but we're optimized for speed
            return None

    @staticmethod
    def _parse_geofence_detail(detail: etree.Element) -> Dict[str, Any]:
        data = {}
        # Native TAK geofence data usually lives in a specific element
        # This is a simplified version; real TAK XML is complex
        # Often includes <link rel="u-d-g" ... /> or similar
        return data
