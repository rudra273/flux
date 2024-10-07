import logging
from fastapi import HTTPException, status, Depends
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .models import User, Profile
from .schemas import (UserCreate, UserResponse, 
                        TokenData, PostResponse, 
                        ProfileDetailResponse, ProfileResponse,
                        ProfileUpdate )
from fastapi.security import OAuth2PasswordBearer
import uuid
from typing import Optional
from tortoise.transactions import in_transaction
from src.posts.models import Post 

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "rudra"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Store for refresh tokens (In production, use Redis or database)
refresh_tokens = {}

# async def create_user(user: UserCreate) -> UserResponse:
#     hashed_password = pwd_context.hash(user.password)
#     user_dict = user.dict()
#     user_dict['password'] = hashed_password
#     new_user = User(**user_dict)
#     await new_user.save()
#     logger.info(f"Created new user: {new_user.username}")
#     return UserResponse.from_orm(new_user)

async def create_user(user: UserCreate) -> UserResponse:
    hashed_password = pwd_context.hash(user.password)
    user_dict = user.dict()
    user_dict['password'] = hashed_password
    
    # Create user and profile in a transaction
    async with in_transaction() as connection:
        new_user = await User.create(**user_dict)
        await Profile.create(user=new_user)
    
    logger.info(f"Created new user and profile: {new_user.username}")
    return UserResponse.from_orm(new_user)

async def authenticate_user(username: str, password: str) -> Optional[User]:
    user = await User.get_or_none(username=username)
    if not user or not pwd_context.verify(password, user.password):
        logger.warning(f"Failed authentication attempt for username: {username}")
        return None
    logger.info(f"Successful authentication for username: {username}")
    return user

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    to_encode.update({"token_type": "access"})
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"Created access token for user: {data['sub']}")
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "token_type": "refresh",
        "exp": expire
    })
    refresh_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # Store refresh token with metadata
    refresh_tokens[refresh_token] = {
        "username": data["sub"],
        "expires": expire
    }
    logger.info(f"Created refresh token for user: {data['sub']}")
    return refresh_token

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("token_type")
        exp = payload.get("exp")
        
        if username is None or token_type != "access":
            logger.warning("Invalid token: missing username or incorrect token type")
            raise credentials_exception
            
        # Check if token is expired
        if datetime.fromtimestamp(exp) < datetime.utcnow():
            logger.warning(f"Expired token for user: {username}")
            raise credentials_exception
            
        token_data = TokenData(username=username, token_type=token_type)
    except JWTError:
        logger.error("Failed to decode JWT token", exc_info=True)
        raise credentials_exception
        
    user = await User.get_or_none(username=token_data.username)
    if user is None:
        logger.warning(f"User not found: {token_data.username}")
        raise credentials_exception
    return user

async def verify_refresh_token(refresh_token: str) -> str:
    try:
        # Check if refresh token exists in storage
        if refresh_token not in refresh_tokens:
            logger.warning("Invalid refresh token: not found in storage")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
            
        # Decode and verify the refresh token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("token_type")
        exp = payload.get("exp")
        
        if username is None or token_type != "refresh":
            logger.warning("Invalid refresh token: missing username or incorrect token type")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
            
        # Check if token is expired
        if datetime.fromtimestamp(exp) < datetime.utcnow():
            # Remove expired token from storage
            del refresh_tokens[refresh_token]
            logger.warning(f"Expired refresh token for user: {username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired"
            )
            
        return username
    except JWTError:
        logger.error("Failed to decode refresh token", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

def revoke_refresh_token(refresh_token: str) -> None:
    if refresh_token in refresh_tokens:
        username = refresh_tokens[refresh_token]["username"]
        del refresh_tokens[refresh_token]
        logger.info(f"Revoked refresh token for user: {username}")



# profile 
async def get_user_profile(username: str) -> Optional[ProfileDetailResponse]:
    user = await User.get_or_none(username=username).prefetch_related('profile', 'posts')
    if not user:
        return None
        
    # Get recent posts with all details
    recent_posts = await Post.filter(user=user).order_by('-created_at').limit(5)
    
    return ProfileDetailResponse(
        username=user.username,
        email=user.email,
        first_name=user.profile.first_name,
        last_name=user.profile.last_name,
        bio=user.profile.bio,
        dob=user.profile.dob,
        recent_posts=[PostResponse.from_orm(post) for post in recent_posts]
    )


async def update_user_profile(username: str, profile_data: ProfileUpdate) -> Optional[ProfileResponse]:
    user = await User.get_or_none(username=username).prefetch_related('profile')
    if not user:
        return None
        
    # Update profile
    await user.profile.update_from_dict(profile_data.dict(exclude_unset=True)).save()
    
    # Refresh the profile data
    await user.profile.refresh_from_db()
    
    return ProfileResponse(
        username=user.username,
        email=user.email,
        first_name=user.profile.first_name,
        last_name=user.profile.last_name,
        bio=user.profile.bio,
        dob=user.profile.dob
    )
