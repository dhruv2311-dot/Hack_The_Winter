const statsSnapshot = {
  totalBloodRequests: 12,
  pendingRequests: 2,
  completedRequests: 10,
  ngoDrivesCreated: 1,
  verificationStatus: "VERIFIED",
};

const urgentRequests = [
  {
    _id: "u001",
    label: "ICU Requirement",
    bloodGroup: "O+",
    units: 3,
    status: "Awaiting bank confirmation",
    requestedAt: "27 Dec • 08:30",
  },
  {
    _id: "u002",
    label: "Trauma Ward",
    bloodGroup: "A-",
    units: 2,
    status: "Dispatched by LifeCare Bank",
    requestedAt: "26 Dec • 19:10",
  },
];

const statCards = [
  {
    title: "Total Blood Requests",
    value: statsSnapshot.totalBloodRequests,
    meta: "since Dec 01",
    accent: "from-[#7c0d16] to-[#b71d24]",
  },
  {
    title: "Pending Requests",
    value: statsSnapshot.pendingRequests,
    meta: "awaiting bank response",
    accent: "from-[#d1661c] to-[#f29f4a]",
  },
  {
    title: "Completed Requests",
    value: statsSnapshot.completedRequests,
    meta: "fulfilled via SEBN",
    accent: "from-[#1f7a3a] to-[#4dc97d]",
  },
  {
    title: "NGO Drives Created",
    value: statsSnapshot.ngoDrivesCreated,
    meta: "active collaboration",
    accent: "from-[#1e5aa8] to-[#6fb1ff]",
  },
  {
    title: "Verification Status",
    value: statsSnapshot.verificationStatus,
    meta: "System Admin • 18 Dec",
    accent: "from-[#d93f42] to-[#f08a8d]",
  },
];

export default function HospitalOverview() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#8f0f1a]">
            Overview
          </p>
          <h2 className="text-3xl font-semibold text-[#2f1012]">
            Operations Snapshot
          </h2>
          <p className="text-sm text-[#7a4c4c]">
            Real-time picture of hospital blood activity across SEBN.
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-[#8f0f1a] to-[#c62832] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(143,15,26,0.3)] transition hover:scale-105">
          + Create Blood Request
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <article
            key={card.title}
            className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_25px_55px_rgba(143,15,26,0.12)]"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-[#7a4c4c]">
              {card.title}
            </p>
            <h3
              className={`mt-4 bg-linear-to-r ${card.accent} bg-clip-text text-4xl font-semibold text-transparent`}
            >
              {card.value}
            </h3>
            <p className="mt-2 text-sm text-[#6b3c3c]">{card.meta}</p>
          </article>
        ))}
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_30px_60px_rgba(77,10,15,0.12)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8f0f1a]">
              Urgent Requests
            </p>
            <h3 className="text-2xl font-semibold text-[#2f1012]">
              Escalations in last 24h
            </h3>
            <p className="text-sm text-[#7a4c4c]">
              Critical units tracked until fulfillment.
            </p>
          </div>
          <button className="rounded-full border border-[#f3c9c0] px-5 py-2 text-sm font-semibold text-[#8f0f1a] transition hover:border-[#8f0f1a]">
            View all requests
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {urgentRequests.map((req) => (
            <article
              key={req._id}
              className="rounded-2xl border border-[#f7d5cc] bg-linear-to-br from-[#fff1ed] to-white p-5 shadow-inner"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-[#2f1012]">
                  {req.label}
                </h4>
                <span className="rounded-full border border-[#f08a8d] px-3 py-1 text-xs font-semibold text-[#8f0f1a]">
                  {req.bloodGroup}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#7a4c4c]">
                {req.units} units • Requested {req.requestedAt}
              </p>
              <p className="mt-3 text-sm font-medium text-[#a13b44]">
                {req.status}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
