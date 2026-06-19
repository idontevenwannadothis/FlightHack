'use client';

export default function Filters({ results, filters, setFilters }: {
  results: any[],
  filters: { maxPrice: number; stops: string; airline: string; sort: string },
  setFilters: (f: any) => void
}) {
  // Extract all unique airlines from results
  const allAirlines = [...new Set(results.flatMap((r: any) => r.airlines))].sort();

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sort</label>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        >
          <option value="price">Price (Low)</option>
          <option value="price_desc">Price (High)</option>
          <option value="duration">Duration (Short)</option>
          <option value="stops">Stops (Least)</option>
        </select>
      </div>

      {/* Stops Filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Stops</label>
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {[
            { value: 'all', label: 'All' },
            { value: '0', label: 'Direct' },
            { value: '1', label: '1 Stop' },
            { value: '2', label: '2+' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters({ ...filters, stops: opt.value })}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.stops === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Airline Filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Airline</label>
        <select
          value={filters.airline}
          onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[160px] truncate focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        >
          <option value="all">All Airlines</option>
          {allAirlines.map((airline: any) => (
            <option key={airline} value={airline}>{airline}</option>
          ))}
        </select>
      </div>

      {/* Max Price */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Max €</label>
        <input
          type="number"
          value={filters.maxPrice || ''}
          onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 0 })}
          placeholder="Any"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 w-20 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
      </div>
    </div>
  );
}