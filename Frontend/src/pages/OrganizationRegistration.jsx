import { useState } from "react";
import { registerOrganization } from "../services/organizationApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function OrganizationRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    organizationName: "",
    type: "hospital",
    email: "",
    phone: "",
    location: {
      city: "",
      state: "",
      address: "",
      pincode: ""
    },
    licenseNumber: "",
    contactPerson: "",
    adminName: "",
    adminEmail: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes("location.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateStep = () => {
    const newErrors = [];

    if (step === 1) {
      if (!formData.organizationName.trim()) newErrors.push("Organization name is required");
      if (!formData.type) newErrors.push("Organization type is required");
      if (!formData.email.trim()) newErrors.push("Organization email is required");
      if (!formData.phone.trim()) newErrors.push("Phone number is required");
      if (!formData.location.city.trim()) newErrors.push("City is required");
      if (!formData.location.state.trim()) newErrors.push("State is required");
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.push("Invalid email format");
      }
    } else if (step === 2) {
      if (!formData.licenseNumber.trim()) newErrors.push("License number is required");
      if (!formData.contactPerson.trim()) newErrors.push("Contact person name is required");
    } else if (step === 3) {
      if (!formData.adminName.trim()) newErrors.push("Admin name is required");
      if (!formData.adminEmail.trim()) newErrors.push("Admin email is required");
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.adminEmail && !emailRegex.test(formData.adminEmail)) {
        newErrors.push("Invalid admin email format");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const submitData = {
        organizationName: formData.organizationName,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        licenseNumber: formData.licenseNumber,
        contactPerson: formData.contactPerson,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail
      };

      const res = await registerOrganization(submitData);

      if (res.data.success) {
        setSuccessData(res.data.data);
        toast.success("Organization registered successfully!");
        setStep(4);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      setErrors([errorMsg]);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F1F1F] via-[#2a2a2a] to-[#1F1F1F] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        {/* Success State */}
        {step === 4 && successData ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-[#1F1F1F] mb-2">Registration Submitted!</h2>
              <p className="text-gray-600 mb-6">Your registration is pending superadmin approval.</p>
              
              <div className="bg-[#F9F4F4] border-2 border-[#7C1515]/20 rounded-xl p-6 mb-6 text-left">
                <p className="text-sm text-gray-600 mb-2"><strong>Organization Code:</strong></p>
                <p className="text-2xl font-bold text-[#7C1515] font-mono break-all mb-4">{successData.organizationCode}</p>
                
                <p className="text-xs text-gray-500 mb-4">Save this code! You'll need it to check your registration status and login once approved.</p>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(successData.organizationCode);
                    toast.success("Code copied to clipboard!");
                  }}
                  className="w-full bg-[#7C1515] hover:bg-[#5A0E0E] text-white py-3 rounded-lg font-semibold transition"
                >
                  Copy Code
                </button>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-left mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong>
                  <br />1. Save your organization code
                  <br />2. Wait for superadmin approval (usually 24-48 hours)
                  <br />3. Check status at: <span className="font-mono text-blue-600">/registration-status</span>
                  <br />4. Once approved, login with your admin credentials
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/registration-status")}
                  className="flex-1 bg-[#7C1515] hover:bg-[#5A0E0E] text-white py-3 rounded-lg font-semibold transition"
                >
                  Check Status
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold transition"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Form Layout - Split Screen */
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
                      Join the Network of
                      <br />
                      Trusted Healthcare Organizations
                    </h2>
                    <p className="text-white/80 text-lg">
                      Register your organization to access our comprehensive blood management platform and save more lives.
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
                      <p className="text-white/90">Real-time blood availability tracking across the network</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-white/90">Streamlined workflows for managing blood requests & donations</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-white/90">Comprehensive analytics dashboard with detailed reports</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-white/90">Secure, HIPAA-compliant data management system</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="pt-6 border-t border-white/20">
                  <p className="text-white/70 text-sm">
                    Have questions? <button onClick={() => navigate("/")} className="text-white hover:underline font-semibold">Contact Support</button>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F]">Register Your Organization</h1>
                    <button
                      onClick={() => navigate("/")}
                      className="text-gray-500 hover:text-[#7C1515] transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600">Complete the registration process to get your organization code</p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {[
                      { num: 1, label: "Organization Details" },
                      { num: 2, label: "License Info" },
                      { num: 3, label: "Admin Setup" }
                    ].map((item, idx) => (
                      <div key={item.num} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                              step >= item.num
                                ? "bg-[#7C1515] text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {item.num}
                          </div>
                          <p className="text-xs text-gray-600 mt-2 text-center hidden sm:block">{item.label}</p>
                        </div>
                        {idx < 2 && (
                          <div className={`h-1 flex-1 mx-2 rounded ${step > item.num ? "bg-[#7C1515]" : "bg-gray-200"}`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    {errors.map((error, idx) => (
                      <p key={idx} className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Organization Details */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Organization Name <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleChange}
                          placeholder="e.g., Delhi Central Hospital"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Organization Type <span className="text-[#7C1515]">*</span>
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        >
                          <option value="hospital">Hospital</option>
                          <option value="bloodbank">Blood Bank</option>
                          <option value="ngo">NGO</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Organization Email <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="organization@example.com"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Phone Number <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                            City <span className="text-[#7C1515]">*</span>
                          </label>
                          <input
                            type="text"
                            name="location.city"
                            value={formData.location.city}
                            onChange={handleChange}
                            placeholder="Delhi"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                            State <span className="text-[#7C1515]">*</span>
                          </label>
                          <input
                            type="text"
                            name="location.state"
                            value={formData.location.state}
                            onChange={handleChange}
                            placeholder="Delhi"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Address (Optional)
                        </label>
                        <input
                          type="text"
                          name="location.address"
                          value={formData.location.address}
                          onChange={handleChange}
                          placeholder="123 Medical Lane"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Pincode (Optional)
                        </label>
                        <input
                          type="text"
                          name="location.pincode"
                          value={formData.location.pincode}
                          onChange={handleChange}
                          placeholder="110001"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: License Information */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          License Number <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          placeholder="LIC-2024-001"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Government or regulatory license number</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Primary Contact Person <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          placeholder="Full name of contact person"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Admin Details */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                          <strong>📝 Note:</strong> Your password will be auto-generated as <strong>admin123</strong> by the system and sent to your admin email after approval.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Admin Name <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="text"
                          name="adminName"
                          value={formData.adminName}
                          onChange={handleChange}
                          placeholder="Full name"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Admin Email <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="email"
                          name="adminEmail"
                          value={formData.adminEmail}
                          onChange={handleChange}
                          placeholder="admin@organization.com"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold transition"
                      >
                        Previous
                      </button>
                    )}
                    {step < 3 && (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 bg-[#7C1515] hover:bg-[#5A0E0E] text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                      >
                        Next Step
                      </button>
                    )}
                    {step === 3 && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-[#7C1515] hover:bg-[#5A0E0E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full"></div>
                            Submitting...
                          </span>
                        ) : (
                          "Submit Registration"
                        )}
                      </button>
                    )}
                  </div>
                </form>

                {/* Already have account */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already registered? <button onClick={() => navigate("/registration-status")} className="text-[#7C1515] hover:underline font-semibold">Check your status</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
