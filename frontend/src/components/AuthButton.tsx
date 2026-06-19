'use client';

import { useAuth } from './AuthProvider';
import { useState } from 'react';

export default function AuthButton() {
  const { userId, loading, signIn, signOut, isSupabaseConfigured } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [migrating, setMigrating] = useState(false);

  if (!isSupabaseConfigured) return null;

  const handleSignIn = () => {
    // Before sign in, store anonymous saves so we can migrate them later
    localStorage.setItem('flighthack_pending_migration', 'true');
    signIn();
  };

  if (loading) {
    return (
      <div className="fixed top-4 left-4 z-50 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      {userId ? (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute top-12 left-0 z-50 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Synced to cloud
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Your saves persist across devices</p>
                </div>
                <button
                  onClick={() => { signOut(); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:border-blue-300 dark:hover:border-blue-600"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      )}
    </div>
  );
}