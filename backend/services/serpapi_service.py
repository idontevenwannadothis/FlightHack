import os
import httpx
import urllib.parse
import asyncio
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "your_serpapi_key_here")
SERPAPI_URL = "https://serpapi.com/search.json"

# Popular destinations for "Anywhere" mode
ANYWHERE_DESTINATIONS = [
    "TIA", "BGY", "STN", "BCN", "MAD", "LIS", "OPO", "PRG", "BUD", "KRK",
    "WAW", "ATH", "SKG", "SOF", "OTP", "IST", "SAW", "DBV", "SPU", "ZAG",
    "VCE", "NAP", "CTA", "PMO", "BLQ", "AMS", "BRU", "CRL", "DUB", "EDI",
    "MAN", "CPH", "ARN", "OSL", "HEL", "ZRH", "GVA", "KEF", "TFS", "AGP"
]

# Limit concurrent requests to avoid rate limiting
CONCURRENCY_LIMIT = 5

def format_date(date_str: str) -> str:
    """Convert DD/MM/YYYY to YYYY-MM-DD"""
    try:
        dt = datetime.strptime(date_str, "%d/%m/%Y")
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        return date_str

async def fetch_single_route(client: httpx.AsyncClient, fly_from: str, fly_to: str, date_from: str, date_to: str = None):
    """Fetch and format flights for a single origin-destination pair"""
    formatted_date_from = format_date(date_from)
    
    params = {
        "engine": "google_flights",
        "departure_id": fly_from,
        "arrival_id": fly_to,
        "outbound_date": formatted_date_from,
        "type": "2",
        "currency": "EUR",
        "hl": "en",
        "api_key": SERPAPI_API_KEY
    }
    
    if date_to:
        params["type"] = "1"
        params["return_date"] = format_date(date_to)
    
    try:
        response = await client.get(SERPAPI_URL, params=params)
        if response.status_code != 200:
            return []
        
        data = response.json()
        flights_data = data.get("best_flights", []) + data.get("other_flights", [])
        
        formatted = []
        for index, flight in enumerate(flights_data):
            if "price" not in flight:
                continue
            
            legs = flight.get("flights", [])
            route = []
            airlines = []
            
            for leg in legs:
                airline_name = leg.get("airline", "Unknown")
                airlines.append(airline_name)
                route.append({
                    "flyFrom": leg.get("departure_airport", {}).get("id", fly_from),
                    "flyTo": leg.get("arrival_airport", {}).get("id", fly_to),
                    "airline": airline_name,
                    "flight_number": leg.get("flight_number", ""),
                    "departure_time": leg.get("departure_airport", {}).get("time", "Unknown"),
                    "arrival_time": leg.get("arrival_airport", {}).get("time", "Unknown"),
                    "duration": leg.get("duration", 0),
                    "airplane": leg.get("airplane", ""),
                    "travel_class": leg.get("travel_class", "")
                })
            
            unique_airlines = list(set(airlines))
            is_hack = len(unique_airlines) > 1 or len(legs) > 1
            
            q = f"Flights to {fly_to} from {fly_from} on {formatted_date_from}"
            if date_to:
                q += f" return on {format_date(date_to)}"
            
            formatted.append({
                "id": f"{fly_to}_{index}",
                "price": flight.get("price", 0),
                "currency": "EUR",
                "duration": str(flight.get("total_duration", "0")) + "m",
                "airlines": unique_airlines,
                "is_hacked_route": is_hack,
                "route": route,
                "carbon_emissions": flight.get("carbon_emissions"),
                "deep_link": f"https://www.google.com/travel/flights?q={urllib.parse.quote(q)}&curr=EUR"
            })
        
        return formatted
    except Exception as e:
        print(f"Error fetching {fly_from}->{fly_to}: {e}")
        return []

async def search_flights(fly_from: str, fly_to: str, date_from: str, date_to: str = None, passengers: int = 1):
    """
    Search flights. If fly_to is empty/'ANY', runs "Anywhere" mode
    querying popular destinations in parallel.
    """
    is_anywhere = not fly_to or fly_to.upper() == "ANY"
    
    if is_anywhere:
        return await search_anywhere(fly_from, date_from, date_to, passengers)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        return await fetch_single_route(client, fly_from, fly_to, date_from, date_to)

async def search_anywhere(fly_from: str, date_from: str, date_to: str = None, passengers: int = 1):
    """
    Query top destinations in parallel, return cheapest results globally.
    Uses a semaphore to avoid hitting SerpApi rate limits.
    """
    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
    
    async def rate_limited_fetch(client, dest):
        async with semaphore:
            return await fetch_single_route(client, fly_from, dest, date_from, date_to)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = [
            rate_limited_fetch(client, dest)
            for dest in ANYWHERE_DESTINATIONS
            if dest != fly_from.upper()
        ]
        
        all_results = await asyncio.gather(*tasks)
    
    # Flatten and sort by price
    merged = []
    for route_results in all_results:
        merged.extend(route_results)
    
    merged.sort(key=lambda x: x["price"])
    
    return merged[:30]  # Return top 30 cheapest