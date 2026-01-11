import { useState, useEffect } from "react";
import { getVerifiedBloodBanks } from "../services/bloodBankApi";
import { createBloodRequest, getBloodStockAvailability } from "../services/hospitalBloodRequestApi";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DEPARTMENTS = ["ICU", "Emergency", "Operation Theatre", "Cardiology", "Trauma", "General Ward", "Other"];
const CONDITIONS = ["Critical", "Severe", "Moderate", "Stable"];

export default function CreateBloodRequestModal({ isOpen, onClose, onSuccess, hospitalId, preSelectedBloodBank }) {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bloodStock, setBloodStock] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);

  const [formData, setFormData] = useState({
    bloodBankId: preSelectedBloodBank?.bloodBankId || preSelectedBloodBank?._id || "",
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
      console.log("🩸 Modal opened with preSelectedBloodBank:", preSelectedBloodBank);
      
      // IMPORTANT: Use bloodBankId if available (actual org ID), fallback to _id
      const bankId = preSelectedBloodBank?.bloodBankId || preSelectedBloodBank?._id;
      if (bankId) {
        console.log("✅ Setting bloodBankId to:", bankId);
        setFormData(prev => ({
          ...prev,
          bloodBankId: bankId
        }));
        // Fetch blood stock for pre-selected bank
        fetchBloodStock(bankId);
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
      if (preSelectedBloodBank && preSelectedBloodBank._id) {
        const bankExists = banks.find(b => b._id === preSelectedBloodBank._id);
        console.log("🏥 Pre-selected bank exists in fetched list:", !!bankExists);
        console.log("🏥 Pre-selected bank ID:", preSelectedBloodBank._id);
        console.log("🏥 Fetched banks IDs:", banks.map(b => b._id));
        
        if (!bankExists) {
          console.log("➕ Adding pre-selected bank to list");
          banks = [preSelectedBloodBank, ...banks];
        }
      }
      
      setBloodBanks(banks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blood banks:', err);
      setError('Failed to load blood banks');
      setLoading(false);
    }
  };

  // Fetch blood stock for selected blood bank
  const fetchBloodStock = async (bloodBankId) => {
    if (!bloodBankId) {
      setBloodStock(null);
      return;
    }
    
    try {
      setLoadingStock(true);
      const response = await getBloodStockAvailability(bloodBankId, token);
      if (response.data.success) {
        setBloodStock(response.data.data.availability);
        console.log("✅ Blood stock fetched:", response.data.data.availability);
      }
    } catch (err) {
      console.error('Error fetching blood stock:', err);
      setBloodStock(null);
    } finally {
      setLoadingStock(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Fetch blood stock when blood bank is changed
    if (name === 'bloodBankId' && value) {
      fetchBloodStock(value);
    }
  };

  // Get available units for selected blood group from fetched blood stock
  const getAvailableUnits = () => {
    if (!formData.bloodGroup || !bloodStock) return null;
    return bloodStock[formData.bloodGroup] || 0;
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
      setError(`❌ Cannot proceed: You requested ${formData.unitsRequired} units but only ${availableUnits} units of ${formData.bloodGroup} are available. Please request up to ${availableUnits} units.`);
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
      setBloodStock(null);

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
            {/* Pre-selected Blood Bank Display */}
            {preSelectedBloodBank && (
              <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4">
                <p className="text-xs font-semibold text-green-700 mb-1">🩸 SELECTED BLOOD BANK</p>
                <p className="text-lg font-bold text-green-900">
                  {preSelectedBloodBank.name}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  {preSelectedBloodBank.address?.city || preSelectedBloodBank.city || 'Location'}, {preSelectedBloodBank.address?.state || preSelectedBloodBank.state || ''}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  📋 ID: {preSelectedBloodBank._id}
                </p>
              </div>
            )}
            
            {/* Blood Bank Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#2f1012] mb-2">
                {preSelectedBloodBank ? "Blood Bank (Pre-selected)" : "Select Blood Bank *"}
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
              
              {/* Loading stock indicator */}
              {loadingStock && formData.bloodBankId && (
                <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></span>
                  Fetching blood stock information...
                </p>
              )}
              
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
              
              {/* Load Stock Availability Message */}
              {loadingStock && formData.bloodGroup && (
                <div className="mt-3 rounded-xl border-2 border-blue-300 bg-blue-50 p-3 text-sm">
                  <p className="text-blue-800 flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></span>
                    Fetching blood stock availability...
                  </p>
                </div>
              )}

              {/* Show available units if blood group is selected */}
              {!loadingStock && formData.bloodGroup && bloodStock && (
                <div className={`mt-3 rounded-xl border-2 p-4 text-sm transition-all duration-300 ${
                  availableUnits > 0 
                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-[0_4px_12px_rgba(34,197,94,0.15)]' 
                    : 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50 text-red-800 shadow-[0_4px_12px_rgba(239,68,68,0.15)]'
                }`}>
                  <p className="font-bold text-base mb-1">
                    {availableUnits > 0 
                      ? `✅ Stock Available` 
                      : `⚠️ Out of Stock`}
                  </p>
                  <p className="font-semibold text-lg">
                    {availableUnits} units of {formData.bloodGroup}
                  </p>
                  {availableUnits > 0 && (
                    <p className="text-xs mt-2 opacity-90">
                      💡 You can request up to <strong>{availableUnits} units</strong> of this blood type. Requesting more than available will be rejected.
                    </p>
                  )}
                  {availableUnits === 0 && (
                    <p className="text-xs mt-2 opacity-90">
                      Please select a different blood bank or blood group with available stock.
                    </p>
                  )}
                </div>
              )}

              {/* Show message if stock data not loaded yet */}
              {!loadingStock && formData.bloodGroup && !bloodStock && formData.bloodBankId && (
                <div className="mt-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="font-semibold">⏳ Select a blood group to see availability</p>
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
                max={availableUnits || "50"}
                required
                placeholder="Enter number of units"
                className={`w-full rounded-xl border px-4 py-3 text-[#2f1012] focus:border-[#8f0f1a] focus:outline-none focus:ring-2 transition-all ${
                  availableUnits !== null && formData.unitsRequired && parseInt(formData.unitsRequired) > availableUnits
                    ? 'border-red-400 bg-red-50 focus:ring-red-200'
                    : 'border-[#f3c9c0] bg-white focus:ring-[#8f0f1a]/20'
                }`}
              />
              
              {/* Real-time validation message */}
              {availableUnits !== null && formData.unitsRequired && (
                <div className={`mt-3 rounded-xl border-2 p-3 text-sm transition-all duration-200 ${
                  parseInt(formData.unitsRequired) > availableUnits
                    ? 'border-red-400 bg-red-50 text-red-800'
                    : parseInt(formData.unitsRequired) === availableUnits
                    ? 'border-blue-400 bg-blue-50 text-blue-800'
                    : parseInt(formData.unitsRequired) > 0
                    ? 'border-green-400 bg-green-50 text-green-800'
                    : 'border-amber-400 bg-amber-50 text-amber-800'
                }`}>
                  {parseInt(formData.unitsRequired) > availableUnits ? (
                    <p className="font-semibold flex items-center gap-2">
                      <span className="text-lg">❌</span>
                      <span>Cannot request {formData.unitsRequired} units - only {availableUnits} available</span>
                    </p>
                  ) : parseInt(formData.unitsRequired) === availableUnits ? (
                    <p className="font-semibold flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <span>All available units ({availableUnits}) will be requested</span>
                    </p>
                  ) : parseInt(formData.unitsRequired) > 0 ? (
                    <p className="font-semibold flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      <span>{formData.unitsRequired} of {availableUnits} units - Valid request</span>
                    </p>
                  ) : (
                    <p className="font-semibold">Enter the number of units you need (1 to {availableUnits})</p>
                  )}
                </div>
              )}
              {!availableUnits && formData.bloodGroup && (
                <p className="mt-2 text-xs text-red-600 font-semibold">
                  ⚠️ Selected blood type is not available. Choose a different blood bank or blood group.
                </p>
              )}
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
