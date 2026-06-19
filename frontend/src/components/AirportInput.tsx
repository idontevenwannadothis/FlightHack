'use client';
import { useState, useRef, useEffect } from 'react';
import { popularAirports } from '@/lib/airports';

interface AirportInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  iconColorClass: string;
  svgIcon: React.ReactNode;
}

export default function AirportInput({ label, value, onChange, placeholder, iconColorClass, svgIcon }: AirportInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter airports based on input value
  const filteredAirports = popularAirports.filter(airport => {
    const searchTerm = value.toLowerCase();
    return (
      airport.code.toLowerCase().includes(searchTerm) ||
      airport.city.toLowerCase().includes(searchTerm) ||
      airport.name.toLowerCase().includes(searchTerm) ||
      airport.country.toLowerCase().includes(searchTerm)
    );
  }).slice(0, 6); // Keep it to top 6 results to not overwhelm UI

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex-1 w-full group relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
      
      <div className="relative">
        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:${iconColorClass} transition-colors`}>
          {svgIcon}
        </div>
        <input 
          type="text" 
          value={value}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-${iconColorClass.split('-')[1]}-500/20 focus:border-${iconColorClass.split('-')[1]}-500 dark:focus:border-${iconColorClass.split('-')[1]}-400 focus:outline-none transition-all shadow-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 uppercase`}
          placeholder={placeholder}
          required
          autoComplete="off"
        />
      </div>

      {/* Dropdown Predictions */}
      {isOpen && value.length >= 1 && filteredAirports.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <ul className="max-h-60 overflow-y-auto">
            {filteredAirports.map((airport, idx) => (
              <li 
                key={`${airport.code}-${idx}`}
                onClick={() => {
                  onChange(airport.code);
                  setIsOpen(false);
                }}
                className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex items-center justify-between transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {airport.city} <span className="text-slate-400 dark:text-slate-500 font-normal">({airport.country})</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{airport.name}</span>
                </div>
                <span className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded">
                  {airport.code}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}