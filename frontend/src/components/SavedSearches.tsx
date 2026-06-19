'use client';

import { useState, useEffect } from 'react';
import { getSavedFlights, removeFlight, type SavedFlight } from '@/lib/savedFlights';

interface SavedSearch {
  id: string;
  origin: string;
  destination: string;
  date_from: string;
  date_to?: string;
  created_at: string;
}

export default function SavedSearches({ onSearch }: { onSearch: (params: any) => void }) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [tab, setTab] = useState<'searches' | 'flights'>('flights');

  const loadAll = async () => {
    const stored = localStorage.getItem('flighthack_saved');
    if (stored) {
      try { setSearches(JSON.parse(stored)); } catch {}
    }
    const flights = await getSavedFlights();
    setSavedFlights(flights);
  };

  useEffect(() => {
    if (showMenu) loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMenu]);

  const removeSearch = (id: string) => {
    const updated = searches.filter(s => s.id !== id);
    setSearches(updated);
    localStorage.setItem('flighthack_saved', JSON.stringify(updated));
  };

  const handleRemoveFlight = async (id: string) => {
    await removeFlight(id);
    setSavedFlights(await getSavedFlights());
  };

  const totalItems = searches.length + savedFlights.length;
  const badgeCount = savedFlights.length + searches.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        title="Saved Items"
      >
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {badgeCount}
          </span>
        )}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="fixed bottom-20 right-4 z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Saved Items</h3>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setTab('flights')}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  tab === 'flights'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Flights ({savedFlights.length})
              </button>
              <button
                onClick={() => setTab('searches')}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  tab === 'searches'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Searches ({searches.length})
              </button>
            </div>

            {/* Saved Flights Tab */}
            {tab === 'flights' && (
              <>
                {savedFlights.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    <p>No saved flights yet.</p>
                    <p className="mt-1 text-xs">Click the bookmark icon on any flight to save it.</p>
                  </div>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {savedFlights.map((f) => (
                      <li key={f.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {f.route[0].flyFrom} → {f.route[f.route.length - 1].flyTo}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {f.airlines.join(' + ')} · €{f.price} · {f.is_hacked_route ? 'Hack' : 'Direct'}
                            </div>
                            <div className="text-[10px] text-slate-400">Saved {f.saved_at}</div>
                          </div>
                          <button
                            onClick={() => handleRemoveFlight(f.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {/* Saved Searches Tab */}
            {tab === 'searches' && (
              <>
                {searches.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    <p>No saved searches yet.</p>
                    <p className="mt-1 text-xs">Click the bookmark icon next to results to save a search.</p>
                  </div>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {searches.map((s) => (
                        <li key={s.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div
                          onClick={() => {
                            onSearch({
                              origin: s.origin,
                              destination: s.destination,
                              date_from: s.date_from,
                              date_to: s.date_to || undefined
                            });
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {s.origin} → {s.destination}
                            </span>
                            <span className="text-xs text-slate-400 block mt-0.5">{s.date_from}{s.date_to ? ` → ${s.date_to}` : ''}</span>
                            <span className="text-[10px] text-slate-400">Saved {s.created_at}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSearch(s.id); }}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function useSaveSearch() {
  return (origin: string, destination: string, date_from: string, date_to?: string) => {
    const entry: SavedSearch = {
      id: Date.now().toString(),
      origin,
      destination,
      date_from,
      date_to,
      created_at: new Date().toLocaleDateString()
    };
    const stored = localStorage.getItem('flighthack_saved');
    const saved = stored ? JSON.parse(stored) : [];
    const updated = [entry, ...saved].slice(0, 10);
    localStorage.setItem('flighthack_saved', JSON.stringify(updated));
  };
}