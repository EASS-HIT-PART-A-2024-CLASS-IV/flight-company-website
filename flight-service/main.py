import requests
import os
from fastapi import FastAPI, HTTPException,Depends,Query
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Annotated
from .verification import UserIsValid,AdminIsValid
from datetime import date,time,datetime, timedelta
from typing import List

import os
app = FastAPI()

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
# load env
NUM_OF_SEATS = int(os.getenv("NUM_OF_SEATS", 100))
MONGO_URL = os.getenv("MONGO_URL","mongodb://localhost:27017/")

client = MongoClient(MONGO_URL)
db = client['flight_database']
flights_collection = db['flights']

class Seat(BaseModel):
    number: str
    isLocked: bool
    
class Flight(BaseModel):
    number: str
    source: str
    destination: str
    cost_per_seat: float
    date: date
    time: time

def validate_country_name(country_name:str):
    baseURL:str = os.getenv("COUNTRIES_HTTP")        
    try:
        response = requests.get(f"{baseURL}/countries/name/{country_name}")
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error validating country name: {e}")

@app.post("/flights/")
def create_flight(flight: Flight,credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())]):
    AdminIsValid(credentials.credentials)
    # Check if a flight with the same number already exists
    existing_flight = flights_collection.find_one({"number": flight.number})
    
    # validation
    if existing_flight:
        raise HTTPException(status_code=400, detail="Flight with the same number already exists")
    
    if NUM_OF_SEATS <= 0:
        raise HTTPException(status_code=400, detail="Number of seats must be greater than 0")
    
    source_country = validate_country_name(flight.source)
    destination_country = validate_country_name(flight.destination)

    if source_country["name"] == destination_country["name"]:
        raise HTTPException(status_code=400, detail="Source and destination countries cannot be the same")
    
    new_flight = {
        "number": flight.number,
        "source": source_country["name"],
        "destination": destination_country["name"],
        "seats": [{"number":str(i),"isLocked":False} for i in range(1, NUM_OF_SEATS + 1)],
        "cost": flight.cost_per_seat,
        "date": flight.date.strftime("%Y-%m-%d"),
        "time": flight.time.strftime("%H:%M")
    }
    
    try:
        result = flights_collection.insert_one(new_flight)
        print(result)
        inserted_flight = flights_collection.find_one({"_id": result.inserted_id})
        inserted_flight.pop('_id', None)
        return inserted_flight
    except Exception as error:
        print("An exception occurred:", error)
        raise HTTPException(status_code=500, detail="Failed to create flight")

@app.get("/flights/{flight_number}")
def get_flight(flight_number: str):
    flight = flights_collection.find_one({"number": flight_number})
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    # Exclude the ObjectId field from the response
    flight.pop('_id', None)

    return flight

@app.get("/flights/")
def get_all_flights(credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())],limit: int = 10):
    UserIsValid(credentials.credentials)
    # Get all flights with a limit
    all_flights = list(flights_collection.find().limit(limit))

    # Exclude the ObjectId field from each flight in the response
    for flight in all_flights:
        flight.pop('_id', None)

    return all_flights

@app.get("/search-flights")
def search_flights(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())],
    source: str = Query(..., description="The country source"),
    destination: str = Query(..., description="The country destination"),
    checkIn: datetime = Query(..., description="The date of the one-way flight"),
    checkOut: datetime = Query(..., description="The return date flight")
):    
    UserIsValid(credentials.credentials)
    # Convert date to datetime objects
    check_in_str = checkIn.date().strftime("%Y-%m-%d")
    check_out_str = checkOut.date().strftime("%Y-%m-%d")

    source_country = validate_country_name(source)
    destination_country = validate_country_name(destination)

    if source_country["name"] == destination_country["name"]:
        raise HTTPException(status_code=400, detail="Source and destination countries cannot be the same")

    # Query flights for the check-in date and one-way flight from source to destination
    one_way_flights_cursor = flights_collection.find({
        "source": source_country["name"],
        "destination": destination_country["name"],
        "date": check_in_str
    }).sort("time")

    # Query flights for the check-out date and return flight from destination to source
    return_flights_cursor = flights_collection.find({
        "source": destination_country["name"],
        "destination": source_country["name"],
        "date": check_out_str
    }).sort("time")
    
    # Convert the cursor objects to lists
    one_way_flights = [{key: value for key, value in flight.items() if key != '_id'} for flight in one_way_flights_cursor]
    return_flights = [{key: value for key, value in flight.items() if key != '_id'} for flight in return_flights_cursor]

    return [one_way_flights, return_flights]