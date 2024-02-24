from fastapi import Request, HTTPException, status,Depends
from jose import jwt, JWTError
from typing import Annotated
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import os

# Define your security object
security = HTTPBearer()

# JWT Configurations
ALGORITHM = os.getenv('ALGORITHM') 
public_key_path = "/code/keys/public_key.pem"

# Load public key function
def load_public_key():
    with open(public_key_path, "rb") as f:
        public_key = f.read()
    return public_key

# Get payload function
def get_payload(token:str):
    try:
        return jwt.decode(token, load_public_key(), algorithms=[ALGORITHM])
    except JWTError as error:
        print(error)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def UserIsValid(token:str):
    return get_payload(token)

def AdminIsValid(token: str):
    payload = UserIsValid(token)
    if payload['role'] != 'admin':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Dont have premitions",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload
