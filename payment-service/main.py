# PaymentService (fastapi app)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Payment(BaseModel):
    flight_number: str
    seat_number: str
    payment_method: str
    amount: float

@app.post("/payments/")
def make_payment(payment: Payment):
    # Perform payment processing logic here

    # If payment is successful, update the seat status
    return {"message": "Payment successful", "flight_number": payment.flight_number, "seat_number": payment.seat_number}
