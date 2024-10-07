from pydantic import BaseModel, EmailStr, validator
import re
from typing import Optional, List 
from datetime import date, datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "member"

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenData(BaseModel):
    username: str
    token_type: str 


class RefreshToken(BaseModel):
    refresh_token: str


# profile detail 
class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    dob: Optional[date] = None


class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    # Add any other fields that are in your Post model
    # For example, if you have fields like:
    # is_published: bool
    # likes_count: int
    # etc.

    class Config:
        from_attributes = True


class ProfileResponse(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    dob: Optional[date] = None
    username: str
    email: Optional[str]

    class Config:
        from_attributes = True


class ProfileDetailResponse(ProfileResponse):
    recent_posts: List[PostResponse] = []