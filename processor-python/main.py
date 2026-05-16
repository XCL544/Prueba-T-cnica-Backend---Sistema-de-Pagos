from fastapi import FastAPI
from pydantic import BaseModel
import random
import uuid

app = FastAPI(title="Payment Processor Service")

class PaymentRequest(BaseModel):
    amount: float
    user_id: str
    card_id: str

@app.post("/process")
async def process_payment(request: PaymentRequest):
    """
    Simulates a payment process.
    Returns 'approved' (80% chance) or 'rejected' (20% chance).
    """
    # Randomly decide status
    is_approved = random.random() < 0.8
    
    status = "approved" if is_approved else "rejected"
    transaction_id = str(uuid.uuid4())
    
    return {
        "status": status,
        "transaction_id": transaction_id,
        "message": f"Payment {status} successfully" if is_approved else "Payment was rejected by the provider"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
