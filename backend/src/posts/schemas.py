# from pydantic import BaseModel
# from datetime import datetime

# class PostCreate(BaseModel):
#     title: str
#     content: str

# class PostUpdate(BaseModel):
#     title: str 
#     content: str 

# class PostInDB(BaseModel):
#     id: int
#     title: str
#     content: str
#     user_id: int
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         from_attributes = True


# # response model
# class PostWithUser(BaseModel):
#     id: int
#     title: str
#     content: str
#     username: str  
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         from_attributes = True

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PostCreate(BaseModel):
    title: Optional[str] = None
    content: str

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class PostInDB(BaseModel):
    id: int
    title: Optional[str] = None
    content: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PostWithUser(BaseModel):
    id: int
    title: Optional[str] = None
    content: str
    username: str 
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True