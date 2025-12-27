import { Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard Overview", path: "/bloodbank/overview" },
  { label: "Hospital Requests", path: "/bloodbank/hospital-requests" },
  { label: "NGO Drives", path: "/bloodbank/ngo-drives" },
  { label: "Blood Stock", path: "/bloodbank/blood-stock" },
  { label: "Admin Messages", path: "/bloodbank/admin-messages" },
  { label: "Profile & Settings", path: "/bloodbank/profile-settings" },
];

const profileSnapshot = {
  name: "LifeCare Blood Bank",
  licenseNumber: "BB-GJ-2021-4455",
  email: "lifecare@bloodbank.com",
  phone: "+91 9876543210",
  city: "Ahmedabad",
  verificationStatus: "VERIFIED",
};

const adminSnapshot = {
  verificationStatus: "VERIFIED",
  lastVerifiedBy: "System Admin",
  message: "Your blood bank has been successfully verified.",
  verifiedAt: "2025-12-20",
};

const statusBadgeStyles = {
  VERIFIED:
    "bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3] shadow-[0_3px_12px_rgba(31,122,58,0.18)]",
  PENDING:
    "bg-[#fff3e4] text-[#b05f09] border border-[#f0c18c] shadow-[0_3px_12px_rgba(219,149,58,0.2)]",
  SUSPENDED:
    "bg-[#fde4e4] text-[#9e121c] border border-[#f5a5ad] shadow-[0_3px_12px_rgba(181,39,57,0.25)]",
};

export default function BloodBankLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#331c1b] font-['Nunito']">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex sticky top-0 h-screen w-80 shrink-0 flex-col gap-8 bg-linear-to-b from-[#5c0f14] via-[#75161d] to-[#9b1e27] px-8 py-10 text-white shadow-2xl">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              SEBN
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Drop Bank</h1>
            <p className="text-sm text-white/80">Blood Bank Command Deck</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
                  location.pathname === item.path
                    ? "bg-white/25 text-white"
                    : "text-white/90 hover:bg-white/15"
                }`}
              >
                {item.label}
                <span>↗</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-white/80">Need escalation?</p>
            <p className="text-xl font-semibold">Control Room 24×7</p>
            <button className="mt-4 w-full rounded-full bg-white/90 py-3 text-sm font-semibold text-[#ff4d6d] transition hover:bg-white">
              Contact Admin
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-[#e0cfc7] bg-[#fffdfb]/90 px-4 py-5 backdrop-blur md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
                  {profileSnapshot.city}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold text-[#31101e]">
                    {profileSnapshot.name}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusBadgeStyles[adminSnapshot.verificationStatus]
                    }`}
                  >
                    {adminSnapshot.verificationStatus}
                  </span>
                </div>
                <p className="text-sm text-[#7c4a5e]">
                  Smart Emergency Blood Network • Blood Bank Role
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/bloodbank/profile-settings"
                  className="rounded-full border border-pink-200 bg-white/70 px-6 py-2 text-sm font-semibold text-[#ff4d6d] shadow-[0_10px_30px_rgba(255,77,109,0.15)] transition hover:bg-white"
                >
                  View Profile
                </Link>
                <button className="rounded-full bg-linear-to-r from-[#ff4d6d] to-[#ff8fa3] px-6 py-2 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(255,77,109,0.35)] transition hover:scale-105">
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="mt-4 flex gap-2 overflow-x-auto text-xs font-semibold text-[#ff4d6d] lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-full border px-4 py-2 whitespace-nowrap ${
                    location.pathname === item.path
                      ? "border-pink-300 bg-pink-100"
                      : "border-pink-200/70 bg-white/60"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </header>

          {/* Main Content Area - Nested Routes Render Here */}
          <main className="flex-1 px-4 py-8 md:px-10">
            {adminSnapshot.verificationStatus !== "VERIFIED" && (
              <div
                className={`mb-6 rounded-3xl border px-6 py-4 text-sm font-semibold ${
                  adminSnapshot.verificationStatus === "SUSPENDED"
                    ? "border-[#ff4d6d]/40 bg-[#ffe2eb]"
                    : "border-[#f8c37b]/60 bg-[#fff5e7]"
                }`}
              >
                {adminSnapshot.verificationStatus === "SUSPENDED"
                  ? "Account suspended — operations locked until HQ reinstates the profile."
                  : "Verification pending — accepting requests and approving drives is paused."}
              </div>
            )}
            
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
