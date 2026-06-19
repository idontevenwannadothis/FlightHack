import os
import httpx
from dotenv import load_dotenv

load_dotenv()

KIWI_API_KEY = os.getenv("KIWI_API_KEY", "your_tequila_api_key_here")
KIWI_URL = "https://api.tequila.kiwi.com/v2/search"

async def search_flights(fly_from: str, fly_to: str, date_from: str, date_to: str = None, passengers: int = 1):
    """
    Calls Kiwi.com Tequila API.
    Kiwi is highly advantageous here because it natively supports 'virtual interlining'.
    It pieces together flights from carriers that don't officially partner (e.g., Ryanair + EasyJet),
    essentially acting as our 'Middle Destination' algorithm out-of-the-box.
    """
    headers = {
        "apikey": KIWI_API_KEY
    }
    
    # We query for both direct and max 2 stops to capture the "middle destination" cheaper flights
    params = {
        "fly_from": fly_from,
        "fly_to": fly_to,
        "date_from": date_from,
        "adults": passengers,
        "curr": "EUR", # Standardizing on EUR for price comparison
        "sort": "price",
        "limit": 20,
        "max_stopovers": 2 # Crucial for finding those middle-hub layovers
    }
    
    if date_to:
        params["date_to"] = date_to
        params["flight_type"] = "round"
    else:
        params["flight_type"] = "oneway"
        
    # Provide Mock Data if API key is not yet configured
    if KIWI_API_KEY == "your_tequila_api_key_here":
        print("WARNING: Using mock flight data because KIWI_API_KEY is not set.")
        return get_mock_flight_data(fly_from, fly_to)

    async with httpx.AsyncClient() as client:
        response = await client.get(KIWI_URL, headers=headers, params=params)
        
        if response.status_code != 200:
            raise Exception(f"Kiwi API Error: {response.text}")
            
        data = response.json()
        
        # Process and format the results to send back to the frontend
        formatted_results = []
        for flight in data.get("data", []):
            route = flight.get("route", [])
            is_virtual_interlined = flight.get("virtual_interlining", False)
            
            # Determine if this is a "Middle Destination" hack
            # E.g., multiple legs not operated by the same alliance/airline
            is_hack = is_virtual_interlined or len(route) > 1
            
            formatted_results.append({
                "id": flight.get("id"),
                "price": flight.get("price"),
                "currency": flight.get("currency", "EUR"),
                "duration": flight.get("fly_duration"),
                "airlines": list(set([leg.get("airline") for leg in route])),
                "is_hacked_route": is_hack,
                "route": [
                    {
                        "flyFrom": leg.get("flyFrom"),
                        "flyTo": leg.get("flyTo"),
                        "airline": leg.get("airline"),
                        "departure_time": leg.get("local_departure"),
                        "arrival_time": leg.get("local_arrival")
                    } for leg in route
                ],
                "deep_link": flight.get("deep_link")
            })
            
        return formatted_results

def get_mock_flight_data(origin: str, dest: str):
    """Returns sample data for testing the UI without burning API credits."""
    return [
        {
            "id": "mock_1",
            "price": 145,
            "currency": "EUR",
            "duration": "6h 20m",
            "airlines": ["Ryanair", "Wizz Air"],
            "is_hacked_route": True,
            "route": [
                {
                    "flyFrom": origin,
                    "flyTo": "TIA",
                    "airline": "Ryanair",
                    "departure_time": "2026-07-15T08:00:00Z",
                    "arrival_time": "2026-07-15T10:30:00Z"
                },
                {
                    "flyFrom": "TIA",
                    "flyTo": dest,
                    "airline": "Wizz Air",
                    "departure_time": "2026-07-15T14:20:00Z",
                    "arrival_time": "2026-07-15T16:20:00Z"
                }
            ],
            "deep_link": "https://kiwi.com"
        },
        {
            "id": "mock_2",
            "price": 320,
            "currency": "EUR",
            "duration": "2h 15m",
            "airlines": ["British Airways"],
            "is_hacked_route": False,
            "route": [
                {
                    "flyFrom": origin,
                    "flyTo": dest,
                    "airline": "British Airways",
                    "departure_time": "2026-07-15T09:00:00Z",
                    "arrival_time": "2026-07-15T11:15:00Z"
                }
            ],
            "deep_link": "https://kiwi.com"
        }
    ]