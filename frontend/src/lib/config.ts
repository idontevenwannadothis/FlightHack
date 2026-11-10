// Backend API base URL.
// Set NEXT_PUBLIC_API_URL in frontend/.env.local (or Vercel env vars) for production,
// e.g. NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
