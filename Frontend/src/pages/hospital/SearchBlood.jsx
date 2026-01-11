import { useState, useEffect } from "react";
import { searchBloodAvailability, getHospitalById } from "../../services/hospitalApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import CreateBloodRequestModal from "../../components/CreateBloodRequestModal";

// 🎯 RADIUS ESCALATION CONFIGURATION
const RADIUS_STAGES = [5, 10, 20, 30]; // Progressive stages in km
const MAX_BLOOD_BANK_RADIUS = 30;      // Maximum for blood banks
const DONOR_SEARCH_RADIUS = 30;        // Use max radius for donors

export default function SearchBlood() {
  const [filters, setFilters] = useState({
    bloodType: "O+",
    minUnits: 1,
    city: ""
  });
  const [source, setSource] = useState('bloodbank');
  const [results, setResults] = useState([]);
  const [searchedBloodType, setSearchedBloodType] = useState(""); // Store the blood type used for results
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [radius, setRadius] = useState(5);
  const [hospitalCoords, setHospitalCoords] = useState(null);

  const [showRadiusOption, setShowRadiusOption] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [maxRadiusReached, setMaxRadiusReached] = useState(false);

  // Fetch Hospital Coordinates on mount (DB first, then Browser)
  useEffect(() => {
    const fetchLocation = async () => {
      let coordsFound = false;

      // 1. Try fetching from Hospital Profile
      if (user?.organizationId) {
        try {
          const response = await getHospitalById(user.organizationId);
          if (response.data.success && response.data.data.location?.coordinates) {
             const [long, lat] = response.data.data.location.coordinates;
             const hospitalCity = response.data.data.location.city;
             
             setHospitalCoords({ latitude: lat, longitude: long, source: 'db' });
             
             // Auto-fill city for robust fallback
             if (hospitalCity) {
                 setFilters(prev => ({ ...prev, city: hospitalCity }));
             }

             console.log("📍 Hospital Location Loaded (DB):", { lat, long, city: hospitalCity });
             coordsFound = true;
          }
        } catch (error) {
          console.error("Failed to load hospital location:", error);
        }
      }

      // 2. Fallback to Browser Geolocation if no DB coords
      if (!coordsFound && navigator.geolocation) {
         console.log("📍 Trying Browser Geolocation...");
         navigator.geolocation.getCurrentPosition(
            (position) => {
               console.log("📍 Browser Location Loaded:", position.coords);
               setHospitalCoords({ 
                   latitude: position.coords.latitude, 
                   longitude: position.coords.longitude,
                   source: 'gps'
               });
            },
            (err) => console.warn("Browser geolocation failed:", err)
         );
      }
    };

    fetchLocation();
  }, [user]);
  
  // Reset Radius to 5km when Blood Type changes
  useEffect(() => {
    setRadius(5);
    setShowRadiusOption(false);
    setMaxRadiusReached(false); // Reset max radius flag
  }, [filters.bloodType]);

  // Haversine Formula to calculate distance in meters
  // Used as fallback if backend geo-search fails and returns everything
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return null;
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // in meters
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSearch = async (e, customRadius = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    setShowRadiusOption(false);
    
    // Use custom radius if provided (for expansion), otherwise use state
    const currentRadius = customRadius || radius;

    try {
      const response = await searchBloodAvailability(
        filters.bloodType, 
        filters.minUnits, 
        filters.city,
        hospitalCoords?.latitude,
        hospitalCoords?.longitude,
        currentRadius
      );
      
      if (response.data.success) {
        let finalResults = response.data.data;
        const radiusMeters = currentRadius * 1000;

        // === Client-Side Filtering (Fail-safe) ===
        // If backend returned results but they lack 'distance' (Legacy fallback used)
        // OR simply to doubly ensure we respect the radius.
        if (hospitalCoords) {
            finalResults = finalResults.map(item => {
                // If backend gave distance, use it. Else calculate it.
                if (item.distance !== undefined) return item;
                
                // Calculate manual distance from item.location.coordinates
                if (item.location?.coordinates) {
                    const [iLong, iLat] = item.location.coordinates;
                    const manualDist = calculateDistance(hospitalCoords.latitude, hospitalCoords.longitude, iLat, iLong);
                    return { ...item, distance: manualDist };
                }
                return { ...item, distance: null }; // No coords to measure
            }).filter(item => {
                // Keep if distance is within radius OR distance is unknown (don't hide if we can't measure)
                if (item.distance === null) return true; 
                return item.distance <= radiusMeters;
            });
            
            // Re-sort locally just in case
            finalResults.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
        }

        setResults(finalResults);
        setSource(response.data.source || 'bloodbank');
        setSearchedBloodType(filters.bloodType); // Lock in the blood type for display
        
        if (finalResults.length === 0) {
           // If searching and none found, verify if we used coordinates
           if (hospitalCoords) {
               setShowRadiusOption(true);
               toast.error(`No ${response.data.source === 'donor' ? 'donors' : 'blood banks'} found within ${currentRadius}km.`);
           } else {
               toast.error(`No ${response.data.source === 'donor' ? 'donors' : 'stock'} found in this city.`);
           }
        } else if (response.data.source === 'donor') {
           toast.success(`Found ${finalResults.length} donors within ${currentRadius}km.`);
        } else {
           // Only show success for blood banks if using radius
           if (hospitalCoords) {
              toast.success(`Found ${finalResults.length} blood banks within ${currentRadius}km.`);
           }
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to search blood availability");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIncreaseRadius = () => {
    const currentIndex = RADIUS_STAGES.indexOf(radius);
    
    // Check if already at maximum radius
    if (currentIndex === RADIUS_STAGES.length - 1 || radius >= MAX_BLOOD_BANK_RADIUS) {
      // Already at max (50 km) - trigger donor search automatically
      setMaxRadiusReached(true);
      toast.error(`Maximum search radius (${MAX_BLOOD_BANK_RADIUS}km) reached for blood banks.`, {
        duration: 4000,
        icon: '🚨'
      });
      toast.success(`Searching for donors within ${DONOR_SEARCH_RADIUS}km instead...`, {
        duration: 4000,
        icon: '🔄'
      });
      
      // Note: The backend already handles donor fallback automatically
      // when no blood banks are found. This just informs the user.
      return;
    }
    
    // Move to next radius stage
    const newRadius = RADIUS_STAGES[currentIndex + 1];
    setRadius(newRadius);
    
    toast(`Expanding search to ${newRadius}km radius...`, {
      duration: 2000,
      icon: '🌍'
    });
    
    // Trigger search immediately with new radius
    handleSearch(null, newRadius);
  };

  return (
    <section className="space-y-8">
      {/* ... Header & Form ... */}
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-red-700 font-bold">
          Emergency
        </p>
        <h2 className="text-3xl font-bold text-gray-900">
          Search Blood Stock
        </h2>
        <p className="text-sm text-gray-600">
          Find available blood units or compatible donors instantly.
        </p>
      </div>

      {/* Search Filter Box */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <form onSubmit={handleSearch} className="grid gap-6 md:grid-cols-4 items-end">
          {/* ... Inputs ... */}
          
          {/* Blood Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Blood Type</label>
            <select
              value={filters.bloodType}
              onChange={(e) => setFilters({...filters, bloodType: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-semibold text-gray-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
            >
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Min Units - Only relevant for stock search, but we keep it */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Minimum Units</label>
            <input
              type="number"
              min="1"
              value={filters.minUnits}
              onChange={(e) => setFilters({...filters, minUnits: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-semibold text-gray-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">City (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-semibold text-gray-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-bold text-white shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Find Blood"}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
            
            {/* Radius Stage Progression Indicator */}
            {hospitalCoords && !loading && (
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Search Radius Progression</p>
                <div className="flex items-center justify-between gap-2">
                  {RADIUS_STAGES.map((stage, index) => {
                    const isCompleted = RADIUS_STAGES.indexOf(radius) > index;
                    const isCurrent = radius === stage;
                    const isUpcoming = RADIUS_STAGES.indexOf(radius) < index;
                    
                    return (
                      <div key={stage} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            isCurrent 
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110' 
                              : isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {isCompleted ? '✓' : `${stage}`}
                          </div>
                          <p className={`text-[10px] mt-1 font-semibold ${
                            isCurrent ? 'text-indigo-700' : isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {stage}km
                          </p>
                        </div>
                        {index < RADIUS_STAGES.length - 1 && (
                          <div className={`h-1 flex-1 mx-1 rounded transition-all ${
                            isCompleted ? 'bg-green-400' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {maxRadiusReached && (
                  <div className="mt-3 text-center">
                    <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-bold">
                      🚨 Maximum Radius Reached - Donor Search Active
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Radius Control Bar (Dedicated Visibility) */}
            {hospitalCoords && !loading && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-indigo-50 p-4 border border-indigo-100 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl">
                        📍
                      </div>
                      <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            Current Radius {maxRadiusReached && '(Maximum)'}
                          </p>
                          <p className="text-xl font-black text-indigo-900 leading-none">{radius} KM</p>
                          {!maxRadiusReached && (
                            <p className="text-[9px] text-indigo-500 mt-0.5">
                              Stage {RADIUS_STAGES.indexOf(radius) + 1}/{RADIUS_STAGES.length}
                            </p>
                          )}
                      </div>
                  </div>
                  <button 
                      onClick={handleIncreaseRadius}
                      disabled={maxRadiusReached || radius >= MAX_BLOOD_BANK_RADIUS}
                      className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-bold text-white shadow-md transition transform active:scale-95 ${
                        maxRadiusReached || radius >= MAX_BLOOD_BANK_RADIUS
                          ? 'bg-gray-400 cursor-not-allowed opacity-60'
                          : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                      }`}
                  >
                      {maxRadiusReached || radius >= MAX_BLOOD_BANK_RADIUS ? (
                        <span>🚫 Max Radius Reached</span>
                      ) : (
                        <span>🌍 Expand to {RADIUS_STAGES[RADIUS_STAGES.indexOf(radius) + 1]}km</span>
                      )}
                  </button>
              </div>
            )}

            <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
               {source === 'donor' ? `Matching Donors (${radius}km)` : 'Search Results'} ({results.length})
            </h3>
            {/* Header Right Side: Badges */}
            <div className="flex flex-wrap items-center gap-2">
                 {source === 'donor' && (
                   <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1.5 rounded-full font-bold border border-yellow-200">
                     Searching Donors
                   </span>
                 )}

                 {hospitalCoords && (
                    <span className={`text-xs px-2 py-1.5 rounded-full font-bold border ${
                        hospitalCoords.source === 'db' 
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                    }`}>
                      📍 {hospitalCoords.source === 'db' ? 'Hospital Loc' : 'GPS Loc'} ({radius}km)
                    </span>
                 )}
            </div>
            </div>

            {/* Fallback Message: when showing Donors because BB failed */}
            {source === 'donor' && results.length > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm animate-fade-in">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            ⚠️
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-orange-700">
                                <span className="font-bold">No Blood Stock Found!</span> We couldn't find any blood banks with <strong>{searchedBloodType}</strong> within {radius}km.
                                <br/>
                                Displaying <strong>nearby donors</strong> who match your requirement.
                            </p>
                        </div>
                    </div>
                </div>
            )}

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
               <p className="text-gray-500 mb-4">{loading ? "Scanning network..." : `No ${source === 'donor' ? 'donors' : 'blood stock'} found nearby.`}</p>
               
               {/* Expand Radius Button */}
               {showRadiusOption && !loading && (
                  <button
                    onClick={handleIncreaseRadius}
                    disabled={maxRadiusReached || radius >= MAX_BLOOD_BANK_RADIUS}
                    className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg shadow-md transition-all transform ${
                      maxRadiusReached || radius >= MAX_BLOOD_BANK_RADIUS
                        ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                    }`}
                  >
                    {maxRadiusReached || radius >= MAX_BLOOD_BANK_RADIUS ? (
                      <span>� Maximum Radius Reached ({MAX_BLOOD_BANK_RADIUS}km)</span>
                    ) : (
                      <span>🔄 Expand Search to {RADIUS_STAGES[RADIUS_STAGES.indexOf(radius) + 1]}km</span>
                    )}
                  </button>
               )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
                 {/* Results Grid */}
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((item) => (
                    <div key={item._id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                      
                      {source === 'bloodbank' ? (
                         // === BLOOD BANK CARD ===
                         <>
                            <div className="absolute top-0 right-0 rounded-bl-xl bg-red-100 px-4 py-2 text-red-700 font-bold">
                                {item.bloodStock?.[searchedBloodType]?.units || 0} Units
                            </div>
    
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.type}</p>
                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition">
                                {item.name}
                                </h4>
                                {item.distance && (
                                   <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mt-1 inline-block">
                                     📍 {Math.round(item.distance / 100) / 10} km away
                                   </span>
                                )}
                            </div>
    
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                <p>{item.location?.address || "Address not available"}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                <span className="block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                <p>{item.location?.city}, {item.location?.state}</p>
                                </div>
                            </div>
    
                            <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Available Stock</p>
                                    <p className="text-sm text-gray-600">for Blood Group <span className="font-bold text-gray-900">{searchedBloodType}</span></p>
                                </div>
                                <div className="flex flex-col items-center rounded-lg bg-white p-2 shadow-sm border border-red-100 min-w-[80px]">
                                    <span className="text-2xl font-bold text-red-600">
                                        {item.bloodStock?.[searchedBloodType]?.units || 0}
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Units</span>
                                </div>
                            </div>
    
                            <div className="mt-4 border-t border-gray-100 pt-4 flex items-center justify-between">
                                <div className="text-xs">
                                    <p className="text-gray-500">Contact</p>
                                    <p className="font-semibold text-gray-900">{item.phone}</p>
                                </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${item.phone}`; }}
                                className="rounded-full bg-gray-100 hover:bg-red-50 p-2 text-gray-600 hover:text-red-600 transition"
                            >
                            📞
                            </button>
                        </div>
                        
                        {/* Request Stock Action */}
                        <button 
                            onClick={() => {
                                setSelectedBank(item);
                                setIsRequestModalOpen(true);
                            }}
                            className="mt-4 w-full rounded-xl bg-red-600 py-3 font-bold text-white shadow-md hover:bg-red-700 hover:shadow-lg transition flex items-center justify-center gap-2"
                        >
                           <span>🚑 Request Stock</span>
                        </button>
                     </>
                  ) : (
                         // === DONOR CARD ===
                         <>
                            <div className="absolute top-0 right-0 rounded-bl-xl bg-blue-100 px-4 py-2 text-blue-700 font-bold">
                                Donor
                            </div>
    
                            <div className="mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Donor</p>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition">
                                {item.name}
                                </h4>
                            </div>
    
                            <div className="space-y-3 text-sm text-gray-600">
                                 <div className="flex items-center gap-2">
                                    <span className="text-gray-400">🩸</span>
                                    <p className="font-bold text-gray-900">Blood Group: <span className="text-red-600 text-lg">{item.bloodGroup}</span></p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📍</span>
                                    <p>{item.city}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">👤</span>
                                    <p>{item.gender}, {item.age} years</p>
                                </div>
                            </div>
    
                            <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-100">
                                 <p className="text-xs text-blue-800 text-center">
                                    This donor matches the required blood group.
                                 </p>
                            </div>
    
                             <div className="mt-4 border-t border-gray-100 pt-4 flex items-center justify-between">
                                <div className="text-xs">
                                    <p className="text-gray-500">Mobile</p>
                                    <p className="font-semibold text-gray-900">{item.mobileNumber}</p>
                                </div>
                                <button 
                                    onClick={() => window.location.href = `tel:${item.mobileNumber}`}
                                    className="rounded-full bg-gray-100 hover:bg-blue-50 p-2 text-gray-600 hover:text-blue-600 transition"
                                >
                                📞
                                </button>
                            </div>
                         </>
                      )}
                    </div>
                  ))}
                </div>

                {/* End of Results */}
            </div>
          )}
        </div>
      )}
      
      {/* Create Blood Request Modal (Pre-filled) */}
      <CreateBloodRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
            toast.success("Blood Request Created Successfully! Check Blood Requests section.");
            setIsRequestModalOpen(false);
        }}
        hospitalId={user?.organizationId || localStorage.getItem('organizationId')}
        preSelectedBloodBank={selectedBank}
      />
    </section>
  );
}
