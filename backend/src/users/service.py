from fastapi import HTTPException, status, Depends
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .models import User
from .schemas import UserCreate, UserResponse
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "rudra"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

def create_access_token(data: dict, expires_delta: timedelta ):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await User.get_or_none(username=username)
    if user is None:
        raise credentials_exception
    return user