# chat/schemas.py

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = True

    class Config:
        from_attributes = True

class ChannelResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_public: bool
    created_at: datetime
    created_by: str  

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    id: int
    content: str
    user: str  
    created_at: datetime

    class Config:
        from_attributes = True

class ChannelMemberResponse(BaseModel):
    user: str  
    role: str

    class Config:
        from_attributes = True

class ChannelDetailResponse(ChannelResponse):
    members: List[ChannelMemberResponse]
    messages: List[MessageResponse]

    class Config:
        from_attributes = True

