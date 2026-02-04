from typing import Optional
from pydantic import BaseModel, Field
from pydantic_core import Url


class Tile38Config(BaseModel):
    url: Url
    follower_url: Optional[Url] = Field(None)

class NotifyConfig(BaseModel):
    

class Config(BaseModel):
    tile38: Tile38Config

    notify: 