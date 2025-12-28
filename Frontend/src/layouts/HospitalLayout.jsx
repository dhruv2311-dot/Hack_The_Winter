import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard Overview", path: "/hospital/overview" },
  { label: "Blood Bank Requests", path: "/hospital/blood-requests" },
  { label: "NGO Donation Drives", path: "/hospital/ngo-drives" },
  { label: "Admin & Verification", path: "/hospital/admin" },
  { label: "Profile & Settings", path: "/hospital/profile" },
];

const hospitalSnapshot = {
  name: "City Care Hospital",
  registrationNumber: "HOSP-GJ-2020-8899",
  city: "Ahmedabad",
  verificationStatus: "VERIFIED",
};

const statusBadgeStyles = {
  VERIFIED:
    "bg-[#ecf8ef] text-[#1f7a3a] border border-[#a2d8b3] shadow-[0_3px_12px_rgba(31,122,58,0.18)]",
  PENDING:
    "bg-[#fff3e4] text-[#b05f09] border border-[#f0c18c] shadow-[0_3px_12px_rgba(219,149,58,0.2)]",
  SUSPENDED:
    "bg-[#fde4e4] text-[#9e121c] border border-[#f5a5ad] shadow-[0_3px_12px_rgba(181,39,57,0.25)]",
};

export default function HospitalLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const SidebarContent = () => (
    <>
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">
          SEBN
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Hospital Hub</h1>
        <p className="text-sm text-white/80">Smart Emergency Blood Network</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
              location.pathname === item.path
                ? "bg-white/25 text-white shadow-inner"
                : "text-white/85 hover:bg-white/15"
            }`}
          >
            {item.label}
            <span>↗</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-white/10 p-5 backdrop-blur">
        <p className="text-sm text-white/80">Rapid escalation?</p>
        <p className="text-xl font-semibold">Control Desk 24×7</p>
        <button className="mt-4 w-full rounded-full bg-white/90 py-3 text-sm font-semibold text-[#8f0f1a] transition hover:bg-white">
          Contact Admin
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#fff6f2] text-[#2d1617] font-['Nunito']">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex sticky top-0 h-screen w-80 shrink-0 flex-col gap-8 bg-linear-to-b from-[#5c0f14] via-[#75161d] to-[#9b1e27] px-8 py-10 text-white shadow-2xl">
          <SidebarContent />
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#ebd7d1] bg-[#fffdfb]/90 px-4 py-5 backdrop-blur md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f1d0c9] text-[#8f0f1a]"
                  aria-label="Open navigation"
                >
                  <div className="space-y-1.5">
                    <span className="block h-0.5 w-6 bg-current" />
                    <span className="block h-0.5 w-6 bg-current" />
                    <span className="block h-0.5 w-4 bg-current" />
                  </div>
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#8f0f1a]">
                    {hospitalSnapshot.city}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-bold text-[#300e11]">
                      {hospitalSnapshot.name}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusBadgeStyles[hospitalSnapshot.verificationStatus]
                      }`}
                    >
                      {hospitalSnapshot.verificationStatus}
                    </span>
                  </div>
                  <p className="text-sm text-[#7a4c4c]">
                    Smart Emergency Blood Network • Hospital Role
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/hospital/profile"
                  className="rounded-full border border-[#f3c9c0] bg-white/70 px-6 py-2 text-sm font-semibold text-[#8f0f1a] shadow-[0_10px_25px_rgba(143,15,26,0.18)] transition hover:bg-white"
                >
                  View Profile
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full bg-linear-to-r from-[#8f0f1a] to-[#c62832] px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(143,15,26,0.35)] transition hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-8 md:px-10 bg-linear-to-b from-white/90 to-[#fff1ec]">
            <Outlet />
          </main>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 lg:hidden transition ${
          drawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute right-0 h-full w-80 max-w-[80%] bg-linear-to-b from-[#5c0f14] via-[#75161d] to-[#9b1e27] px-7 py-8 text-white shadow-2xl transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold tracking-[0.3em] text-white/70">
              NAVIGATION
            </p>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="rounded-full border border-white/40 px-3 py-1 text-xs font-semibold text-white/80"
            >
              Close
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>
    </div>
  );
}
