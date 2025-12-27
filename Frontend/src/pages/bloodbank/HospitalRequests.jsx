import { useMemo, useState } from "react";

const initialRequests = [
  {
    _id: "req001",
    hospitalName: "City Care Hospital",
    bloodGroup: "O+",
    unitsRequired: 3,
    urgency: "CRITICAL",
    status: "PENDING",
    requestedAt: "2025-12-27T08:30:00Z",
  },
  {
    _id: "req002",
    hospitalName: "LifeLine Hospital",
    bloodGroup: "A+",
    unitsRequired: 2,
    urgency: "HIGH",
    status: "ACCEPTED",
    requestedAt: "2025-12-26T15:10:00Z",
  },
  {
    _id: "req003",
    hospitalName: "Sunrise Multispeciality",
    bloodGroup: "B-",
    unitsRequired: 4,
    urgency: "MEDIUM",
    status: "PENDING",
    requestedAt: "2025-12-25T07:05:00Z",
  },
  {
    _id: "req004",
    hospitalName: "Hopewell Clinic",
    bloodGroup: "AB+",
    unitsRequired: 1,
    urgency: "LOW",
    status: "COMPLETED",
    requestedAt: "2025-12-20T10:45:00Z",
  },
  {
    _id: "req005",
    hospitalName: "Metro Heart Centre",
    bloodGroup: "O-",
    unitsRequired: 5,
    urgency: "CRITICAL",
    status: "PENDING",
    requestedAt: "2025-12-27T10:15:00Z",
  },
];

const statusBadgeStyles = {
  VERIFIED:
    "bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3] shadow-[0_3px_12px_rgba(31,122,58,0.18)]",
  PENDING:
    "bg-[#fff3e4] text-[#b05f09] border border-[#f0c18c] shadow-[0_3px_12px_rgba(219,149,58,0.2)]",
  SUSPENDED:
    "bg-[#fde4e4] text-[#9e121c] border border-[#f5a5ad] shadow-[0_3px_12px_rgba(181,39,57,0.25)]",
  ACCEPTED: "bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3]",
  REJECTED: "bg-[#fde4e4] text-[#9e121c] border border-[#f5a5ad]",
  COMPLETED: "bg-[#e7f3ff] text-[#185a9d] border border-[#b6d8f2]",
};

const urgencyBadgeStyles = {
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

export default function HospitalRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");
  const [requestUrgencyFilter, setRequestUrgencyFilter] = useState("ALL");

  const verificationStatus = "VERIFIED"; // This would come from context/state in real app
  const actionsLocked = verificationStatus !== "VERIFIED";

  const filteredRequests = useMemo(
    () =>
      requests.filter((req) => {
        const statusMatch =
          requestStatusFilter === "ALL" || req.status === requestStatusFilter;
        const urgencyMatch =
          requestUrgencyFilter === "ALL" || req.urgency === requestUrgencyFilter;
        return statusMatch && urgencyMatch;
      }),
    [requests, requestStatusFilter, requestUrgencyFilter]
  );

  const handleRequestStatus = (id, nextStatus) => {
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
    <section className="space-y-6 rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_25px_60px_rgba(241,122,146,0.18)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
            Hospital Blood Requests
          </p>
          <h3 className="text-2xl font-semibold text-[#31101e]">
            Active Queue
          </h3>
          <p className="text-sm text-[#7c4a5e]">
            Prioritize based on urgency and SLA commitments.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#7c4a5e]">
          <label className="flex items-center gap-2">
            Status
            <select
              value={requestStatusFilter}
              onChange={(e) => setRequestStatusFilter(e.target.value)}
              className="rounded-full border border-pink-100 bg-white px-3 py-1 focus:border-[#ff4d6d]"
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
              value={requestUrgencyFilter}
              onChange={(e) => setRequestUrgencyFilter(e.target.value)}
              className="rounded-full border border-pink-100 bg-white px-3 py-1 focus:border-[#ff4d6d]"
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

      {actionsLocked && (
        <p className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-700">
          Controls locked until verification is completed.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-pink-50">
        <table className="min-w-full text-left text-sm text-[#5c283a]">
          <thead className="bg-pink-50/80 text-xs uppercase tracking-[0.3em] text-[#ff4d6d]">
            <tr>
              <th className="px-6 py-4">Hospital</th>
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
                className={`border-b border-pink-50 bg-white transition hover:bg-pink-50/60 ${
                  req.urgency === "CRITICAL"
                    ? "border-l-4 border-l-[#ff4d6d]"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <td className="px-6 py-4 font-semibold">{req.hospitalName}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-[#ff4d6d]">
                    {req.bloodGroup}
                  </span>
                </td>
                <td className="px-6 py-4">{req.unitsRequired}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      urgencyBadgeStyles[req.urgency]
                    }`}
                  >
                    {req.urgency}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusBadgeStyles[req.status] || "bg-pink-50"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[#8a5c70]">
                  {formatDate(req.requestedAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {req.status === "PENDING" && (
                      <>
                        <button
                          disabled={actionsLocked}
                          onClick={() =>
                            handleRequestStatus(req._id, "ACCEPTED")
                          }
                          className="rounded-full border border-emerald-200 px-4 py-1 text-xs font-semibold text-[#1b8a4b] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Accept
                        </button>
                        <button
                          disabled={actionsLocked}
                          onClick={() =>
                            handleRequestStatus(req._id, "REJECTED")
                          }
                          className="rounded-full border border-[#f59ab3] px-4 py-1 text-xs font-semibold text-[#c5114d] transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {req.status === "ACCEPTED" && (
                      <button
                        disabled={actionsLocked}
                        onClick={() =>
                          handleRequestStatus(req._id, "COMPLETED")
                        }
                        className="rounded-full border border-[#9dd4ff] px-4 py-1 text-xs font-semibold text-[#0f6fa6] transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
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
