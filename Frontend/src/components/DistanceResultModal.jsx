/**
 * Distance Result Modal
 * Shows distance calculation results after accepting a request
 */
export default function DistanceResultModal({ isOpen, onClose, distanceInfo, hospitalDetails }) {
  if (!isOpen) return null;

  const getDistanceCategoryColor = (category) => {
    switch (category) {
      case 'VERY_CLOSE':
        return 'from-emerald-500 to-emerald-600';
      case 'CLOSE':
        return 'from-blue-500 to-blue-600';
      case 'MODERATE':
        return 'from-amber-500 to-amber-600';
      case 'FAR':
        return 'from-orange-500 to-orange-600';
      case 'VERY_FAR':
        return 'from-rose-500 to-rose-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDistanceCategoryIcon = (category) => {
    switch (category) {
      case 'VERY_CLOSE': return '🟢';
      case 'CLOSE': return '🔵';
      case 'MODERATE': return '🟡';
      case 'FAR': return '🟠';
      case 'VERY_FAR': return '🔴';
      default: return '⚪';
    }
  };

  const isFarLocation = distanceInfo?.category === 'FAR' || distanceInfo?.category === 'VERY_FAR';

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100/80 backdrop-blur-sm text-gray-600 shadow-md transition-all hover:bg-gray-200 hover:text-gray-900 hover:scale-110 hover:rotate-90"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success Header - Compact */}
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Request Accepted Successfully!</h2>
              <p className="mt-0.5 text-sm text-white/90">Blood units are being prepared for pickup</p>
            </div>
          </div>
        </div>

        {/* Content - Horizontal Layout */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column - Hospital & Distance */}
            <div className="space-y-4">
              {/* Hospital Info */}
              {hospitalDetails && (
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white text-xl flex-shrink-0 shadow-md">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Hospital
                      </p>
                      <p className="text-lg font-bold text-blue-900 truncate">
                        {hospitalDetails.name}
                      </p>
                    </div>
                  </div>
                  {hospitalDetails.address && (
                    <p className="text-sm text-blue-700 flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {hospitalDetails.address.city}, {hospitalDetails.address.state}
                    </p>
                  )}
                </div>
              )}

              {/* Distance Card */}
              {distanceInfo && (
                <div className={`rounded-xl bg-gradient-to-br ${getDistanceCategoryColor(distanceInfo.category)} p-5 text-white shadow-xl`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                      📍 Distance
                    </p>
                    <div className="flex items-center gap-1.5 bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                      <span className="text-lg">{getDistanceCategoryIcon(distanceInfo.category)}</span>
                      <span className="text-xs font-bold">
                        {distanceInfo.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl font-black">
                      {distanceInfo.distance.kilometers}
                    </p>
                    <div>
                      <p className="text-xl font-bold">km</p>
                      <p className="text-sm opacity-90">{distanceInfo.distance.miles} mi</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Route & Warning */}
            <div className="space-y-4 flex flex-col">
              {/* Route Details */}
              {distanceInfo?.hospitalLocation && distanceInfo?.bloodBankLocation ? (
                <div className={`rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 p-4 ${isFarLocation ? '' : 'flex-1'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Transportation Route
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold flex-shrink-0 shadow-md">
                        A
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">From</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">
                          {distanceInfo.bloodBankLocation.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pl-4">
                      <div className="h-8 w-0.5 bg-gradient-to-b from-emerald-300 to-blue-300 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold flex-shrink-0 shadow-md">
                        B
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">To</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">
                          {distanceInfo.hospitalLocation.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Warning for Far Locations */}
              {isFarLocation && distanceInfo && (
                <div className="rounded-xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white text-lg flex-shrink-0 shadow-md">
                      ⚠️
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-orange-900 mb-1">
                        Distance Alert
                      </p>
                      <p className="text-xs text-orange-800 leading-relaxed">
                        Hospital is <strong>{distanceInfo.distance.kilometers} km</strong> away. Ensure proper cold chain logistics for safe blood transportation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Done Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:from-emerald-600 hover:to-teal-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
