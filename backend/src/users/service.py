# from fastapi import HTTPException, status, Depends
# from passlib.context import CryptContext
# from jose import JWTError, jwt
# from datetime import datetime, timedelta
# from .models import User
# from .schemas import UserCreate, UserResponse
# from fastapi.security import OAuth2PasswordBearer

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# SECRET_KEY = "rudra"  
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

# async def create_user(user: UserCreate) -> UserResponse:
#     hashed_password = pwd_context.hash(user.password)
#     user_dict = user.dict()
#     user_dict['password'] = hashed_password
#     new_user = User(**user_dict)
#     await new_user.save()
#     return UserResponse.from_orm(new_user)

# async def authenticate_user(username: str, password: str):
#     user = await User.get_or_none(username=username)
#     if not user or not pwd_context.verify(password, user.password):
#         return False
#     return user

# def create_access_token(data: dict, expires_delta: timedelta ):
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.utcnow() + expires_delta
#     else:
#         expire = datetime.utcnow() + timedelta(minutes=15)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     return encoded_jwt



# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username: str = payload.get("sub")
#         if username is None:
#             raise credentials_exception
#     except JWTError:
#         raise credentials_exception
#     user = await User.get_or_none(username=username)
#     if user is None:
#         raise credentials_exception
#     return user

from fastapi import HTTPException, status, Depends
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .models import User
from .schemas import UserCreate, UserResponse
from fastapi.security import OAuth2PasswordBearer
import uuid


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "rudra"  # In production, use a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Store for refresh tokens (In production, use Redis or database)
refresh_tokens = set()


async def create_user(user: UserCreate) -> UserResponse:
    hashed_password = pwd_context.hash(user.password)
    user_dict = user.dict()
    user_dict['password'] = hashed_password
    new_user = User(**user_dict)
    await new_user.save()
    return UserResponse.from_orm(new_user)


async def authenticate_user(username: str, password: str):
    user = await User.get_or_none(username=username)
    if not user or not pwd_context.verify(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    to_encode.update({"token_type": "access"})
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    to_encode = data.copy()
    to_encode.update({
        "token_type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    })
    refresh_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    refresh_tokens.add(refresh_token)
    return refresh_token


def revoke_refresh_token(refresh_token: str):
    if refresh_token in refresh_tokens:
        refresh_tokens.remove(refresh_token)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("token_type")
        if username is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await User.get_or_none(username=username)
    if user is None:
        raise credentials_exception
    return user


async def verify_refresh_token(refresh_token: str):
    try:
        if refresh_token not in refresh_tokens:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("token_type")
        if username is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
