from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Request, HTTPException,status
from pymongo import MongoClient
from passlib.context import CryptContext
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import os
private_key_path = "/code/keys/private_key.pem"
public_key_path = "/code/keys/public_key.pem"

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URL"))
db = client["auth_service"]
users_collection = db["users"]
refresh_tokens_collection = db["refresh_tokens"]


# JWT Configurations
ALGORITHM = os.getenv('ALGORITHM') 

# Password hashing
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load public key
def load_public_key():
    with open(public_key_path, "rb") as f:
        public_key = f.read()
    return public_key

def load_private_key():
    with open(private_key_path, "r") as key_file:
        private_key = key_file.read()
    return private_key

# Middleware for verifying JWT tokens
async def verify_token(token,isRefresh:bool=False):
    try:
        payload = jwt.decode(token, load_public_key(), algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if isRefresh == True:
        refresh_valid = refresh_tokens_collection.find_one({"username":payload["sub"],"refresh_token":token})
        if refresh_valid is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
    return payload

# Generate RSA private and public keys if they don't exist
def generate_keys():
    if not os.path.exists(private_key_path) or not os.path.exists(public_key_path):

        private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=2048
        )

        # Save private key
        with open(private_key_path, "wb") as f:
            f.write(
                private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption(),
                )
            )

        # Save public key
        public_key = private_key.public_key()
        print(public_key)
        with open(public_key_path, "wb") as f:
            f.write(
                public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo,
                )
            )

# Function to get user from MongoDB
def get_user(username: str):
    user = users_collection.find_one({"username": username})
    return user

# Function to create a new user
def create_user(username: str, password: str, role: str):
    hashed_password = password_context.hash(password)
    user_data = {"username": username, "password": hashed_password, "role": role}
    users_collection.insert_one(user_data)

# Function to verify password
def verify_password(plain_password, hashed_password):
    return password_context.verify(plain_password, hashed_password)

# Function to create access token
def create_token(data: dict, expires_delta: timedelta = None,isRefresh:bool = False):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, load_private_key(), algorithm=ALGORITHM)
    if isRefresh == True:
        # is refresh token
        refresh_tokens_collection.update_one(
        {"username": data["sub"]},
        {"$set": {"refresh_token": encoded_jwt}},
        upsert=True
    )
    return encoded_jwt

# Dependency to get current user based on token
async def get_current_user(token: str):
    return get_user((await verify_token(token))["sub"])