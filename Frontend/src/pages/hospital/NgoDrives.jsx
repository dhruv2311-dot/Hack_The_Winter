import { useMemo, useState } from "react";

const initialDrives = [
  {
    _id: "drive001",
    ngoName: "Helping Hands NGO",
    driveDate: "2026-01-05",
    location: "Ahmedabad",
    expectedUnits: 25,
    status: "ACCEPTED",
  },
  {
    _id: "drive002",
    ngoName: "Red Drop Foundation",
    driveDate: "2025-12-20",
    location: "Ahmedabad",
    expectedUnits: 20,
    status: "COMPLETED",
  },
  {
    _id: "drive003",
    ngoName: "Smile Trust",
    driveDate: "2026-01-12",
    location: "Surat",
    expectedUnits: 30,
    status: "PENDING",
  },
];

const statusPills = {
  PENDING: "bg-[#fff3e4] text-[#b05f09] border border-[#f0c18c]",
  ACCEPTED: "bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3]",
  COMPLETED: "bg-[#e7f3ff] text-[#185a9d] border border-[#b6d8f2]",
  REJECTED: "bg-[#fde4e4] text-[#9e121c] border border-[#f5a5ad]",
};

const formatDate = (iso) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(iso));

export default function HospitalNgoDrives() {
  const [drives, setDrives] = useState(initialDrives);
  const [filter, setFilter] = useState("ALL");
  const verificationStatus = "VERIFIED";
  const actionsLocked = verificationStatus !== "VERIFIED";

  const filtered = useMemo(
    () =>
      drives.filter(
        (drive) => filter === "ALL" || drive.status === filter
      ),
    [drives, filter]
  );

  const handleStatusUpdate = (id, nextStatus) => {
    setDrives((prev) =>
      prev.map((drive) =>
        drive._id === id ? { ...drive, status: nextStatus } : drive
      )
    );
  };

  return (
    <section className="space-y-6 rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_25px_60px_rgba(77,10,15,0.12)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#8f0f1a]">
            NGO Donation Drives
          </p>
          <h3 className="text-2xl font-semibold text-[#2f1012]">
            Collaborative Drives
          </h3>
          <p className="text-sm text-[#7a4c4c]">
            Partner with trusted NGOs to maintain critical reserves.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#7a4c4c]">
          <label className="flex items-center gap-2">
            Status
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-full border border-[#f3c9c0] bg-white px-3 py-1 focus:border-[#8f0f1a]"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
          <button
            disabled={actionsLocked}
            className="rounded-full bg-linear-to-r from-[#8f0f1a] to-[#c62832] px-5 py-2 text-xs font-semibold text-white shadow-[0_15px_35px_rgba(143,15,26,0.25)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + New Drive Request
          </button>
        </div>
      </header>

      {actionsLocked && (
        <p className="rounded-2xl border border-[#f0c18c] bg-[#fff3e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#b05f09]">
          Drive creation disabled until verification completes.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((drive) => (
          <article
            key={drive._id}
            className="rounded-2xl border border-[#f6ddd4] bg-[#fff9f6] p-5 shadow-[0_20px_45px_rgba(77,10,15,0.08)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-semibold text-[#2f1012]">
                  {drive.ngoName}
                </h4>
                <p className="text-sm text-[#7a4c4c]">
                  {drive.location} • {formatDate(drive.driveDate)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusPills[drive.status] || "bg-[#f6ddd4]"
                }`}
              >
                {drive.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-[#553334]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#8f0f1a]">
                  Expected Units
                </p>
                <p className="text-2xl font-semibold text-[#2f1012]">
                  {drive.expectedUnits}
                </p>
              </div>
              <p className="text-xs text-[#8b6161]">
                Prepared by hospital donor relations
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
              {drive.status === "PENDING" && (
                <>
                  <button
                    disabled={actionsLocked}
                    onClick={() => handleStatusUpdate(drive._id, "ACCEPTED")}
                    className="rounded-full border border-[#a2d8b3] px-4 py-2 text-[#1f7a3a] transition hover:bg-[#ecf8ef] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    disabled={actionsLocked}
                    onClick={() => handleStatusUpdate(drive._id, "REJECTED")}
                    className="rounded-full border border-[#f5a5ad] px-4 py-2 text-[#9e121c] transition hover:bg-[#fde4e4] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reject
                  </button>
                </>
              )}
              {drive.status === "ACCEPTED" && (
                <button
                  disabled={actionsLocked}
                  onClick={() => handleStatusUpdate(drive._id, "COMPLETED")}
                  className="rounded-full border border-[#b6d8f2] px-4 py-2 text-[#185a9d] transition hover:bg-[#e7f3ff] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
