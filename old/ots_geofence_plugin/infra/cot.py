from dataclasses import dataclass
from typing import Callable
from bs4 import BeautifulSoup


@dataclass
class CoTMessage:
    uid: str
    cot: BeautifulSoup


CoTProcessor = Callable[[CoTMessage], bool]
