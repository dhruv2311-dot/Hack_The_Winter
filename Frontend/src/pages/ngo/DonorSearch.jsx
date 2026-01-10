import { useMemo, useState } from "react";
import { bloodGroups, formatDate } from "./constants";
import { searchDonorsByCity } from "../../services/ngoApi";

export default function DonorRegistry() {
  const [bloodFilter, setBloodFilter] = useState("ALL");
  const [citySearch, setCitySearch] = useState("");
  const [searchedCity, setSearchedCity] = useState(""); // Store the city that was actually searched
  const [searchedDonors, setSearchedDonors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");



  // Handle city search
  const handleCitySearch = async () => {
    if (!citySearch || citySearch.trim().length === 0) {
      setSearchError("Please enter a city name");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    
    try {
      const response = await searchDonorsByCity(citySearch.trim());
      console.log("[DONOR_SEARCH] Response:", response.data);
      
      if (response.data.success) {
        setSearchedDonors(response.data.data || []);
        setSearchedCity(citySearch.trim()); // Update searched city only on success
        if (response.data.data.length === 0) {
          setSearchError(`No donors found in ${citySearch}`);
        }
      } else {
        setSearchError(response.data.message || "Failed to search donors");
      }
    } catch (error) {
      console.error("[DONOR_SEARCH] Error:", error);
      setSearchError(error.response?.data?.message || "Failed to search donors");
    } finally {
      setIsSearching(false);
    }
  };

  // Filter searched donors by blood group
  const filteredSearchedDonors = useMemo(() => {
    if (bloodFilter === "ALL") return searchedDonors;
    return searchedDonors.filter(donor => donor.bloodGroup === bloodFilter);
  }, [searchedDonors, bloodFilter]);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#ffe5ed] bg-white p-8 shadow-[0_35px_90px_rgba(42,8,20,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
              Donor Database
            </p>
            <h3 className="text-2xl font-semibold text-[#2a0814]">
              Search Donors by City
            </h3>
            <p className="text-sm text-[#7a4456]">
              Find registered donors from our database based on city and blood group.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={bloodFilter}
              onChange={(event) => setBloodFilter(event.target.value)}
              className="rounded-full border border-[#ffd1df] bg-[#fff7f9] px-4 py-2 text-xs font-semibold text-[#2a0814]"
            >
              <option value="ALL">All Blood Groups</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* City Search Bar */}
        <div className="mt-6 rounded-3xl border border-[#ffd1df] bg-[#fff7f9] p-6">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a44255]">
            Search Donors by City
            <div className="mt-2 flex gap-3">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
                placeholder="Enter city name (e.g., Mumbai, Delhi)"
                className="flex-1 rounded-2xl border border-[#ffd1df] bg-white px-4 py-3 text-sm text-[#2a0814]"
              />
              <button
                onClick={handleCitySearch}
                disabled={isSearching}
                className="rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#ff7b9c] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_15px_35px_rgba(255,77,109,0.35)] disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </label>
          {searchError && (
            <p className="mt-2 text-sm font-semibold text-[#d92140]">
              {searchError}
            </p>
          )}
        </div>

        {/* Searched Donors Display */}
        {searchedDonors.length > 0 && (
          <div className="mt-6 rounded-3xl border border-[#ffe0e8] bg-white p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
                Search Results
              </p>
              <h4 className="text-xl font-semibold text-[#2a0814]">
                {filteredSearchedDonors.length} Donor(s) Found in {searchedCity}
              </h4>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredSearchedDonors.map((donor) => (
                <article
                  key={donor._id}
                  className="rounded-2xl border border-[#ffe0e8] bg-[#fff9fb] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#2a0814]">{donor.name}</p>
                      <p className="text-xs text-[#7a4456]">{donor.age} years • {donor.gender}</p>
                    </div>
                    <span className="rounded-full bg-[#ffe5ed] px-3 py-1 text-xs font-semibold text-[#d92140]">
                      {donor.bloodGroup}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-[#7a4456]">
                    <p>📞 {donor.mobileNumber}</p>
                    <p>📍 {donor.address}, {donor.city}</p>
                    {donor.email && <p>✉️ {donor.email}</p>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[#ecf8ef] px-3 py-1 font-semibold text-[#1f7a3a]">
                      {donor.totalDonations} Donations
                    </span>
                    {donor.lastDonationDate && (
                      <span className="rounded-full bg-[#fff0e5] px-3 py-1 font-semibold text-[#ff8c42]">
                        Last: {formatDate(donor.lastDonationDate)}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}


      </div>


    </section>
  );
}
