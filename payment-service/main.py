# PaymentService (fastapi app)
import requests
import os
from fastapi import FastAPI, HTTPException,Depends,Query
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Annotated
from .verification import UserIsValid
from datetime import date,time,datetime, timedelta
from typing import List
app = FastAPI()

MONGO_URL = os.getenv("MONGO_URL","mongodb://localhost:27017/")
client = MongoClient(MONGO_URL)
flight_database = client['flight_database']
flights_collection = flight_database['flights']
payments_database = client['payment_database']
payments_collection = payments_database['payments']
class Payment(BaseModel):
    nameOnCard: str
    cardNumber: str
    expiry: str
    cvc: str
    fullName: str
    id: str
    dob: str
    selectedFromSeat: str
    selectedToSeat: str
    amount: float
    fromFlightNumber:str
    toFlightNumber:str

origins = [
    '*'
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_flightNumber(flightNumber:str):
    baseURL:str = os.getenv("FLIGHT_HTTP")        
    try:
        response = requests.get(f"{baseURL}/flights/{flightNumber}")
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error validating flight number: {e}")
@app.post("/pay")
async def make_payment(payment: Payment,credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())]):
    UserIsValid(credentials.credentials)
    fromFlight = get_flightNumber(payment.fromFlightNumber)
    toFlight = get_flightNumber(payment.toFlightNumber)
    cost = fromFlight["cost"] + toFlight["cost"]
    if cost != payment.amount:
        raise HTTPException(status_code=404, detail=f"payment: amount not adapt flights costs")
    
    for seat in fromFlight["seats"]:
        if seat["number"] == payment.selectedFromSeat:
            if seat["isLocked"] == True:
                raise HTTPException(status_code=404, detail=f"payment: source seat already taken")
            else:
                seat["isLocked"] = True
                flights_collection.update_one({"number": fromFlight["number"]}, {"$set": {"seats": fromFlight["seats"]}})
            break

            
    for seat in toFlight["seats"]:
        if seat["number"] == payment.selectedFromSeat:
            if seat["isLocked"] == True:
                raise HTTPException(status_code=404, detail=f"payment: source seat already taken")
            else:
               seat["isLocked"] = True
               flights_collection.update_one({"number": toFlight["number"]}, {"$set": {"seats": toFlight["seats"]}}) 
            break
    payment_data = payment.model_dump()
    payment_data.pop('id')  # Remove id from payment data since MongoDB will automatically assign an _id
    payment_data['timestamp'] = datetime.now()  # Add timestamp for when the payment was made
    payments_collection.insert_one(payment_data)
    return True
