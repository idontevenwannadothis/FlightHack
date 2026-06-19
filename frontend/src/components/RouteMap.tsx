'use client';

import { formatAirportDisplay } from '@/lib/airportLookup';

export default function RouteMap({ route }: { route: any[] }) {
  if (!route || route.length < 2) return null;

  const stops = route.length - 1;
  const segmentWidth = 100 / route.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Route Overview</span>
      </div>

      <div className="relative pt-8 pb-6">
        {/* Connecting line */}
        <div className="absolute top-[52px] left-[8%] right-[8%] h-[2px] bg-slate-200 dark:bg-slate-700">
          {/* Plane icon along the line */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 text-slate-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
        </div>

        {/* Airports */}
        <div className="flex justify-between items-start">
          {route.map((leg: any, idx: number) => {
            const isFirst = idx === 0;
            const isLast = idx === route.length - 1;
            const isMiddle = !isFirst && !isLast;

            return (
              <div key={idx} className="flex flex-col items-center relative" style={{ width: `${segmentWidth}%` }}>
                {/* Airport dot */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 mb-2 ${
                  isFirst || isLast
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-amber-400 border-amber-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-white`} />
                </div>

                {/* Airport info */}
                <div className={`text-center ${isMiddle ? 'text-amber-600 dark:text-amber-400' : 'text-blue-700 dark:text-blue-300'}`}>
                  <div className="text-sm font-bold">{leg.flyFrom || leg.flyTo}</div>
                  <div className="text-[10px] opacity-70 leading-tight max-w-[80px] truncate">
                    {formatAirportDisplay(leg.flyFrom || leg.flyTo)}
                  </div>
                  <div className="text-[10px] font-medium mt-1 opacity-60">
                    {leg.departure_time || leg.arrival_time}
                  </div>
                </div>

                {/* Layer tag for middle airports */}
                {isMiddle && (
                  <div className="mt-2 text-[9px] font-semibold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    LAYOVER
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Flight info strip */}
      <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span>{route.length - 1} stop{stops !== 1 ? 's' : ''}</span>
        <span>{route[0].airline}{route.length > 2 ? ` + ${route[route.length - 1].airline}` : ''}</span>
      </div>
    </div>
  );
}