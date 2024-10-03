from pydantic import BaseModel
from datetime import datetime

class PostCreate(BaseModel):
    title: str
    content: str

class PostUpdate(BaseModel):
    title: str 
    content: str 

class PostInDB(BaseModel):
    id: int
    title: str
    content: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True