import { useState, useEffect } from "react";
import { getBloodStock } from "../../services/bloodBankApi";
import toast from "react-hot-toast";

export default function BloodStock() {
  const [loading, setLoading] = useState(true);
  const [bloodStock, setBloodStock] = useState([]);

  useEffect(() => {
    fetchBloodStock();
  }, []);

  const fetchBloodStock = async () => {
    try {
      setLoading(true);
      
      // Get blood bank ID from localStorage (set during login)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const bloodBankId =
        user.organizationId ||
        user.bloodBankId ||
        user._id ||
        user.organization?._id;

      if (!bloodBankId) {
        toast.error("Blood bank ID not found");
        return;
      }

      const response = await getBloodStock(bloodBankId);
      
      if (response.data?.success && response.data?.data) {
        const stockData = response.data.data;

        const normalizedStock =
          stockData.bloodStock ||
          stockData.bloodGroups ||
          stockData.stock ||
          {};

        const formattedStock = Object.entries(normalizedStock).map(
          ([group, info]) => {
            const units =
              typeof info === "number" ? info : info?.units ?? 0;
            const lastUpdated =
              info?.lastUpdated ||
              stockData.lastUpdated ||
              stockData.lastUpdatedAt ||
              Date.now();

            return {
              bloodGroup: group,
              units,
              lastUpdated: new Date(lastUpdated).toLocaleString(),
            };
          }
        );

        setBloodStock(formattedStock);
      } else {
        // If no stock data, show empty state
        setBloodStock([]);
      }
    } catch (error) {
      console.error("Error fetching blood stock:", error);
      toast.error("Failed to load blood stock data");
      // Set default blood groups with 0 units
      setBloodStock([
        { bloodGroup: "A+", units: 0, lastUpdated: "N/A" },
        { bloodGroup: "A-", units: 0, lastUpdated: "N/A" },
        { bloodGroup: "B+", units: 0, lastUpdated: "N/A" },
        { bloodGroup: "B-", units: 0, lastUpdated: "N/A" },
        { bloodGroup: "O+", units: 0, lastUpdated: "N/A" },
        { bloodGroup: "O-", units: 0, lastUpdated: "N/A" },
        { bloodGroup: "AB+", units: 0, lastUpdated: "N/A" },
        { bloodGroup: "AB-", units: 0, lastUpdated: "N/A" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d6d] mx-auto"></div>
          <p className="mt-4 text-[#7c4a5e]">Loading blood stock...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_25px_55px_rgba(255,154,187,0.15)]">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
          Blood Stock
        </p>
        <h3 className="text-2xl font-semibold text-[#31101e]">
          Current Inventory
        </h3>
        <p className="text-sm text-[#7c4a5e]">
          Real-time blood stock availability from backend.
        </p>
      </header>

      {bloodStock.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#7c4a5e]">No blood stock data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-pink-50">
          <table className="min-w-full text-left text-sm text-[#5c283a]">
            <thead className="bg-pink-50 text-xs uppercase tracking-[0.3em] text-[#ff4d6d]">
              <tr>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Units Available</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bloodStock.map((stock) => (
                <tr key={stock.bloodGroup} className="border-b border-pink-50 hover:bg-pink-50/40 transition">
                  <td className="px-6 py-4">
                    <span className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-[#ff4d6d]">
                      {stock.bloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-lg">{stock.units}</td>
                  <td className="px-6 py-4 text-xs text-[#8a5c70]">
                    {stock.lastUpdated}
                  </td>
                  <td className="px-6 py-4">
                    {stock.units <= 3 ? (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#fde4e4] text-[#9e121c] border border-[#f5a5ad]">
                        Low Stock
                      </span>
                    ) : stock.units <= 7 ? (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#fff3e4] text-[#b05f09] border border-[#f0c18c]">
                        Moderate
                      </span>
                    ) : (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3]">
                        Adequate
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-pink-100 bg-gradient-to-br from-[#ffe5ec] to-[#fff5f9] p-5">
        <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]/70">
          Note
        </p>
        <p className="mt-3 text-sm text-[#31101e]">
          Blood stock data is fetched from the backend in real-time. Updates are reflected automatically.
        </p>
      </div>
    </section>
  );
}
