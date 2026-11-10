'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/config';

function addDays(dateStr: string, days: number) {
  const [d, m, y] = dateStr.split('/').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
}

function formatDateShort(dateStr: string) {
  const [d, m, y] = dateStr.split('/').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]}`;
}

export default function PriceCalendar({ 
  origin, 
  destination, 
  baseDate 
}: { 
  origin: string; 
  destination: string; 
  baseDate: string;
}) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const days = [-3, -2, -1, 0, 1, 2, 3];

  const fetchCalendar = async () => {
    setExpanded(true);
    setLoading(true);
    const results: Record<string, number> = {};

    // Fetch in parallel but limited concurrency
    const batchSize = 3;
    for (let i = 0; i < days.length; i += batchSize) {
      const batch = days.slice(i, i + batchSize);
      const promises = batch.map(async (offset) => {
        const date = addDays(baseDate, offset);
        try {
          const res = await fetch(
            `${API_URL}/api/search?origin=${origin}&destination=${destination}&date_from=${encodeURIComponent(date)}`
          );
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const cheapest = data.results.sort((a: any, b: any) => a.price - b.price)[0];
            results[date] = cheapest.price;
          }
        } catch {}
      });
      await Promise.all(promises);
      setPrices({ ...results });
    }
    setLoading(false);
  };

  const minPrice = Math.min(...Object.values(prices).filter(Boolean));
  const maxPrice = Math.max(...Object.values(prices).filter(Boolean));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={fetchCalendar}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {expanded ? 'Price Calendar' : 'Check nearby dates for better prices'}
        </span>
        {!expanded && (
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-4">
          {loading && (
            <div className="flex gap-2">
              {days.map((_, i) => (
                <div key={i} className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          )}

          {!loading && Object.keys(prices).length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((offset) => {
                const date = addDays(baseDate, offset);
                const price = prices[date];
                const isBase = offset === 0;
                const pct = maxPrice > minPrice ? (price - minPrice) / (maxPrice - minPrice) : 0;

                return (
                  <div
                    key={date}
                    className={`flex-1 min-w-[72px] rounded-lg p-2 text-center transition-all border ${
                      isBase
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                        : price
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                        : 'border-slate-100 dark:border-slate-800 opacity-40'
                    }`}
                  >
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {formatDateShort(date)}
                    </div>
                    {price ? (
                      <div className={`text-sm font-bold ${isBase ? 'text-blue-600 dark:text-blue-400' : price === minPrice ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        €{price}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400">—</div>
                    )}
                    {isBase && <div className="text-[8px] text-blue-500 font-semibold mt-0.5">SELECTED</div>}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && Object.keys(prices).length > 0 && minPrice > 0 && (
            <div className="mt-2 text-[11px] text-slate-400 text-center">
              Best price: <span className="font-semibold text-emerald-600 dark:text-emerald-400">€{minPrice}</span> · 
              Save up to <span className="font-semibold">€{maxPrice - minPrice}</span> by choosing the right day
            </div>
          )}
        </div>
      )}
    </div>
  );
}