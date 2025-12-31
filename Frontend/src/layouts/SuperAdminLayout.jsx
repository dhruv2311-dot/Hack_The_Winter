import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Heart,
  Droplet,
  CheckCircle,
  Settings,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Hospitals', path: '/superadmin/hospitals', icon: Building2 },
    { name: 'NGOs', path: '/superadmin/ngos', icon: Heart },
    { name: 'Blood Banks', path: '/superadmin/blood-banks', icon: Droplet },
    { name: 'Blood Stock', path: '/superadmin/blood-stock', icon: Droplet },
    { name: 'Approvals', path: '/superadmin/approvals', icon: CheckCircle },
    { name: 'Settings', path: '/superadmin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = '/superadmin-login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-red-700 to-red-800 text-white transition-all duration-300 shadow-lg`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-red-600">
          <div className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
            BloodHub
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-red-600 p-2 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Admin Badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 bg-red-600 mx-2 mt-4 rounded-lg text-center">
            <p className="text-xs font-semibold uppercase tracking-wide">
              Super Admin
            </p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="mt-8 px-2 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.name : ''}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-red-600 shadow-md'
                    : 'hover:bg-red-600 hover:bg-opacity-50'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-0 right-0 px-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 hover:bg-opacity-50 transition text-red-100"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden lg:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg flex-1 max-w-md">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative hover:bg-gray-100 p-2 rounded-lg transition">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-semibold">
                SA
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-500">System Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
