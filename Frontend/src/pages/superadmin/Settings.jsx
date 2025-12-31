import { useState } from 'react';
import { Settings, Shield, Bell, Users, Lock, LogOut, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    notifications: true,
    emailAlerts: true,
    systemLogs: true,
    twoFactor: false,
  });

  const handleToggle = (key) => {
    setFormData({ ...formData, [key]: !formData[key] });
    toast.success('Setting updated');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = '/superadmin-login';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Menu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-6 py-4 text-left bg-red-50 text-red-600 border-l-4 border-red-600 font-medium transition">
                <Settings size={20} />
                General Settings
              </button>
              <button className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 text-gray-700 transition">
                <Bell size={20} />
                Notifications
              </button>
              <button className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 text-gray-700 transition">
                <Shield size={20} />
                Security
              </button>
              <button className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 text-gray-700 transition">
                <Users size={20} />
                Admin Users
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={24} />
              General Settings
            </h2>

            <div className="space-y-6">
              {/* System Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">System Notifications</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive notifications for system events
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={() => handleToggle('notifications')}
                    className="sr-only"
                  />
                  <div
                    className={`w-14 h-8 rounded-full transition ${
                      formData.notifications ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 bg-white rounded-full shadow-md transform transition ${
                        formData.notifications ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              {/* Email Alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Email Alerts</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive email alerts for critical events
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailAlerts}
                    onChange={() => handleToggle('emailAlerts')}
                    className="sr-only"
                  />
                  <div
                    className={`w-14 h-8 rounded-full transition ${
                      formData.emailAlerts ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 bg-white rounded-full shadow-md transform transition ${
                        formData.emailAlerts ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              {/* System Logs */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">System Logs</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable detailed system logging
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.systemLogs}
                    onChange={() => handleToggle('systemLogs')}
                    className="sr-only"
                  />
                  <div
                    className={`w-14 h-8 rounded-full transition ${
                      formData.systemLogs ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 bg-white rounded-full shadow-md transform transition ${
                        formData.systemLogs ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
            </div>

            <button className="mt-8 w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium">
              Save Changes
            </button>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={24} />
              Security
            </h2>

            <div className="space-y-6">
              {/* Two Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.twoFactor}
                    onChange={() => handleToggle('twoFactor')}
                    className="sr-only"
                  />
                  <div
                    className={`w-14 h-8 rounded-full transition ${
                      formData.twoFactor ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 bg-white rounded-full shadow-md transform transition ${
                        formData.twoFactor ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              {/* Change Password */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Update your account password
                    </p>
                  </div>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-medium flex items-center gap-2">
                    <Lock size={18} />
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
              <AlertCircle size={24} />
              Danger Zone
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-red-700">
                Irreversible actions. Please proceed with caution.
              </p>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout from All Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
