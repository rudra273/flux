from pydantic import BaseModel, Field
from datetime import datetime

class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    pass

class PostInDB(PostBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True