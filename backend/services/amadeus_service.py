import os
import httpx
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

AMADEUS_CLIENT_ID = os.getenv("AMADEUS_CLIENT_ID", "your_amadeus_api_key_here")
AMADEUS_CLIENT_SECRET = os.getenv("AMADEUS_CLIENT_SECRET", "your_amadeus_api_secret_here")

# Use the test environment for free API calls
AMADEUS_AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"
AMADEUS_SEARCH_URL = "https://test.api.amadeus.com/v2/shopping/flight-offers"

async def get_amadeus_token():
    async with httpx.AsyncClient() as client:
        data = {
            "grant_type": "client_credentials",
            "client_id": AMADEUS_CLIENT_ID,
            "client_secret": AMADEUS_CLIENT_SECRET
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        response = await client.post(AMADEUS_AUTH_URL, data=data, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to authenticate with Amadeus: {response.text}")
            
        return response.json().get("access_token")

async def search_flights(fly_from: str, fly_to: str, date_from: str, date_to: str = None, passengers: int = 1):
    """
    Calls Amadeus Flight Offers Search API.
    """
    # If the user hasn't put in a real key yet, return the mock data to prevent crashes
    if AMADEUS_CLIENT_ID == "your_amadeus_api_key_here":
        print("WARNING: Using mock flight data because AMADEUS_CLIENT_ID is not set.")
        from services.kiwi_service import get_mock_flight_data
        return get_mock_flight_data(fly_from, fly_to)

    token = await get_amadeus_token()
    
    # Amadeus requires YYYY-MM-DD format, but our frontend currently sends DD/MM/YYYY (because Kiwi wanted it)
    # Let's convert it back to YYYY-MM-DD
    try:
        dt = datetime.strptime(date_from, "%d/%m/%Y")
        formatted_date = dt.strftime("%Y-%m-%d")
    except ValueError:
        formatted_date = date_from # Fallback if already correct

    params = {
        "originLocationCode": fly_from,
        "destinationLocationCode": fly_to,
        "departureDate": formatted_date,
        "adults": passengers,
        "currencyCode": "EUR",
        "max": 15
    }
    
    if date_to:
        try:
            dt_return = datetime.strptime(date_to, "%d/%m/%Y")
            params["returnDate"] = dt_return.strftime("%Y-%m-%d")
        except ValueError:
            pass
        
    headers = {
        "Authorization": f"Bearer {token}"
    }
        
    async with httpx.AsyncClient() as client:
        response = await client.get(AMADEUS_SEARCH_URL, headers=headers, params=params)
        
        if response.status_code != 200:
            raise Exception(f"Amadeus API Error: {response.text}")
            
        data = response.json()
        dictionaries = data.get("dictionaries", {})
        carriers = dictionaries.get("carriers", {})
        
        formatted_results = []
        for offer in data.get("data", []):
            price = offer.get("price", {}).get("total", "0")
            currency = offer.get("price", {}).get("currency", "EUR")
            
            # For simplicity, we just parse the outbound journey (first itinerary)
            itinerary = offer.get("itineraries", [])[0]
            segments = itinerary.get("segments", [])
            
            # Map segment data
            route = []
            airline_codes = set()
            
            for seg in segments:
                airline_code = seg.get("carrierCode")
                airline_codes.add(airline_code)
                airline_name = carriers.get(airline_code, airline_code)
                
                route.append({
                    "flyFrom": seg.get("departure", {}).get("iataCode"),
                    "flyTo": seg.get("arrival", {}).get("iataCode"),
                    "airline": airline_name,
                    "departure_time": seg.get("departure", {}).get("at"),
                    "arrival_time": seg.get("arrival", {}).get("at")
                })
            
            # Determine if this is a "hacked" route (multiple non-allied airlines, or just > 1 stop for our prototype)
            is_hack = len(airline_codes) > 1 or len(segments) > 1
            
            # Calculate total duration from Amadeus ISO 8601 duration (e.g. PT14H15M)
            raw_duration = itinerary.get("duration", "PT0H0M")
            clean_duration = raw_duration.replace("PT", "").lower()
            
            formatted_results.append({
                "id": offer.get("id"),
                "price": price,
                "currency": currency,
                "duration": clean_duration,
                "airlines": [carriers.get(code, code) for code in airline_codes],
                "is_hacked_route": is_hack,
                "route": route,
                "deep_link": "#" # Amadeus Flight Offers Search doesn't return a direct booking link natively
            })
            
        return formatted_results