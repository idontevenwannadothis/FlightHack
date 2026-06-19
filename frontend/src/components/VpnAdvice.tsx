export default function VpnAdvice({ advice }: { advice: any }) {
    if (!advice) return null;
  
    return (
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl p-0.5 shadow-lg relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            
            {/* Icon Block */}
            <div className="flex-shrink-0 bg-indigo-100 p-4 rounded-full shadow-inner border border-indigo-50">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Content Block */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Pro Tip</span>
                <h3 className="text-xl font-bold text-slate-900">
                  VPN Price Optimization
                </h3>
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed">
                {advice.reason}
              </p>
              
              <div className="mt-5 bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Suggested Server Location</p>
                  <p className="text-lg font-bold text-indigo-900 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {advice.suggested_country}
                  </p>
                </div>

                <div className="w-px h-10 bg-indigo-200 hidden sm:block"></div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Estimated Savings</p>
                  <p className="text-lg font-bold text-emerald-600">{advice.estimated_savings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }