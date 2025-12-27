import { useMemo, useState } from "react";

const initialOverviewStats = {
  totalRequests: 18,
  pendingRequests: 3,
  completedSupplies: 15,
  upcomingNgoDrives: 2,
  verificationStatus: "VERIFIED",
};

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

const quickActions = [
  { label: "Create Request", icon: "🩸" },
  { label: "Log Supply", icon: "📦" },
  { label: "Schedule Drive", icon: "📅" },
];

export default function DashboardOverview() {
  const [requests] = useState(initialRequests);
  const [ngoDrives] = useState(initialNgoDrives);

  const dashboardCards = useMemo(
    () => [
      {
        title: "Total Hospital Requests",
        value: initialOverviewStats.totalRequests,
        meta: `${requests.length} active on desk`,
        accent: "from-[#7c0d16] to-[#b71d24]",
      },
      {
        title: "Pending Requests",
        value: initialOverviewStats.pendingRequests,
        meta: `${requests.filter((r) => r.status === "PENDING").length} awaiting action`,
        accent: "from-[#d1661c] to-[#f2994a]",
      },
      {
        title: "Completed Supplies",
        value: initialOverviewStats.completedSupplies,
        meta: `${requests.filter((r) => r.status === "COMPLETED").length} completed`,
        accent: "from-[#2c8a49] to-[#5ec271]",
      },
      {
        title: "Upcoming NGO Drives",
        value: initialOverviewStats.upcomingNgoDrives,
        meta: `${
          ngoDrives.filter((drive) => new Date(drive.driveDate) >= new Date())
            .length
        } scheduled`,
        accent: "from-[#1e5aa8] to-[#6fb1ff]",
      },
      {
        title: "Verification Status",
        value: "VERIFIED",
        meta: "System Admin",
        accent: "from-[#d93f42] to-[#f08a8d]",
      },
    ],
    [requests, ngoDrives]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
            Overview
          </p>
          <h3 className="text-3xl font-semibold text-[#31101e]">
            Mission Control
          </h3>
          <p className="text-sm text-[#7c4a5e]">
            Real-time intelligence synced with SEBN core.
          </p>
        </div>
        <div className="flex gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-[#ff4d6d] shadow-[0_10px_25px_rgba(255,77,109,0.15)]"
            >
              <span className="text-lg">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((card) => (
          <article
            key={card.title}
            className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_20px_50px_rgba(255,112,155,0.15)]"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-[#7c4a5e]">
              {card.title}
            </p>
            <h4
              className={`mt-4 bg-linear-to-r ${card.accent} bg-clip-text text-4xl font-semibold text-transparent`}
            >
              {card.value}
            </h4>
            <p className="mt-2 text-sm text-[#7c4a5e]">{card.meta}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
