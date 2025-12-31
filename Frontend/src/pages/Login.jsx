import { useState } from "react";
import { loginUser } from "../services/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    organizationCode: "",
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
      if (!formData.organizationCode.trim()) {
        setErrors(["Organization code is required"]);
        setLoading(false);
        return;
      }
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

      const res = await loginUser(formData);

      if (res.data.success) {
        const { token, user } = res.data;
        login(user, token);
        toast.success("Login successful! Redirecting...");

        setTimeout(() => {
          const orgType = user.organizationType ? user.organizationType.toLowerCase() : "";
          if (orgType === "hospital") {
            navigate("/hospital");
          } else if (orgType === "bloodbank") {
            navigate("/bloodbank");
          } else if (orgType === "ngo") {
            navigate("/ngo/dashboard");
          } else {
            navigate("/login");
          }
        }, 500);
      }

    } catch (err) {
      console.error("Login error:", err);
      
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
    <div className="min-h-screen bg-gradient-to-br from-[#1F1F1F] via-[#2a2a2a] to-[#1F1F1F] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Side - Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#7C1515] to-[#5A0E0E] rounded-2xl p-8 lg:p-10 shadow-2xl text-white h-full flex flex-col justify-between">
              <div>
                {/* Logo/Brand */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🩸</span>
                    </div>
                    <span className="text-2xl font-bold">BloodLink</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                    Access Your Healthcare
                    <br />
                    Command Center
                  </h2>
                  <p className="text-white/80 text-lg">
                    Login to orchestrate blood management operations and save lives through our integrated platform.
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-white/90">Real-time blood inventory management across your organization</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-white/90">Seamless donor and request coordination workflows</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-white/90">Comprehensive analytics dashboard with actionable insights</p>
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="pt-6 border-t border-white/20">
                <p className="text-white/70 text-sm">
                  Need help logging in? <button onClick={() => navigate("/registration-status")} className="text-white hover:underline font-semibold">Check Registration Status</button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Welcome Back</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F]">Login to BloodLink</h1>
                  </div>
                  <button
                    onClick={() => navigate("/")}
                    className="text-gray-500 hover:text-[#7C1515] transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600">Use your organization code to access the platform</p>
              </div>

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
                {/* Organization Code Input */}
                <div>
                  <label htmlFor="organizationCode" className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                    Organization Code <span className="text-[#7C1515]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="organizationCode"
                      type="text"
                      name="organizationCode"
                      placeholder="e.g., HOSP-DEL-001"
                      value={formData.organizationCode}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Your unique organization identifier
                  </p>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                    Email Address <span className="text-[#7C1515]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="your.email@organization.com"
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
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-[#1F1F1F]">
                      Password <span className="text-[#7C1515]">*</span>
                    </label>
                    <button
                      type="button"
                      className="text-xs text-[#7C1515] hover:underline font-semibold"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
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
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Access Workspace
                    </span>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Need access? <button onClick={() => navigate("/organization-registration")} className="text-[#7C1515] font-semibold hover:underline">Create an account</button>
                </p>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-[#F9F4F4] border-2 border-gray-200 rounded-xl">
                <p className="text-xs text-gray-700">
                  <strong className="text-[#1F1F1F]">🔒 Secure Login:</strong> Use the organization code provided by your administrator along with your registered email and password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
