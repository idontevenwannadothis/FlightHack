export default function FlightCardSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-center space-y-2">
              <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
            </div>
            <div className="flex-1 mx-6">
              <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto md:border-l border-slate-100 dark:border-slate-800 md:pl-6 flex md:flex-col items-center justify-between md:items-end gap-4 pt-4 md:pt-0 border-t md:border-t-0">
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}