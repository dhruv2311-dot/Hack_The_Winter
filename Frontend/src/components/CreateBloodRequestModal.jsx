import { useState, useEffect } from "react";
import { getVerifiedBloodBanks } from "../services/bloodBankApi";
import { createBloodRequest } from "../services/hospitalBloodRequestApi";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DEPARTMENTS = ["ICU", "Emergency", "Operation Theatre", "Cardiology", "Trauma", "General Ward", "Other"];
const CONDITIONS = ["Critical", "Severe", "Moderate", "Stable"];

export default function CreateBloodRequestModal({ isOpen, onClose, onSuccess, hospitalId, preSelectedBloodBank }) {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    bloodBankId: preSelectedBloodBank?._id || "",
    bloodGroup: "",
    unitsRequired: "",
    patientAge: "",
    patientCondition: "Stable",
    department: "General Ward",
    medicalReason: ""
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen) {
      if (preSelectedBloodBank) {
         setFormData(prev => ({ ...prev, bloodBankId: preSelectedBloodBank._id }));
      }
      fetchBloodBanks();
    }
  }, [isOpen, preSelectedBloodBank]);

  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVerifiedBloodBanks();
      let banks = response.data.data?.bloodBanks || [];
      
      // If we have a pre-selected bank, ensure it is in the list so the label shows up
      if (preSelectedBloodBank && !banks.find(b => b._id === preSelectedBloodBank._id)) {
          banks = [preSelectedBloodBank, ...banks];
      }
      
      setBloodBanks(banks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blood banks:', err);
      setError('Failed to load blood banks');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get available units for selected blood bank and blood group
  const getAvailableUnits = () => {
    if (!formData.bloodBankId || !formData.bloodGroup) return null;
    
    const selectedBank = bloodBanks.find(b => b._id === formData.bloodBankId) || preSelectedBloodBank;
    if (!selectedBank || !selectedBank.bloodStock) return null;
    
    const stock = selectedBank.bloodStock[formData.bloodGroup];
    return stock?.units || 0;
  };

  const availableUnits = getAvailableUnits();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Handling submit...', formData);
    
    // Validation
    if (!formData.bloodBankId) {
      setError('Please select a blood bank');
      return;
    }
    if (!formData.bloodGroup) {
      setError('Please select a blood group');
      return;
    }
    if (!formData.unitsRequired || formData.unitsRequired <= 0) {
      setError('Please enter valid number of units');
      return;
    }

    // Check if requested units exceed available stock
    if (availableUnits !== null && parseInt(formData.unitsRequired) > availableUnits) {
      setError(`Requested units (${formData.unitsRequired}) exceed available stock (${availableUnits} units). Please request ${availableUnits} units or less.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const requestData = {
        hospitalId: hospitalId,
        bloodBankId: formData.bloodBankId,
        bloodGroup: formData.bloodGroup,
        unitsRequired: parseInt(formData.unitsRequired),
        patientAge: parseInt(formData.patientAge),
        patientCondition: formData.patientCondition,
        department: formData.department,
        medicalReason: formData.medicalReason
      };

      await createBloodRequest(requestData, token);
      
      // Reset form
      setFormData({
        bloodBankId: "",
        bloodGroup: "",
        unitsRequired: "",
        patientAge: "",
        patientCondition: "Stable",
        department: "General Ward",
        medicalReason: ""
      });

      setSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating blood request:', err);
      setError(err.response?.data?.message || 'Failed to create blood request');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/80 bg-white p-8 shadow-[0_25px_60px_rgba(77,10,15,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-2xl text-[#8b6161] hover:text-[#8f0f1a] transition"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8f0f1a]">
            New Request
          </p>
          <h2 className="text-3xl font-bold text-[#2f1012]">
            Create Blood Request
          </h2>
          <p className="mt-2 text-sm text-[#7a4c4c]">
            Submit an emergency blood request to a verified blood bank
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#8f0f1a] border-r-transparent"></div>
              <p className="mt-4 text-sm text-[#7a4c4c]">Loading blood banks...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Bank Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#2f1012] mb-2">
                Select Blood Bank *
              </label>
              <select
                name="bloodBankId"
                value={formData.bloodBankId}
                onChange={handleChange}
                required
                disabled={!!preSelectedBloodBank}
                className={`w-full rounded-xl border border-[#f3c9c0] bg-white px-4 py-3 text-[#2f1012] focus:border-[#8f0f1a] focus:outline-none focus:ring-2 focus:ring-[#8f0f1a]/20 ${preSelectedBloodBank ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">-- Choose a Blood Bank --</option>
                {bloodBanks.map((bank) => (
                  <option key={bank._id} value={bank._id}>
                    {bank.name} - {bank.address?.city || bank.city}, {bank.address?.state || bank.state}
                  </option>
                ))}
              </select>
              {bloodBanks.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No verified blood banks available. Please try again later.
                </p>
              )}
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-semibold text-[#2f1012] mb-2">
                Blood Group *
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#f3c9c0] bg-white px-4 py-3 text-[#2f1012] focus:border-[#8f0f1a] focus:outline-none focus:ring-2 focus:ring-[#8f0f1a]/20"
              >
                <option value="">-- Select Blood Group --</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {/* Show available units if blood bank and blood group are selected */}
              {availableUnits !== null && formData.bloodGroup && (
                <div className={`mt-3 rounded-xl border-2 p-3 text-sm ${
                  availableUnits > 0 
                    ? 'border-green-300 bg-green-50 text-green-800' 
                    : 'border-amber-300 bg-amber-50 text-amber-800'
                }`}>
                  <p className="font-semibold">
                    {availableUnits > 0 
                      ? `✓ Available: ${availableUnits} units of ${formData.bloodGroup}` 
                      : `⚠️ No ${formData.bloodGroup} units available at this blood bank`}
                  </p>
                  {availableUnits > 0 && (
                    <p className="text-xs mt-1">You can request up to {availableUnits} units</p>
                  )}
                </div>
              )}
            </div>

            {/* Units Required */}
            <div>
              <label className="block text-sm font-semibold text-[#2f1012] mb-2">
                Units Required *
              </label>
              <input
                type="number"
                name="unitsRequired"
                value={formData.unitsRequired}
                onChange={handleChange}
                min="1"
                max="50"
                required
                placeholder="Enter number of units"
                className="w-full rounded-xl border border-[#f3c9c0] bg-white px-4 py-3 text-[#2f1012] focus:border-[#8f0f1a] focus:outline-none focus:ring-2 focus:ring-[#8f0f1a]/20"
              />
            </div>

            {/* Patient Age */}
            <div>
              <label className="block text-sm font-semibold text-[#2f1012] mb-2">
                Patient Age (Years) *
              </label>
              <input
                type="number"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleChange}
                min="0"
                max="120"
                required
                placeholder="Enter patient age"
                className="w-full rounded-xl border border-[#f3c9c0] bg-white px-4 py-3 text-[#2f1012] focus:border-[#8f0f1a] focus:outline-none focus:ring-2 focus:ring-[#8f0f1a]/20"
              />
            </div>

            {/* Patient Condition */}
            <div>
              <label className="block text-sm font-semibold text-[#2f1012] mb-2">
                Patient Condition *
              </label>
              <select
                name="patientCondition"
                value={formData.patientCondition}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#f3c9c0] bg-white px-4 py-3 text-[#2f1012] focus:border-[#8f0f1a] focus:outline-none focus:ring-2 focus:ring-[#8f0f1a]/20"
              >
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-[#2f1012] mb-2">
                Department/Ward *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#f3c9c0] bg-white px-4 py-3 text-[#2f1012] focus:border-[#8f0f1a] focus:outline-none focus:ring-2 focus:ring-[#8f0f1a]/20"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Medical Reason */}
            <div>
              <label className="block text-sm font-semibold text-[#2f1012] mb-2">
                Medical Reason/Diagnosis (Optional)
              </label>
              <textarea
                name="medicalReason"
                value={formData.medicalReason}
                onChange={handleChange}
                rows="3"
                placeholder="e.g., Trauma case, Childbirth complications, Surgery preparation..."
                className="w-full rounded-xl border border-[#f3c9c0] bg-white px-4 py-3 text-[#2f1012] focus:border-[#8f0f1a] focus:outline-none focus:ring-2 focus:ring-[#8f0f1a]/20"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border-2 border-[#f3c9c0] px-6 py-3 font-semibold text-[#7a4c4c] transition hover:border-[#8f0f1a] hover:text-[#8f0f1a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-full bg-gradient-to-r from-[#8f0f1a] to-[#c62832] px-6 py-3 font-semibold text-white shadow-[0_15px_35px_rgba(143,15,26,0.25)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {submitting ? "Creating..." : "Create Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
