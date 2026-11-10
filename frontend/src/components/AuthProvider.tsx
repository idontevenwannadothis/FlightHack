'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getSupabase, getCurrentUserId, signInWithGoogle, signOut } from '@/lib/supabase';
import { getSavedFlights, saveFlight } from '@/lib/savedFlights';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const AUTH_USER_KEY = 'flighthack_auth_user_id';

interface AuthContextType {
  userId: string | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  isSupabaseConfigured: false,
});

async function migrateAnonymousSaves() {
  const pending = localStorage.getItem('flighthack_pending_migration');
  if (!pending) return;

  // Get anonymous saves and push them to backend under the new auth ID
  const anonSaves = await getSavedFlights();
  for (const flight of anonSaves) {
    await saveFlight(flight);
  }
  localStorage.removeItem('flighthack_pending_migration');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasMigrated = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    getCurrentUserId().then((uid) => {
      if (uid) {
        localStorage.setItem(AUTH_USER_KEY, uid);
        setUserId(uid);
        // Migrate on initial load if just logged in
        if (!hasMigrated.current) {
          hasMigrated.current = true;
          migrateAnonymousSaves();
        }
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
        setUserId(null);
      }
      setLoading(false);
    });

    const sb = getSupabase();
    if (!sb) return;

    const { data: { subscription } } = sb.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      const uid = session?.user?.id ?? null;
      if (uid) {
        localStorage.setItem(AUTH_USER_KEY, uid);
        setUserId(uid);
        // Migrate on sign in
        if (event === 'SIGNED_IN' && !hasMigrated.current) {
          hasMigrated.current = true;
          migrateAnonymousSaves();
        }
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
        setUserId(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [isSupabaseConfigured]);

  return (
    <AuthContext.Provider value={{ userId, loading, signIn: signInWithGoogle, signOut, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);