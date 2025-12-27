import { useMemo, useState } from "react";

const initialNgoDrives = [
  {
    _id: "drive001",
    ngoName: "Red Drop Foundation",
    driveDate: "2025-12-30",
    location: "Ahmedabad",
    expectedUnits: 20,
    collectedUnits: 12,
    status: "APPROVED",
  },
  {
    _id: "drive002",
    ngoName: "Helping Hands NGO",
    driveDate: "2026-01-05",
    location: "Surat",
    expectedUnits: 15,
    collectedUnits: 0,
    status: "PENDING",
  },
  {
    _id: "drive003",
    ngoName: "Smile Trust",
    driveDate: "2025-12-28",
    location: "Vadodara",
    expectedUnits: 25,
    collectedUnits: 25,
    status: "COMPLETED",
  },
];

const statusBadgeStyles = {
  VERIFIED:
    "bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3] shadow-[0_3px_12px_rgba(31,122,58,0.18)]",
  PENDING:
    "bg-[#fff3e4] text-[#b05f09] border border-[#f0c18c] shadow-[0_3px_12px_rgba(219,149,58,0.2)]",
  APPROVED: "bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3]",
  REJECTED: "bg-[#fde4e4] text-[#9e121c] border border-[#f5a5ad]",
  COMPLETED: "bg-[#e7f3ff] text-[#185a9d] border border-[#b6d8f2]",
};

const formatShortDate = (iso) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(iso));

export default function NgoDrives() {
  const [ngoDrives, setNgoDrives] = useState(initialNgoDrives);
  const [driveStatusFilter, setDriveStatusFilter] = useState("ALL");

  const verificationStatus = "VERIFIED"; // This would come from context/state in real app
  const actionsLocked = verificationStatus !== "VERIFIED";

  const filteredDrives = useMemo(
    () =>
      ngoDrives.filter(
        (drive) =>
          driveStatusFilter === "ALL" || drive.status === driveStatusFilter
      ),
    [ngoDrives, driveStatusFilter]
  );

  const handleDriveStatus = (id, nextStatus) => {
    setNgoDrives((prev) =>
      prev.map((drive) =>
        drive._id === id
          ? {
              ...drive,
              status: nextStatus,
            }
          : drive
      )
    );
  };

  const handleDriveCollection = (id, delta) => {
    setNgoDrives((prev) =>
      prev.map((drive) =>
        drive._id === id
          ? {
              ...drive,
              collectedUnits: Math.max(0, drive.collectedUnits + delta),
            }
          : drive
      )
    );
  };

  return (
    <section className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_25px_60px_rgba(255,118,158,0.12)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
            NGO Donation Drives
          </p>
          <h3 className="text-2xl font-semibold text-[#31101e]">
            Collaboration Pipeline
          </h3>
          <p className="text-sm text-[#7c4a5e]">
            Approve drives, monitor collections, and close loops.
          </p>
        </div>
        <label className="text-xs font-semibold text-[#7c4a5e]">
          Status
          <select
            value={driveStatusFilter}
            onChange={(e) => setDriveStatusFilter(e.target.value)}
            className="ml-2 rounded-full border border-pink-100 bg-white px-3 py-1 focus:border-[#ff4d6d]"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>
      </header>

      {actionsLocked && (
        <p className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-700">
          Approval controls locked pending verification.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredDrives.map((drive) => (
          <article
            key={drive._id}
            className="rounded-3xl border border-pink-50 bg-white p-5 shadow-[0_20px_45px_rgba(255,142,175,0.15)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-semibold text-[#31101e]">
                  {drive.ngoName}
                </h4>
                <p className="text-sm text-[#8a5c70]">
                  {drive.location} · {formatShortDate(drive.driveDate)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusBadgeStyles[drive.status] || "bg-pink-50"
                }`}
              >
                {drive.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-pink-100 bg-pink-50/60 p-3">
                <p className="text-[#ff4d6d]/80">Expected Units</p>
                <p className="text-2xl font-semibold text-[#31101e]">
                  {drive.expectedUnits}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                <p className="text-[#1b8a4b]/70">Collected</p>
                <p className="text-2xl font-semibold text-[#1b8a4b]">
                  {drive.collectedUnits}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
              {drive.status === "PENDING" && (
                <>
                  <button
                    disabled={actionsLocked}
                    onClick={() => handleDriveStatus(drive._id, "APPROVED")}
                    className="rounded-full border border-emerald-200 px-4 py-2 text-[#1b8a4b] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    disabled={actionsLocked}
                    onClick={() => handleDriveStatus(drive._id, "REJECTED")}
                    className="rounded-full border border-[#f59ab3] px-4 py-2 text-[#c5114d] transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reject
                  </button>
                </>
              )}
              {drive.status === "APPROVED" && (
                <>
                  <button
                    disabled={actionsLocked}
                    onClick={() => handleDriveCollection(drive._id, 1)}
                    className="rounded-full border border-pink-100 px-4 py-2 text-[#31101e] transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +1 Unit Collected
                  </button>
                  <button
                    disabled={actionsLocked}
                    onClick={() => handleDriveStatus(drive._id, "COMPLETED")}
                    className="rounded-full border border-[#9dd4ff] px-4 py-2 text-[#0f6fa6] transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Mark Completed
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
