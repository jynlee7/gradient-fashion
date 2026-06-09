from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Item(BaseModel):
    id: str
    title: str
    description: str
    image_url: str
    price: str
    source: str
    source_url: str
    category: str
    tags: List[str]
    likes: int = 0
    curator: str

class FeedResponse(BaseModel):
    items: List[Item]
    next_cursor: Optional[str] = None

class SimilarRequest(BaseModel):
    image_url: str

class Board(BaseModel):
    id: str
    name: str
    curator: str
    description: str
    items: List[str]
    item_count: int
