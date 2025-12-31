import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function DonorRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [campsLoading, setCampsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [camps, setCamps] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    mobileNumber: "",
    city: "",
    address: "",
    email: "",
    donationDate: "",
    donationTime: "",
    campId: "",
    slotId: "",
  });

  const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const genders = ["Male", "Female", "Other"];

  // Fetch available camps
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/public/camps");
        if (response.data.success && response.data.camps) {
          setCamps(response.data.camps);
        }
      } catch (error) {
        console.error("Error fetching camps:", error);
        toast.error("Failed to load available camps");
      } finally {
        setCampsLoading(false);
      }
    };
    fetchCamps();
  }, []);

  // Fetch slots when camp is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedCamp) {
        setSlots([]);
        setSelectedSlot(null);
        return;
      }

      setSlotsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/public/camps/${selectedCamp._id}/slots`
        );
        if (response.data.success && response.data.slots) {
          setSlots(response.data.slots);
          setSelectedSlot(null);
        } else {
          setSlots([]);
          toast.info("No time slots available for this camp");
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        toast.error("Failed to load time slots");
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedCamp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCampSelection = (camp) => {
    setSelectedCamp(camp);
    setFormData((prev) => ({
      ...prev,
      campId: camp._id.toString(),
    }));
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
    setFormData((prev) => ({
      ...prev,
      slotId: slot._id.toString(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.gender || !formData.bloodGroup || !formData.mobileNumber || !formData.city || !formData.donationDate || !selectedCamp || !selectedSlot) {
      toast.error("Please fill in all required fields including camp and time slot selection");
      return;
    }

    if (formData.age < 18 || formData.age > 65) {
      toast.error("Age must be between 18 and 65 years");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    const selectedDate = new Date(formData.donationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Please select a future date for donation");
      return;
    }

    setLoading(true);

    try {
      const nextDonationDate = new Date(formData.donationDate);
      nextDonationDate.setDate(nextDonationDate.getDate() + 90);

      const response = await axios.post("http://localhost:5000/api/donor/register", {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        mobileNumber: formData.mobileNumber,
        city: formData.city,
        address: formData.address,
        email: formData.email,
        donationDate: formData.donationDate,
        donationTime: selectedSlot.slotTime,
        nextDonationDate: nextDonationDate.toISOString().split('T')[0],
        campId: formData.campId,
        slotId: formData.slotId,
        campName: selectedCamp.campName,
        campLocation: selectedCamp.location,
      });

      toast.success("Registration successful! You are now registered as a blood donor.");
      
      setFormData({
        name: "",
        age: "",
        gender: "",
        bloodGroup: "",
        mobileNumber: "",
        city: "",
        address: "",
        email: "",
        donationDate: "",
        donationTime: "",
        campId: "",
        slotId: "",
      });
      setSelectedCamp(null);
      setSelectedSlot(null);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F4F4]">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Back Button */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-[#7C1515] transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Home</span>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C1515] to-[#5A0E0E] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🩸</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#7C1515]">BloodLink</h1>
                  <p className="text-xs text-gray-600">Donor Registration</p>
                </div>
              </div>

              <div className="w-32"></div>
            </div>
          </div>
        </nav>

        {/* Form Container */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C1515]/10 border border-[#7C1515]/20 mb-6">
                <span className="text-2xl">🩸</span>
                <span className="text-sm text-[#7C1515] font-semibold">Save Lives, Donate Blood</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[#1F1F1F]">
                Become a <span className="text-[#7C1515]">Blood Donor</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Join thousands of heroes saving lives through blood donation
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h2 className="text-xl font-bold text-[#1F1F1F] mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#7C1515] text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                    Personal Information
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                        Full Name <span className="text-[#7C1515]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        required
                      />
                    </div>

                    {/* Age and Gender */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Age <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="18-65 years"
                          min="18"
                          max="65"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Gender <span className="text-[#7C1515]">*</span>
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                          required
                        >
                          <option value="">Select Gender</option>
                          {genders.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                        Blood Group <span className="text-[#7C1515]">*</span>
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        required
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mobile and City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          Mobile Number <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          placeholder="10 digit number"
                          pattern="\d{10}"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                          City <span className="text-[#7C1515]">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Your city"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                        Address (Optional)
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Your street address"
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all resize-none"
                      ></textarea>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] placeholder-gray-400 focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Camp Selection Section */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-[#1F1F1F] mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#7C1515] text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                    Select Blood Donation Camp
                  </h2>
                  
                  {campsLoading ? (
                    <div className="text-center py-8 bg-[#F9F4F4] rounded-lg">
                      <div className="animate-spin w-10 h-10 border-4 border-[#7C1515] border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-gray-600">Loading camps...</p>
                    </div>
                  ) : camps.length === 0 ? (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                      <p className="text-yellow-800 font-semibold">⚠️ No camps available at the moment. Please check back later.</p>
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedCamp ? selectedCamp._id.toString() : ""}
                        onChange={(e) => {
                          const campId = e.target.value;
                          const camp = camps.find(c => c._id.toString() === campId);
                          if (camp) {
                            handleCampSelection(camp);
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        required
                      >
                        <option value="">-- Select a Camp --</option>
                        {camps.map((camp) => (
                          <option key={camp._id} value={camp._id.toString()}>
                            {camp.campName} - {camp.location} ({new Date(camp.startDate).toLocaleDateString()})
                          </option>
                        ))}
                      </select>

                      {selectedCamp && (
                        <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                          <p className="text-green-800">
                            ✓ Selected: <strong>{selectedCamp.campName}</strong> - {selectedCamp.location}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Donation Details Section */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-[#1F1F1F] mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#7C1515] text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                    Donation Details
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                        Preferred Donation Date <span className="text-[#7C1515]">*</span>
                      </label>
                      <input
                        type="date"
                        name="donationDate"
                        value={formData.donationDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                        required
                      />
                      {formData.donationDate && (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✅ Next eligible donation: {new Date(new Date(formData.donationDate).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1F1F1F] mb-2">
                        Preferred Time Slot <span className="text-[#7C1515]">*</span>
                      </label>
                      {!selectedCamp ? (
                        <div className="p-4 bg-[#F9F4F4] border-2 border-gray-300 rounded-lg">
                          <p className="text-gray-600 text-sm">Please select a camp first to see available time slots</p>
                        </div>
                      ) : slotsLoading ? (
                        <div className="p-4 bg-[#F9F4F4] border-2 border-gray-300 rounded-lg">
                          <p className="text-gray-600 text-sm">Loading time slots...</p>
                        </div>
                      ) : slots.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                          <p className="text-yellow-800 text-sm font-semibold">No available time slots for this camp</p>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedSlot ? selectedSlot._id.toString() : ""}
                            onChange={(e) => {
                              const slotId = e.target.value;
                              const slot = slots.find(s => s._id.toString() === slotId);
                              if (slot) {
                                handleSlotSelection(slot);
                              }
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[#1F1F1F] focus:outline-none focus:border-[#7C1515] focus:ring-2 focus:ring-[#7C1515]/20 transition-all"
                            required
                          >
                            <option value="">-- Select a Time Slot --</option>
                            {slots.map((slot) => (
                              <option 
                                key={slot._id} 
                                value={slot._id.toString()}
                                disabled={slot.availableSpots <= 0}
                              >
                                {slot.slotTime} ({slot.availableSpots} spots available)
                              </option>
                            ))}
                          </select>
                          {selectedSlot && (
                            <p className="text-xs text-green-600 mt-2 font-medium">
                              ✅ Selected Slot: {selectedSlot.slotTime}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-[#F9F4F4] border-2 border-gray-300 rounded-lg p-5">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">ℹ️</span>
                      <div>
                        <p className="text-sm text-[#1F1F1F] font-semibold mb-1">Requirements:</p>
                        <p className="text-sm text-gray-600">
                          You must be 18-65 years old and in good health to donate blood. A valid ID will be required at the time of donation.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">✅</span>
                      <div>
                        <p className="text-sm text-[#1F1F1F] font-semibold mb-1">90-Day Rule:</p>
                        <p className="text-sm text-gray-600">
                          After each donation, you must wait 90 days before your next donation to ensure your health and safety.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7C1515] hover:bg-[#5A0E0E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full"></div>
                      Registering...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full text-center text-gray-600 hover:text-[#7C1515] transition-colors py-2 font-medium"
                >
                  Cancel
                </button>
              </form>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-8 text-gray-600 text-sm">
              <p>🔒 Your information is secure and will only be used for donation coordination</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
