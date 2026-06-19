'use client';

import { useState, useMemo, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import FlightCard from '@/components/FlightCard';
import FlightCardSkeleton from '@/components/FlightCardSkeleton';
import VpnAdvice from '@/components/VpnAdvice';
import PriceComparison from '@/components/PriceComparison';
import PriceCalendar from '@/components/PriceCalendar';
import Filters from '@/components/Filters';
import SavedSearches, { useSaveSearch } from '@/components/SavedSearches';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [vpnAdvice, setVpnAdvice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnywhere, setIsAnywhere] = useState(false);
  const [lastSearch, setLastSearch] = useState<any>(null);
  const [filters, setFilters] = useState({ maxPrice: 0, stops: 'all', airline: 'all', sort: 'price' });
  const saveSearch = useSaveSearch();

  const handleSearch = useCallback(async (searchParams: any) => {
    setLoading(true);
    setError(null);
    setLastSearch(searchParams);
    try {
      const cleaned: Record<string, string> = {};
      for (const [key, val] of Object.entries(searchParams)) {
        if (val !== undefined && val !== '' && val !== null) {
          cleaned[key] = String(val);
        }
      }
      const query = new URLSearchParams(cleaned).toString();
      const res = await fetch(`http://localhost:8000/api/search?${query}`);
      
      if (!res.ok) throw new Error("Failed to fetch flights");
      
      const data = await res.json();
      setResults(data.results);
      setVpnAdvice(data.vpn_recommendation);
      setIsAnywhere(data.is_anywhere || false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and sorting
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    if (filters.stops !== 'all') {
      const maxStops = parseInt(filters.stops);
      filtered = filtered.filter((r: any) => {
        const stops = r.route.length - 1;
        return filters.stops === '2' ? stops >= 2 : stops === maxStops;
      });
    }

    if (filters.airline !== 'all') {
      filtered = filtered.filter((r: any) =>
        r.airlines.some((a: string) => a.toLowerCase().includes(filters.airline.toLowerCase()))
      );
    }

    if (filters.maxPrice > 0) {
      filtered = filtered.filter((r: any) => r.price <= filters.maxPrice);
    }

    switch (filters.sort) {
      case 'price': filtered.sort((a: any, b: any) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a: any, b: any) => b.price - a.price); break;
      case 'duration': filtered.sort((a: any, b: any) => parseInt(a.duration) - parseInt(b.duration)); break;
      case 'stops': filtered.sort((a: any, b: any) => a.route.length - b.route.length); break;
    }

    return filtered;
  }, [results, filters]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50 selection:text-blue-900 dark:selection:text-blue-200 transition-colors duration-300">
      {/* Top Gradient Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-5 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-2">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Flight<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Hack</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            {isAnywhere 
              ? 'Discover the cheapest destinations from your airport' 
              : 'Unlock hidden savings with multi-leg routing and price tricks.'}
          </p>
        </header>

        {/* Search Component */}
        <section className="bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
            <SearchForm onSearch={handleSearch} loading={loading} />
          </div>
        </section>

        {/* Error Handling */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-xl text-center font-medium shadow-sm flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
            </div>
            {[1, 2, 3].map((i) => <FlightCardSkeleton key={i} />)}
          </div>
        )}

        {/* Results Area */}
        {!loading && results.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* VPN Advice Banner */}
            {vpnAdvice && <VpnAdvice advice={vpnAdvice} />}

            {/* Price Comparison */}
            {!isAnywhere && <PriceComparison results={results} />}

            {/* Price Calendar */}
            {!isAnywhere && lastSearch && (
              <PriceCalendar 
                origin={lastSearch.origin} 
                destination={lastSearch.destination} 
                baseDate={lastSearch.date_from} 
              />
            )}

            {/* Flight List with Filters */}
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isAnywhere ? '🌍 Cheapest Destinations' : 'Recommended Routes'}
                </h2>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-2">
                  {filteredResults.length} of {results.length} results
                  {lastSearch && (
                    <button
                      onClick={() => saveSearch(lastSearch.origin, lastSearch.destination, lastSearch.date_from, lastSearch.date_to)}
                      className="text-slate-400 hover:text-blue-500 transition-colors"
                      title="Save this search"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  )}
                </span>
              </div>

              {/* Filters Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <Filters results={results} filters={filters} setFilters={setFilters} />
              </div>
              
              <div className="grid gap-5">
                {filteredResults.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </div>

              {filteredResults.length === 0 && (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  No flights match your filters. Try adjusting them.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Saved Searches floating button */}
      <SavedSearches onSearch={handleSearch} />
    </main>
  );
}