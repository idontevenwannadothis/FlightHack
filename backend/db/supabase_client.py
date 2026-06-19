import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

def save_search(origin: str, destination: str, date_from: str):
    if not supabase:
        print("Skipping DB save: Supabase credentials not configured.")
        return
    try:
        data = {"origin": origin, "destination": destination, "date_from": date_from}
        supabase.table("saved_searches").insert(data).execute()
    except Exception as e:
        print(f"Failed to save search to DB: {e}")

# ---- Saved Flights CRUD ----

def get_saved_flights(user_id: str):
    if not supabase:
        return []
    try:
        result = supabase.table("saved_flights").select("*").eq("user_id", user_id).order("saved_at", desc=True).execute()
        return result.data
    except Exception as e:
        print(f"Failed to get saved flights: {e}")
        return []

def add_saved_flight(data: dict):
    if not supabase:
        return None
    try:
        result = supabase.table("saved_flights").upsert(data, on_conflict="user_id,flight_id").execute()
        return result.data
    except Exception as e:
        print(f"Failed to save flight: {e}")
        return None

def remove_saved_flight(user_id: str, flight_id: str):
    if not supabase:
        return
    try:
        supabase.table("saved_flights").delete().eq("user_id", user_id).eq("flight_id", flight_id).execute()
    except Exception as e:
        print(f"Failed to remove saved flight: {e}")