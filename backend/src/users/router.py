from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from .schemas import UserCreate, UserResponse, Token
from .service import create_user, authenticate_user, create_access_token, get_current_user
from datetime import timedelta
from .models import User  # Make sure to import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    return await create_user(user)

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user