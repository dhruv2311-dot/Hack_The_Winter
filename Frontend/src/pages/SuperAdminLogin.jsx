import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      if (!formData.email.trim()) {
        setErrors(["Email is required"]);
        setLoading(false);
        return;
      }
      if (!formData.password) {
        setErrors(["Password is required"]);
        setLoading(false);
        return;
      }

      const res = await axios.post("http://localhost:5000/api/superadmin/auth/login", formData);

      if (res.data.success) {
        const { token, admin } = res.data.data;

        const adminData = {
          ...admin,
          role: "SUPERADMIN",
          isSuperAdmin: true
        };
        login(adminData, token);

        toast.success("Superadmin login successful! Redirecting...");

        setTimeout(() => {
          navigate("/superadmin/dashboard");
        }, 500);
      }

    } catch (err) {
      console.error("Admin login error:", err);
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([err.response?.data?.message || "Login failed. Please try again."]);
      }
      
      toast.error(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F4F4] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Superadmin Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C1515]/10 border-2 border-[#7C1515]/20 rounded-full mb-4">
            <svg className="w-5 h-5 text-[#7C1515]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold text-[#7C1515]">SUPERADMIN ACCESS</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-br from-[#7C1515] to-[#5A0E0E] p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Superadmin Portal
            </h1>
            <p className="text-white/80">
              Global access to all organizations
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    {errors.map((error, idx) => (
                      <p key={idx} className="text-red-600 text-sm font-medium">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                  Administrator Email <span className="text-[#7C1515]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@bloodlink.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                  Password <span className="text-[#7C1515]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your secure password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Minimum 8 characters for security
                </p>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7C1515] hover:bg-[#5A0E0E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Access Dashboard
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Organization user? <button onClick={() => navigate("/login")} className="text-[#7C1515] font-semibold hover:underline">Login here</button>
              </p>
            </div>

            {/* Security Info Boxes */}
            <div className="space-y-3 mt-6">
              {/* Security Warning */}
              <div className="p-4 bg-[#F9F4F4] border-2 border-gray-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#7C1515] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1F1F1F] mb-1">
                      🔐 Secure Area
                    </p>
                    <p className="text-xs text-gray-600">
                      This account has global access to all organizations, blood banks, hospitals, and NGO data. Keep credentials confidential.
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions Info */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      📋 Admin Capabilities
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>✓ Approve/reject organization registrations</li>
                      <li>✓ Manage all users and permissions</li>
                      <li>✓ View platform-wide analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-[#7C1515] transition-colors font-semibold inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
