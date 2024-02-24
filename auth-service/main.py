from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Annotated
from enum import Enum
from datetime import timedelta
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from .verification import get_current_user, create_token, verify_token, generate_keys, create_user, get_user, verify_password
import os
app = FastAPI()

origins = [
    'http://localhost:3000'
]

# Generate keys if they don't exist
generate_keys()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# OAuth2PasswordBearer for token extraction
security = HTTPBearer()

# Middleware for verifying JWT tokens
# app.add_middleware(verify_token)

class UserRole(str, Enum):
    user = "user"
    admin = "admin"

class RegisterUser(BaseModel):
    username: str
    password: str
    role: UserRole

class LoginUser(BaseModel):
    username: str
    password: str



# Route to create a new user
@app.post("/register", response_model=dict)
async def register(user:RegisterUser):
    dbuser = get_user(user.username)
    if dbuser:
        raise HTTPException(status_code=400, detail="Username already registered")
    create_user(user.username, user.password, user.role)
    return {"message": "User created successfully"}

# Route to obtain access token
@app.post("/token", response_model=dict)
async def login(user:LoginUser):
    dbuser = get_user(user.username)
    if not dbuser or not verify_password(user.password, dbuser["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES')))
    access_token = create_token(data={"sub": user.username, "role":dbuser["role"]}, expires_delta=access_token_expires)

    refresh_token_expires = timedelta(days=int(os.getenv('REFRESH_TOKEN_EXPIRE_DAYS')))
    refresh_token = create_token(data={"sub": user.username}, expires_delta=refresh_token_expires,isRefresh=True)

    return {"access_token": access_token, "refresh_token": refresh_token, "role": dbuser["role"]}

@app.post("/token/refresh", response_model=dict)
async def refresh_access_token(refresh_token: str):
    dbuser = get_user((await verify_token(refresh_token,isRefresh=True))["sub"])

    access_token_expires = timedelta(minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES')))
    access_token = create_token(data={"sub": dbuser["username"], "role":dbuser["role"]}, expires_delta=access_token_expires)

    refresh_token_expires = timedelta(days=int(os.getenv('REFRESH_TOKEN_EXPIRE_DAYS')))
    refresh_token = create_token(data={"sub": dbuser["username"]}, expires_delta=refresh_token_expires,isRefresh=True)

    return {"access_token": access_token, "refresh_token": refresh_token, "role": dbuser["role"]}


@app.get("/users/me")
async def read_users_me(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    token = credentials.credentials
    user = await get_current_user(token)
    return {"username": user["username"], "role": user["role"]}