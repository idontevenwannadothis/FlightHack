# FlightHack Deployment & Setup Guide

## 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Free Accounts on:
  - [SerpApi](https://serpapi.com) (required — Google Flights data)
  - [Supabase](https://supabase.com/) (optional — cross-device saved flight sync)

## 2. Getting API Keys

### SerpApi (Required)
1. Go to https://serpapi.com/users/sign_up and register.
2. Copy your API key from the dashboard.
3. Add it to `backend/.env` as `SERPAPI_API_KEY`.

### Other backend environment variables (optional)
```
# Comma-separated frontend origins allowed to call the API (default: http://localhost:3000)
ALLOWED_ORIGINS=https://your-app.vercel.app
# Response cache TTL in seconds (default: 14400 = 4 hours). Caching identical
# searches avoids burning SerpApi quota on repeats.
CACHE_TTL_SECONDS=14400
```

### Frontend environment variables
The frontend talks to the backend via `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`).
Add to `frontend/.env.local` (and to Vercel environment variables when deploying):
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Supabase (Optional — for cross-device flight sync + Google Auth)
1. Create a new Supabase project at https://supabase.com.
2. Run `docs/supabase_schema.sql` in the **SQL Editor**.
3. **Enable Google Auth:**
   - Go to **Authentication → Providers** in the Supabase dashboard.
   - Click **Google** and enable it.
   - Copy the **Redirect URL** shown (you'll need it in the Google Cloud Console).
   - Create a Google OAuth client ID at https://console.cloud.google.com/apis/credentials (set the redirect URI to the one Supabase gave you).
   - Paste the Client ID and Client Secret back into Supabase's Google provider form.
4. Get your **Project URL** and **anon public key** from **Project Settings → API**.
5. Add them to `backend/.env`:
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   ```
6. Add them to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## 3. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate  |  Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Running the backend tests
```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## 4. Frontend Setup (Next.js)
```bash
cd frontend
npm run dev
```

## 5. How Saved Flights Persistence Works

Flights are saved in **two layers** simultaneously:

| Layer | Scope | Requires |
|-------|-------|----------|
| localStorage | Current browser only | Nothing — works offline |
| Supabase (via backend) | All devices | Supabase keys in `.env` |

**Anonymous user flow:** On first visit, the frontend generates a random UUID and stores it in localStorage. This UUID is sent with all API calls, so Supabase can associate flights with the same anonymous user across sessions (same browser only — clear data = new anonymous identity).

**To enable cross-device sync**, set up Supabase as outlined above. The backend endpoints at `/api/saved-flights` will handle the sync automatically. If Supabase is not configured, saves degrade gracefully to localStorage-only.

## 6. Deployment
### Frontend (Vercel)
1. Push to GitHub, import repo in Vercel.
2. Root Directory: `frontend`.
3. Deploy.

### Backend (Render)
1. Create a new "Web Service" connected to your GitHub repo.
2. Root Directory: `backend`.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add your `SERPAPI_API_KEY` (and optional `SUPABASE_URL` + `SUPABASE_ANON_KEY`) to Environment variables.

## 7. Architecture Notes

### Flight Data
We use **SerpApi** to scrape Google Flights. This gives us access to the best pricing data, including multi-leg "virtual interlining" results. The `type: 2` parameter tells Google Flights it's a one-way search. Round trips use `type: 1` with a `return_date`.

### Anywhere Mode
When the destination is "ANY", the backend queries 40 popular destinations in parallel (limited to 5 concurrent requests to avoid rate limiting) and returns the top 30 cheapest results.

### VPN Price Optimization
The VPN recommendation engine uses a simple rules-based system matching destination regions to suggested VPN server locations for price discrimination.