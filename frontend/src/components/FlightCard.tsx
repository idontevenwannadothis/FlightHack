import { formatAirportDisplay } from '@/lib/airportLookup';
import { useState, useEffect } from 'react';
import RouteMap from './RouteMap';
import { saveFlight, removeFlight, isFlightSaved } from '@/lib/savedFlights';

function CarbonBadge({ emissions }: { emissions: any }) {
  if (!emissions) return null;
  const thisFlight = emissions.this_flight;
  const typical = emissions.typical_for_this_route;
  const diff = emissions.difference_percent;
  const isLower = diff < 0;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
      isLower 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
    }`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      {Math.round(thisFlight / 1000)}kg CO₂
      {isLower && <span className="opacity-70">· {Math.abs(diff)}% less</span>}
    </div>
  );
}

export default function FlightCard({ flight }: { flight: any }) {
    const isHack = flight.is_hacked_route;
    const [showMap, setShowMap] = useState(false);
    const [saved, setSaved] = useState(false);
    const stops = flight.route.length - 1;

    useEffect(() => {
      setSaved(isFlightSaved(flight.id));
    }, [flight.id]);

    const toggleSave = async () => {
      if (saved) {
        await removeFlight(flight.id);
        setSaved(false);
      } else {
        await saveFlight(flight);
        setSaved(true);
      }
    };
  
    return (
      <div className={`border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-white dark:bg-slate-900 ${isHack ? 'border-green-400/50 dark:border-green-500/50 shadow-green-100/50 dark:shadow-green-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
        
        {/* Hack Badge */}
        {isHack && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center shadow-sm">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Middle-Dest Hack
          </div>
        )}
  
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="flex-1 w-full space-y-5">
            {/* Main Header / Airlines */}
            <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-2 border-white dark:border-slate-900 z-10">✈️</div>
                {flight.airlines.length > 1 && <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center border-2 border-white dark:border-slate-900 z-0 text-[10px]">🔄</div>}
              </div>
              <span>{flight.airlines.join(', ')}</span>
              {isHack && <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs border border-emerald-100 dark:border-emerald-800/50">Virtual Interlining</span>}
              <CarbonBadge emissions={flight.carbon_emissions} />
            </div>
            
            {/* Visual Route Representation */}
            <div className="relative flex items-center justify-between mt-2">
                <div className="text-center min-w-[80px]">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{flight.route[0].flyFrom}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{formatAirportDisplay(flight.route[0].flyFrom)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {flight.route[0].departure_time.includes('T') ? new Date(flight.route[0].departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : flight.route[0].departure_time}
                    </p>
                </div>

                <div className="flex-1 mx-3 relative flex items-center justify-center">
                    {/* Dashed Line */}
                    <div className="absolute w-full border-t-2 border-dashed border-slate-300 dark:border-slate-700 top-1/2 -translate-y-1/2"></div>
                    
                    {/* Flight Duration & Stops */}
                    <div className="relative bg-white dark:bg-slate-900 px-3 text-center -mt-4 transition-colors">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {flight.duration.replace("m", " min").replace("60 min", "1h ")}
                        </p>
                        <p className={`text-[11px] font-bold mt-0.5 ${stops === 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>
                            {stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                <div className="text-center min-w-[80px]">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{flight.route[flight.route.length - 1].flyTo}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{formatAirportDisplay(flight.route[flight.route.length - 1].flyTo)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {flight.route[flight.route.length - 1].arrival_time.includes('T') ? new Date(flight.route[flight.route.length - 1].arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : flight.route[flight.route.length - 1].arrival_time}
                    </p>
                </div>
            </div>

            {/* Individual Legs Breakdown (if stops > 0) */}
            {stops > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {flight.route.map((leg: any, idx: number) => (
                    <div key={idx} className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <div className="flex-1 flex items-center justify-between font-medium">
                        <span className="text-slate-800 dark:text-slate-200 flex flex-col items-start">
                          {leg.flyFrom}
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{formatAirportDisplay(leg.flyFrom)}</span>
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 mx-1 text-[10px]">
                          ({leg.departure_time.includes('T') ? new Date(leg.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : leg.departure_time})
                        </span>
                        <svg className="w-3 h-3 text-slate-300 dark:text-slate-600 mx-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="text-slate-400 dark:text-slate-500 mx-1 text-[10px]">
                          ({leg.arrival_time.includes('T') ? new Date(leg.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : leg.arrival_time})
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 flex flex-col items-end">
                          {leg.flyTo}
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{formatAirportDisplay(leg.flyTo)}</span>
                        </span>
                    </div>
                    <span className="ml-4 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400 dark:text-slate-500 whitespace-nowrap">{leg.airline}</span>
                    </div>
                ))}
                </div>
            )}
          </div>
  
          {/* Price and CTA */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-0 md:space-y-4">
             <div className="flex items-center md:items-end gap-3">
              <button
                onClick={toggleSave}
                className={`transition-colors p-1.5 rounded-lg ${saved ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
                title={saved ? 'Unsave flight' : 'Save flight'}
              >
                <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <div className="text-left md:text-right">
                 <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-1">Total Price</p>
                 <div className="flex items-baseline space-x-1">
                     <span className="text-3xl font-extrabold text-slate-900 dark:text-white">€{flight.price}</span>
                 </div>
              </div>
             </div>
             
             <a 
               href={flight.deep_link} 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
             >
               Select
             </a>
          </div>
  
        </div>

        {/* Route Map Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showMap ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {showMap ? 'Hide route map' : 'Show route map'}
          </button>

          {showMap && (
            <div className="mt-3">
              <RouteMap route={flight.route} />
            </div>
          )}
        </div>
      </div>
    );
  }