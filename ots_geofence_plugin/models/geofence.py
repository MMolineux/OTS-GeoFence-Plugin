


from typing import Literal
from pydantic import BaseModel


class GeoFence(BaseModel):
    area_format: Literal["bounds","geojson","circle","tile","quadkey","hash","sector"]
    
    