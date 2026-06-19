import { popularAirports } from '@/lib/airports';

const airportMap = new Map(popularAirports.map(a => [a.code, a]));

export function getAirportInfo(code: string) {
  return airportMap.get(code.toUpperCase());
}

export function formatAirportDisplay(code: string) {
  const info = getAirportInfo(code);
  if (!info) return code;
  return `${info.city}, ${info.country}`;
}