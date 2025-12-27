const bloodStockSnapshot = [
  { bloodGroup: "A+", units: 12, lastUpdated: "2 hours ago" },
  { bloodGroup: "B+", units: 8, lastUpdated: "1 day ago" },
  { bloodGroup: "O+", units: 5, lastUpdated: "30 minutes ago" },
  { bloodGroup: "AB-", units: 2, lastUpdated: "3 days ago" },
  { bloodGroup: "A-", units: 7, lastUpdated: "5 hours ago" },
  { bloodGroup: "B-", units: 4, lastUpdated: "12 hours ago" },
  { bloodGroup: "O-", units: 3, lastUpdated: "1 hour ago" },
  { bloodGroup: "AB+", units: 6, lastUpdated: "8 hours ago" },
];

export default function BloodStock() {
  return (
    <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_25px_55px_rgba(255,154,187,0.15)]">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
          Blood Stock (Read Only)
        </p>
        <h3 className="text-2xl font-semibold text-[#31101e]">
          Current Inventory
        </h3>
        <p className="text-sm text-[#7c4a5e]">
          Updates coming in Phase 2. Monitor availability for requests.
        </p>
      </header>

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
            {bloodStockSnapshot.map((stock) => (
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

      <div className="mt-6 rounded-2xl border border-pink-100 bg-linear-to-br from-[#ffe5ec] to-[#fff5f9] p-5">
        <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]/70">
          Note
        </p>
        <p className="mt-3 text-sm text-[#31101e]">
          This is a read-only view of the current blood stock inventory. Full inventory management features including adding, updating, and removing stock will be available in Phase 2 of the system.
        </p>
      </div>
    </section>
  );
}
