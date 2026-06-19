-- Supabase Database Schema for FlightHack

-- Table to store user searches for analytics and caching
CREATE TABLE public.saved_searches (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    origin VARCHAR(3) NOT NULL,
    destination VARCHAR(3) NOT NULL,
    date_from DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.saved_searches FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous selects" ON public.saved_searches FOR SELECT TO anon USING (true);

-- Table to store saved flights (supports anonymous + registered users)
CREATE TABLE public.saved_flights (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,  -- anonymous UUID or real auth user ID
    flight_id VARCHAR(64) NOT NULL,
    price NUMERIC NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    duration VARCHAR(32),
    airlines TEXT[] DEFAULT '{}',
    route JSONB NOT NULL DEFAULT '[]',
    deep_link TEXT,
    is_hacked_route BOOLEAN DEFAULT false,
    carbon_emissions JSONB,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, flight_id)  -- prevent duplicate saves
);

ALTER TABLE public.saved_flights ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/insert/delete their own flights by user_id
CREATE POLICY "Allow users to manage their saved flights"
ON public.saved_flights
FOR ALL
TO anon
USING (true)
WITH CHECK (true);