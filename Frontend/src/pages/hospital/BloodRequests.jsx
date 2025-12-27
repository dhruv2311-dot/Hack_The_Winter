import { useMemo, useState } from "react";

const initialRequests = [
  {
    _id: "req001",
    bloodBankName: "LifeCare Blood Bank",
    bloodGroup: "O+",
    unitsRequired: 3,
    urgency: "CRITICAL",
    status: "PENDING",
    requestedAt: "2025-12-27T08:30:00Z",
  },
  {
    _id: "req002",
    bloodBankName: "RedCross Blood Bank",
    bloodGroup: "A+",
    unitsRequired: 2,
    urgency: "HIGH",
    status: "COMPLETED",
    requestedAt: "2025-12-26T11:15:00Z",
  },
  {
    _id: "req003",
    bloodBankName: "Hopewell Blood Center",
    bloodGroup: "B-",
    unitsRequired: 4,
    urgency: "MEDIUM",
    status: "ACCEPTED",
    requestedAt: "2025-12-25T09:40:00Z",
  },
];

const statusClasses = {
  PENDING:
    "bg-[#fff3e4] text-[#b05f09] border border-[#f0c18c] shadow-sm",
  ACCEPTED: "bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3]",
  COMPLETED: "bg-[#e7f3ff] text-[#185a9d] border border-[#b6d8f2]",
  REJECTED: "bg-[#fde4e4] text-[#9e121c] border border-[#f5a5ad]",
};

const urgencyClasses = {
  CRITICAL:
    "bg-linear-to-r from-[#8c111c]/20 to-[#c62832]/25 text-[#7c0d16] border border-[#f3a8b3]",
  HIGH: "bg-[#fff1e1] text-[#b35c12] border border-[#f6c898]",
  MEDIUM: "bg-[#fef6e0] text-[#9d7b08] border border-[#f3e3a2]",
  LOW: "bg-[#f3f0ea] text-[#6b5d55] border border-[#dcd2c6]",
};

const formatDate = (iso) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

export default function HospitalBloodRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [verificationStatus] = useState("VERIFIED");

  const actionsLocked = verificationStatus !== "VERIFIED";

  const filteredRequests = useMemo(
    () =>
      requests.filter((req) => {
        const statusMatch = statusFilter === "ALL" || req.status === statusFilter;
        const urgencyMatch =
          urgencyFilter === "ALL" || req.urgency === urgencyFilter;
        return statusMatch && urgencyMatch;
      }),
    [requests, statusFilter, urgencyFilter]
  );

  const handleStatusUpdate = (id, nextStatus) => {
    setRequests((prev) =>
      prev.map((req) =>
        req._id === id
          ? {
              ...req,
              status: nextStatus,
            }
          : req
      )
    );
  };

  return (
    <section className="space-y-6 rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_25px_60px_rgba(77,10,15,0.12)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#8f0f1a]">
            Blood Bank Requests
          </p>
          <h3 className="text-2xl font-semibold text-[#2f1012]">
            Emergency Fulfillment
          </h3>
          <p className="text-sm text-[#7a4c4c]">
            Track every request placed with nearby verified banks.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#7a4c4c]">
          <label className="flex items-center gap-2">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-[#f3c9c0] bg-white px-3 py-1 focus:border-[#8f0f1a]"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Urgency
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="rounded-full border border-[#f3c9c0] bg-white px-3 py-1 focus:border-[#8f0f1a]"
            >
              <option value="ALL">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </label>
        </div>
      </header>

      <div className="rounded-2xl border border-[#f6ddd4] bg-[#fff9f6] p-4 text-sm text-[#7a4c4c]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-[#2f1012]">
              Need more units immediately?
            </p>
            <p className="text-xs">
              Create a high-priority request that alerts nearby blood banks within
              seconds.
            </p>
          </div>
          <button
            disabled={actionsLocked}
            className="rounded-full bg-linear-to-r from-[#8f0f1a] to-[#c62832] px-5 py-2 text-xs font-semibold text-white shadow-[0_15px_35px_rgba(143,15,26,0.25)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + New Blood Request
          </button>
        </div>
        {actionsLocked && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#b05f09]">
            Disabled until verification completes
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#f6ddd4]">
        <table className="min-w-full text-left text-sm text-[#553334]">
          <thead className="bg-[#fdf2ee] text-xs uppercase tracking-[0.3em] text-[#8f0f1a]">
            <tr>
              <th className="px-6 py-4">Blood Bank</th>
              <th className="px-6 py-4">Blood Group</th>
              <th className="px-6 py-4">Units</th>
              <th className="px-6 py-4">Urgency</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Requested</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req) => (
              <tr
                key={req._id}
                className={`border-b border-[#fbe1d9] bg-white transition hover:bg-[#fff4f0] ${
                  req.urgency === "CRITICAL"
                    ? "border-l-4 border-l-[#c62832] bg-[#fff1ed]"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <td className="px-6 py-4 font-semibold text-[#2f1012]">
                  {req.bloodBankName}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full border border-[#f3c9c0] bg-[#fff1ed] px-3 py-1 text-xs font-semibold text-[#8f0f1a]">
                    {req.bloodGroup}
                  </span>
                </td>
                <td className="px-6 py-4">{req.unitsRequired}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      urgencyClasses[req.urgency]
                    }`}
                  >
                    {req.urgency}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusClasses[req.status] || "bg-[#f6ddd4]"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[#8b6161]">
                  {formatDate(req.requestedAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {req.status === "PENDING" && (
                      <>
                        <button
                          disabled={actionsLocked}
                          onClick={() => handleStatusUpdate(req._id, "ACCEPTED")}
                          className="rounded-full border border-[#a2d8b3] px-4 py-1 text-xs font-semibold text-[#176738] transition hover:bg-[#ecf8ef] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Mark Accepted
                        </button>
                        <button
                          disabled={actionsLocked}
                          onClick={() => handleStatusUpdate(req._id, "REJECTED")}
                          className="rounded-full border border-[#f5a5ad] px-4 py-1 text-xs font-semibold text-[#9e121c] transition hover:bg-[#fde4e4] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {req.status === "ACCEPTED" && (
                      <button
                        disabled={actionsLocked}
                        onClick={() => handleStatusUpdate(req._id, "COMPLETED")}
                        className="rounded-full border border-[#b6d8f2] px-4 py-1 text-xs font-semibold text-[#185a9d] transition hover:bg-[#e7f3ff] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
