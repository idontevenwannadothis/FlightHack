const STORAGE_KEY = 'flighthack_saved_flights';
const USER_KEY = 'flighthack_user_id';
const AUTH_USER_KEY = 'flighthack_auth_user_id';

export interface SavedFlight {
  id: string;
  price: number;
  currency: string;
  duration: string;
  airlines: string[];
  route: { flyFrom: string; flyTo: string }[];
  deep_link: string;
  is_hacked_route: boolean;
  carbon_emissions?: any;
  saved_at: string;
}

// ---- Anonymous User ID ----
export function getUserId(): string {
  // If user is authenticated via Supabase, use that ID
  const authId = localStorage.getItem(AUTH_USER_KEY);
  if (authId) return authId;

  // Otherwise use/generate anonymous ID
  let uid = localStorage.getItem(USER_KEY);
  if (!uid) {
    uid = crypto.randomUUID ? crypto.randomUUID() : 'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem(USER_KEY, uid);
  }
  return uid;
}

const API_BASE = 'http://localhost:8000';

// ---- Backend sync helpers (silent fail if Supabase not configured) ----
async function syncSaveToBackend(flight: any): Promise<void> {
  try {
    const user_id = getUserId();
    await fetch(`${API_BASE}/api/saved-flights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        flight_id: flight.id,
        price: flight.price,
        currency: flight.currency || 'EUR',
        duration: flight.duration,
        airlines: flight.airlines,
        route: flight.route.map((l: any) => ({ flyFrom: l.flyFrom, flyTo: l.flyTo })),
        deep_link: flight.deep_link,
        is_hacked_route: flight.is_hacked_route,
        carbon_emissions: flight.carbon_emissions || null
      })
    });
  } catch {}
}

async function syncRemoveFromBackend(flightId: string): Promise<void> {
  try {
    const user_id = getUserId();
    await fetch(`${API_BASE}/api/saved-flights/${flightId}?user_id=${user_id}`, { method: 'DELETE' });
  } catch {}
}

async function syncFetchFromBackend(): Promise<SavedFlight[]> {
  try {
    const user_id = getUserId();
    const res = await fetch(`${API_BASE}/api/saved-flights?user_id=${user_id}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.flights || []).map((f: any) => ({
      id: f.flight_id,
      price: f.price,
      currency: f.currency,
      duration: f.duration || '',
      airlines: f.airlines || [],
      route: f.route || [],
      deep_link: f.deep_link || '',
      is_hacked_route: f.is_hacked_route || false,
      carbon_emissions: f.carbon_emissions,
      saved_at: f.saved_at || new Date().toLocaleDateString()
    }));
  } catch {
    return [];
  }
}

// ---- Local Storage Helpers ----
function getLocalFlights(): SavedFlight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setLocalFlights(flights: SavedFlight[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flights.slice(0, 30)));
}

// ---- Public API ----

export async function getSavedFlights(): Promise<SavedFlight[]> {
  // Get local + backend, merge by ID (backend wins if both exist)
  const local = getLocalFlights();
  const remote = await syncFetchFromBackend();
  
  const mergedMap = new Map<string, SavedFlight>();
  for (const f of local) mergedMap.set(f.id, f);
  for (const f of remote) mergedMap.set(f.id, f);
  
  return Array.from(mergedMap.values()).sort((a, b) => {
    if (a.saved_at < b.saved_at) return 1;
    if (a.saved_at > b.saved_at) return -1;
    return 0;
  });
}

export async function saveFlight(flight: any): Promise<void> {
  const saved = getLocalFlights();
  if (!saved.some(f => f.id === flight.id)) {
    const entry: SavedFlight = {
      id: flight.id,
      price: flight.price,
      currency: flight.currency || 'EUR',
      duration: flight.duration,
      airlines: flight.airlines,
      route: flight.route.map((l: any) => ({ flyFrom: l.flyFrom, flyTo: l.flyTo })),
      deep_link: flight.deep_link,
      is_hacked_route: flight.is_hacked_route,
      carbon_emissions: flight.carbon_emissions,
      saved_at: new Date().toLocaleDateString()
    };
    saved.unshift(entry);
    setLocalFlights(saved);
  }
  // Also sync to backend (fire-and-forget)
  await syncSaveToBackend(flight);
}

export async function removeFlight(id: string): Promise<void> {
  const local = getLocalFlights().filter(f => f.id !== id);
  setLocalFlights(local);
  await syncRemoveFromBackend(id);
}

export function isFlightSaved(id: string): boolean {
  return getLocalFlights().some(f => f.id === id);
}