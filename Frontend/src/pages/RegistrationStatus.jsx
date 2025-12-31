import { useState } from "react";
import { checkRegistrationStatus } from "../services/organizationApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function RegistrationStatus() {
  const navigate = useNavigate();
  const [organizationCode, setOrganizationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState("");

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    
    if (!organizationCode.trim()) {
      setError("Organization code is required");
      return;
    }

    setLoading(true);
    setError("");
    setStatusData(null);

    try {
      const res = await checkRegistrationStatus(organizationCode);
      
      if (res.data.success) {
        setStatusData(res.data.data);
        toast.success("Status retrieved!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to check status";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-50 border-green-500 text-green-800";
      case "PENDING":
        return "bg-yellow-50 border-yellow-500 text-yellow-800";
      case "REJECTED":
        return "bg-red-50 border-red-500 text-red-800";
      default:
        return "bg-gray-50 border-gray-500 text-gray-800";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "PENDING":
        return (
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case "REJECTED":
        return (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F4F4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#7C1515] to-[#5A0E0E] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🩸</span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-[#7C1515]">BloodLink</h1>
              <p className="text-xs text-gray-600">Registration Status</p>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1F1F1F] mb-4">
            Check Your <span className="text-[#7C1515]">Registration Status</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Enter your organization code to view your application status
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Status Check Form */}
          <div className={`p-8 sm:p-10 ${statusData ? 'bg-[#F9F4F4]' : ''}`}>
            <form onSubmit={handleCheckStatus} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#1F1F1F] mb-3">
                  Organization Code <span className="text-[#7C1515]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={organizationCode}
                    onChange={(e) => {
                      setOrganizationCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="e.g., HOSP-DEL-001"
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all font-mono text-lg"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 You received this code when you completed registration
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7C1515] hover:bg-[#5A0E0E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full"></div>
                    Checking Status...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Check Status
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Status Display */}
          {statusData && (
            <div className="border-t-2 border-gray-200 p-8 sm:p-10">
              {/* Status Header */}
              <div className="text-center mb-8">
                {getStatusIcon(statusData.status)}
                <h3 className="text-3xl font-bold text-[#1F1F1F] mb-3">
                  {statusData.name}
                </h3>
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 font-bold text-lg ${getStatusBadge(statusData.status)}`}>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                  {statusData.status}
                </div>
              </div>

              {/* Organization Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-[#F9F4F4] border-2 border-gray-200 rounded-xl p-5">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    Organization Code
                  </p>
                  <p className="text-xl font-bold text-[#7C1515] font-mono">
                    {statusData.organizationCode}
                  </p>
                </div>

                <div className="bg-[#F9F4F4] border-2 border-gray-200 rounded-xl p-5">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Registration Date
                  </p>
                  <p className="text-xl font-bold text-[#1F1F1F]">
                    {new Date(statusData.registrationDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {statusData.approvalDate && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 md:col-span-2">
                    <p className="text-xs text-green-700 uppercase font-semibold mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Approval Date
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      {new Date(statusData.approvalDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Status-Specific Messages */}
              {statusData.status === "APPROVED" && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-green-800 mb-2">
                        🎉 Congratulations! Registration Approved
                      </h4>
                      <p className="text-green-700 mb-4">
                        Your organization is now active and ready to use the BloodLink platform. You can login with your admin credentials.
                      </p>
                      <div className="bg-white rounded-lg p-4 text-sm">
                        <p className="font-bold text-gray-800 mb-2">📝 Login Instructions:</p>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">1.</span>
                            <span>Visit the login page</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">2.</span>
                            <span>Enter Organization Code: <span className="font-mono font-bold text-[#7C1515]">{statusData.organizationCode}</span></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">3.</span>
                            <span>Use your admin email and password</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {statusData.status === "PENDING" && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-yellow-700 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-yellow-800 mb-2">
                        ⏳ Registration Under Review
                      </h4>
                      <p className="text-yellow-700 mb-3">
                        Our superadmin team is currently reviewing your application. This typically takes <strong>24-48 hours</strong>.
                      </p>
                      <p className="text-sm text-yellow-700">
                        💡 Tip: You'll receive an email notification once your status changes. Feel free to check back here anytime.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {statusData.status === "REJECTED" && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-red-800 mb-2">
                        ❌ Registration Not Approved
                      </h4>
                      <p className="text-red-700 mb-3">
                        Unfortunately, your registration application was not approved at this time.
                      </p>
                      <p className="text-sm text-red-700">
                        📧 Please contact our support team for more information about the reason and next steps.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(statusData.organizationCode);
                    toast.success("Organization code copied!");
                  }}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </button>

                {statusData.status === "APPROVED" && (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 bg-[#7C1515] hover:bg-[#5A0E0E] text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Go to Login
                  </button>
                )}

                <button
                  onClick={() => {
                    setOrganizationCode("");
                    setStatusData(null);
                    setError("");
                  }}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Check Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        {!statusData && (
          <div className="mt-8 bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F9F4F4] rounded-xl p-5">
                <div className="w-10 h-10 bg-[#7C1515] rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className="font-bold text-[#1F1F1F] mb-2">Where's my code?</p>
                <p className="text-sm text-gray-600">You received your Organization Code via email after completing registration.</p>
              </div>

              <div className="bg-[#F9F4F4] rounded-xl p-5">
                <div className="w-10 h-10 bg-[#7C1515] rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-bold text-[#1F1F1F] mb-2">Review Timeline</p>
                <p className="text-sm text-gray-600">Applications are typically reviewed within 24-48 hours. Check your email for updates.</p>
              </div>

              <div className="bg-[#F9F4F4] rounded-xl p-5">
                <div className="w-10 h-10 bg-[#7C1515] rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="font-bold text-[#1F1F1F] mb-2">Need Support?</p>
                <p className="text-sm text-gray-600">Can't find your code? Contact our support team for assistance.</p>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
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
