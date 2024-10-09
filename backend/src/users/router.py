# users/router.py

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from .schemas import UserCreate, UserResponse, Token, RefreshToken, ProfileDetailResponse, ProfileResponse, ProfileUpdate
from .service import (
    create_user, authenticate_user, create_access_token, create_refresh_token,
    get_current_user, verify_refresh_token, revoke_refresh_token,
    get_user_profile, update_user_profile
    
)
from datetime import timedelta
from .models import User

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
ACCESS_TOKEN_EXPIRE_MINUTES = 5

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    logger.info(f"Registering new user: {user.username}")
    return await create_user(user)

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        logger.warning(f"Failed login attempt for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.username})
    logger.info(f"Successful login for user: {user.username}")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: RefreshToken):
    logger.info("Token refresh attempt")
    try:
        username = await verify_refresh_token(refresh_token.refresh_token)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )
        new_refresh_token = create_refresh_token(data={"sub": username})
        
        # Revoke the old refresh token
        revoke_refresh_token(refresh_token.refresh_token)
        
        logger.info(f"Successfully refreshed tokens for user: {username}")
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except HTTPException as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during token refresh: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error refreshing tokens"
        )

@router.post("/logout")
async def logout(refresh_token: RefreshToken):
    logger.info("Logout attempt")
    revoke_refresh_token(refresh_token.refresh_token)
    logger.info("Successfully logged out")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching user info for: {current_user.username}")
    return current_user


# profile

@router.get("/profile/{username}", response_model=ProfileDetailResponse)
async def get_profile(username: str):
    logger.info(f"Fetching profile for user: {username}")
    profile = await get_user_profile(username)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return profile


@router.put("/profile/{username}", response_model=ProfileResponse)
async def update_profile(
    username: str,
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    # Check if the current user is updating their own profile
    if current_user.username != username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update another user's profile"
        )
    
    logger.info(f"Updating profile for user: {username}")
    updated_profile = await update_user_profile(username, profile_data)
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_profile