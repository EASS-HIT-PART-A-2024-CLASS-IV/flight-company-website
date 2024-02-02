# FlightService (fastapi app)
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
app = FastAPI()

origins = [
    'http://localhost:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(os.getenv("MONGO_URL"))
db = client['flight_database']
flights_collection = db['flights']

class Seat(BaseModel):
    number: str
    isLocked: bool
    

class Flight(BaseModel):
    number: str
    num_of_seats: int
    cost_per_seat: float

@app.post("/flights/")
def create_flight(flight: Flight):
    # Check if a flight with the same number already exists
    existing_flight = flights_collection.find_one({"number": flight.number})
    
    # validation
    if existing_flight:
        raise HTTPException(status_code=400, detail="Flight with the same number already exists")
    
    if flight.num_of_seats <= 0:
        raise HTTPException(status_code=400, detail="Number of seats must be greater than 0")
    
    new_flight = {
        "number": flight.number,
        "seats": [{"number":str(i),"isLocked":False} for i in range(1, flight.num_of_seats + 1)],
        "cost": flight.cost_per_seat
    }
    
    try:
        result = flights_collection.insert_one(new_flight)
    except Exception as error:
        # handle the exception
        print("An exception occurred:", error)
    
    # Get the inserted document from the database
    inserted_flight = flights_collection.find_one({"_id": result.inserted_id})

    # Exclude the ObjectId field from the response
    inserted_flight.pop('_id', None)

    return inserted_flight

@app.get("/flights/{flight_number}")
def get_flight(flight_number: str):
    flight = flights_collection.find_one({"number": flight_number})
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight

@app.get("/flights/")
def get_all_flights(limit: int = 10):
    # Get all flights with a limit
    all_flights = list(flights_collection.find().limit(limit))

    # Exclude the ObjectId field from each flight in the response
    for flight in all_flights:
        flight.pop('_id', None)

    return all_flights