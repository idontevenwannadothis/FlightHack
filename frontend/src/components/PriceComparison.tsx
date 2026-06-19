'use client';

import { formatAirportDisplay } from '@/lib/airportLookup';

export default function PriceComparison({ results }: { results: any[] }) {
  if (results.length < 2) return null;

  // Find cheapest direct and cheapest hacked
  const direct = [...results].filter(r => !r.is_hacked_route).sort((a, b) => a.price - b.price)[0];
  const hacked = [...results].filter(r => r.is_hacked_route).sort((a, b) => a.price - b.price)[0];

  if (!direct || !hacked) return null;

  const savings = direct.price - hacked.price;
  const savingsPercent = Math.round((savings / direct.price) * 100);
  const isWorthIt = savingsPercent > 10;

  if (!isWorthIt) return null;

  const formatDuration = (d: string) => {
    const mins = parseInt(d) || 0;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">Price Comparison</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Flight */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Direct Route</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">€{direct.price}</span>
            <span className="text-sm text-slate-500">{direct.airlines[0]}</span>
          </div>
          <div className="text-xs text-slate-400">
            <span className="font-medium">{direct.route[0].flyFrom}</span> <span className="text-slate-500">({formatAirportDisplay(direct.route[0].flyFrom)})</span> → <span className="font-medium">{direct.route[direct.route.length - 1].flyTo}</span> <span className="text-slate-500">({formatAirportDisplay(direct.route[direct.route.length - 1].flyTo)})</span> · {formatDuration(direct.duration)}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center text-2xl text-amber-300 dark:text-amber-600 font-bold">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* Hacked Flight */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
            Save {savingsPercent}%
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
            Hack Route · €{savings} cheaper
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">€{hacked.price}</span>
            <span className="text-sm text-emerald-600">{hacked.airlines.join(' + ')}</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">
            {hacked.route.map((l: any) => l.flyFrom).join(' → ')} → {hacked.route[hacked.route.length - 1].flyTo} · {formatDuration(hacked.duration)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-500 dark:text-emerald-500">
            {hacked.route.length - 1} stop{hacked.route.length > 2 ? 's' : ''} via {formatAirportDisplay(hacked.route[0].flyTo !== hacked.route[hacked.route.length - 1].flyTo ? hacked.route[0].flyTo : hacked.route[1]?.flyFrom)}
          </div>
        </div>
      </div>
    </div>
  );
}