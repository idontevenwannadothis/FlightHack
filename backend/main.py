import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from services.serpapi_service import search_flights
from services.vpn_service import get_vpn_recommendation
from db.supabase_client import save_search, get_saved_flights, add_saved_flight, remove_saved_flight
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="FlightHack API", description="API for cheap route finding and VPN price discrimination")

# Allow Frontend to communicate with Backend
# In production, set ALLOWED_ORIGINS to your frontend domain(s), comma-separated:
#   ALLOWED_ORIGINS=https://your-app.vercel.app
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to FlightHack API"}

@app.get("/api/search")
async def api_search_flights(
    origin: str = Query(..., description="IATA code for origin"),
    destination: str = Query("ANY", description="IATA code for destination (or ANY for anywhere mode)"),
    date_from: str = Query(..., description="Departure date (DD/MM/YYYY)"),
    date_to: Optional[str] = Query(None, description="Return date (DD/MM/YYYY)"),
    passengers: int = Query(1, description="Number of passengers")
):
    try:
        is_anywhere = not destination or destination.upper() == "ANY"
        
        flights = await search_flights(origin, destination, date_from, date_to, passengers)
        
        # Only show VPN advice for specific destinations, not anywhere mode
        vpn_advice = None if is_anywhere else get_vpn_recommendation(origin, destination)
        
        save_search(origin, destination or "ANYWHERE", date_from)

        return {
            "vpn_recommendation": vpn_advice,
            "results": flights,
            "is_anywhere": is_anywhere
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SavedFlightData(BaseModel):
    user_id: str
    flight_id: str
    price: float
    currency: str = "EUR"
    duration: Optional[str] = None
    airlines: List[str] = []
    route: list = []
    deep_link: Optional[str] = None
    is_hacked_route: bool = False
    carbon_emissions: Optional[dict] = None

@app.get("/api/saved-flights")
def api_get_saved_flights(user_id: str = Query(...)):
    try:
        flights = get_saved_flights(user_id)
        return {"flights": flights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/saved-flights")
def api_save_flight(data: SavedFlightData):
    try:
        result = add_saved_flight(data.model_dump())
        return {"success": True, "flight": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/saved-flights/{flight_id}")
def api_remove_saved_flight(flight_id: str, user_id: str = Query(...)):
    try:
        remove_saved_flight(user_id, flight_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)