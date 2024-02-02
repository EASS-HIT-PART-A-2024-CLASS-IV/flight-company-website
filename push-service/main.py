# WebSocketService (fastapi app)
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pymongo import MongoClient
from typing import List, Dict
import time

app = FastAPI()
client = MongoClient('mongodb://mongodb:27017/')
db = client['flight_database']
flights_collection = db['flights']

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, flight_number: str):
        await websocket.accept()
        self.active_connections.setdefault(flight_number, []).append(websocket)

    def disconnect(self, websocket: WebSocket, flight_number: str):
        if flight_number in self.active_connections:
            self.active_connections[flight_number].remove(websocket)

    async def broadcast(self, flight_number: str, message: str):
        if flight_number in self.active_connections:
            for connection in self.active_connections[flight_number]:
                await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{flight_number}")
async def websocket_endpoint(websocket: WebSocket, flight_number: str):
    await manager.connect(websocket, flight_number)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, flight_number)
        await manager.broadcast(flight_number, "A client left the chat")

# Poll for seat changes in the database and broadcast updates
async def poll_for_changes():
    while True:
        time.sleep(5)  # Adjust the polling interval as needed
        
        # Perform a query to check for updates in the "seats" collection
        # This is just a placeholder, adjust the query based on your requirements
        updated_seats = flights_collection.find({"seats.isLocked": {"$exists": True, "$ne": False}})
        
        for seat in updated_seats:
            flight_number = seat["number"]
            seat_number = seat["seats"]["number"]
            is_locked = seat["seats"]["isLocked"]
            
            # Notify all subscribed clients about the seat update
            await manager.broadcast(flight_number, f"Flight {flight_number}, Seat {seat_number} is {'Locked' if is_locked else 'Unlocked'}")

# Start the polling in the background
import asyncio
asyncio.create_task(poll_for_changes(),name='push service')
