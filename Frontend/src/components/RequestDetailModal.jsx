import { useState, useEffect } from "react";
import { getBloodRequestById } from "../services/hospitalBloodRequestApi";
import toast from "react-hot-toast";

const urgencyColors = {
  CRITICAL: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", badge: "bg-red-100" },
  HIGH: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-800", badge: "bg-orange-100" },
  MEDIUM: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-800", badge: "bg-yellow-100" },
  LOW: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", badge: "bg-blue-100" },
};

const statusColors = {
  PENDING: { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-800", badge: "bg-gray-100" },
  ACCEPTED: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800", badge: "bg-green-100" },
  COMPLETED: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", badge: "bg-blue-100" },
  REJECTED: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", badge: "bg-red-100" },
};

const formatDate = (iso) => {
  if (!iso) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
};

const calculateTimeElapsed = (requestedAt) => {
  if (!requestedAt) return "N/A";
  const now = new Date();
  const requested = new Date(requestedAt);
  const diffMs = now - requested;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "< 1 min ago";
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function RequestDetailModal({ isOpen, onClose, requestId, token }) {
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestDetails();
    }
  }, [isOpen, requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await getBloodRequestById(requestId, token);
      if (response.data.success) {
        setRequest(response.data.data);
      } else {
        toast.error("Failed to load request details");
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      toast.error("Error loading request details");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const urgencyStyle = urgencyColors[request?.urgency] || urgencyColors.MEDIUM;
  const statusStyle = statusColors[request?.status] || statusColors.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/80 bg-white p-8 shadow-[0_25px_60px_rgba(77,10,15,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-2xl text-[#8b6161] hover:text-[#8f0f1a] transition"
        >
          ×
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#8f0f1a] border-r-transparent"></div>
              <p className="mt-4 text-sm text-[#7a4c4c]">Loading request details...</p>
            </div>
          </div>
        ) : request ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-[#f3c9c0] pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[#8f0f1a]">
                    Request Details
                  </p>
                  <h2 className="text-3xl font-bold text-[#2f1012]">
                    {request.requestCode}
                  </h2>
                  <p className="mt-2 text-sm text-[#7a4c4c]">
                    Requested: {formatDate(request.requestedAt)} ({calculateTimeElapsed(request.requestedAt)})
                  </p>
                </div>

                {/* Status & Urgency Badges */}
                <div className="flex flex-col gap-2">
                  <div className={`px-4 py-2 rounded-full text-xs font-bold text-center ${statusStyle.badge} ${statusStyle.text}`}>
                    Status: {request.status}
                  </div>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold text-center ${urgencyStyle.badge} ${urgencyStyle.text}`}>
                    Urgency: {request.urgency}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Blood Details */}
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-[#f3c9c0] bg-[#fef9f8] p-4">
                  <h3 className="text-sm font-bold text-[#2f1012] mb-4">🩸 Blood Request Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#7a4c4c] font-semibold mb-1">Blood Group</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#8f0f1a]">{request.bloodGroup}</span>
                        <span className="text-xs text-[#7a4c4c]">({request.component || 'WHOLE_BLOOD'})</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#f3c9c0]">
                      <p className="text-xs text-[#7a4c4c] font-semibold mb-1">Units Required</p>
                      <p className="text-xl font-bold text-[#2f1012]">{request.unitsRequired} units</p>
                    </div>

                    <div className="pt-3 border-t border-[#f3c9c0]">
                      <p className="text-xs text-[#7a4c4c] font-semibold mb-1">Units Fulfilled</p>
                      <p className="text-lg font-semibold text-[#1f7a3a]">{request.unitsFulfilled || 0} units</p>
                    </div>
                  </div>
                </div>

                {/* Priority Information */}
                <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4">
                  <h3 className="text-sm font-bold text-purple-900 mb-4">📊 Priority Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-purple-800 font-semibold mb-1">Priority Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-purple-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${Math.min((request.priorityScore / 255) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-purple-900">{request.priorityScore}/255</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-purple-800 font-semibold mb-1">Priority Category</p>
                      <p className="text-sm font-bold text-purple-900">{request.priorityCategory}</p>
                    </div>

                    <div>
                      <p className="text-xs text-purple-800 font-semibold mb-1">Calculated At</p>
                      <p className="text-xs text-purple-800">{formatDate(request.priorityCalculatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Patient Details */}
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-4">👤 Patient Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-800 font-semibold mb-1">Age</p>
                      <p className="text-xl font-bold text-blue-900">{request.patientInfo?.age || request.patientAge || "N/A"} years</p>
                    </div>

                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-800 font-semibold mb-1">Gender</p>
                      <p className="text-sm font-semibold text-blue-900">{request.patientInfo?.gender || "Not specified"}</p>
                    </div>

                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-800 font-semibold mb-1">Condition</p>
                      <p className="text-sm font-semibold text-blue-900">{request.patientInfo?.condition || "Not specified"}</p>
                    </div>

                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-800 font-semibold mb-1">Department/Ward</p>
                      <p className="text-sm font-semibold text-blue-900">{request.patientInfo?.department || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Details */}
                <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4">
                  <h3 className="text-sm font-bold text-green-900 mb-4">🏥 Medical Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-green-800 font-semibold mb-1">Medical Reason / Diagnosis</p>
                      <p className="text-sm text-green-900 break-words">
                        {request.medicalReason ? request.medicalReason.replace(/\s*\[Auto-calculated.*\]/, '') : "Not provided"}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-green-200">
                      <p className="text-xs text-green-800 font-semibold mb-1">Hospital Notes</p>
                      <p className="text-sm text-green-900 break-words">
                        {request.hospitalNotes ? request.hospitalNotes.replace(/\s*\[Auto-calculated.*\]/, '') : "No notes"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Details Breakdown */}
            {request.priorityDetails && (
              <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4">
                <h3 className="text-sm font-bold text-orange-900 mb-4">📈 Priority Calculation Breakdown</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Urgency */}
                  <div className="text-center">
                    <p className="text-xs text-orange-800 font-semibold mb-2">Urgency</p>
                    <div className="flex justify-center gap-2">
                      <div>
                        <p className="text-lg font-bold text-orange-900">{request.priorityDetails.urgency?.raw || 0}</p>
                        <p className="text-xs text-orange-700">raw</p>
                      </div>
                      <span className="text-orange-400">→</span>
                      <div>
                        <p className="text-lg font-bold text-orange-900">{request.priorityDetails.urgency?.weighted || 0}</p>
                        <p className="text-xs text-orange-700">weighted (×{request.priorityDetails.urgency?.weight})</p>
                      </div>
                    </div>
                  </div>

                  {/* Rarity */}
                  <div className="text-center">
                    <p className="text-xs text-orange-800 font-semibold mb-2">Rarity</p>
                    <div className="flex justify-center gap-2">
                      <div>
                        <p className="text-lg font-bold text-orange-900">{request.priorityDetails.rarity?.raw || 0}</p>
                        <p className="text-xs text-orange-700">raw</p>
                      </div>
                      <span className="text-orange-400">→</span>
                      <div>
                        <p className="text-lg font-bold text-orange-900">{request.priorityDetails.rarity?.weighted || 0}</p>
                        <p className="text-xs text-orange-700">weighted (×{request.priorityDetails.rarity?.weight})</p>
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="text-center">
                    <p className="text-xs text-orange-800 font-semibold mb-2">Time Since Request</p>
                    <div className="flex justify-center gap-2">
                      <div>
                        <p className="text-lg font-bold text-orange-900">{request.priorityDetails.time?.minutesOld || 0}</p>
                        <p className="text-xs text-orange-700">mins</p>
                      </div>
                      <span className="text-orange-400">→</span>
                      <div>
                        <p className="text-lg font-bold text-orange-900">{request.priorityDetails.time?.weighted || 0}</p>
                        <p className="text-xs text-orange-700">weighted (×{request.priorityDetails.time?.weight})</p>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="text-center">
                    <p className="text-xs text-orange-800 font-semibold mb-2">Availability</p>
                    <div className="flex justify-center gap-2">
                      <div>
                        <p className="text-lg font-bold text-orange-900">{request.priorityDetails.availability?.currentUnits || 0}</p>
                        <p className="text-xs text-orange-700">units</p>
                      </div>
                      <span className="text-orange-400">→</span>
                      <div>
                        <p className="text-lg font-bold text-orange-900">{request.priorityDetails.availability?.weighted || 0}</p>
                        <p className="text-xs text-orange-700">weighted (×{request.priorityDetails.availability?.weight})</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-4">📅 Request Timeline</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700">Requested:</span>
                  <span className="font-semibold text-slate-900">{formatDate(request.requestedAt)}</span>
                </div>
                
                {request.acceptedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-700">Accepted:</span>
                    <span className="font-semibold text-green-700">{formatDate(request.acceptedAt)}</span>
                  </div>
                )}

                {request.fulfilledAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-700">Fulfilled:</span>
                    <span className="font-semibold text-blue-700">{formatDate(request.fulfilledAt)}</span>
                  </div>
                )}

                {request.rejectedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-700">Rejected:</span>
                    <span className="font-semibold text-red-700">{formatDate(request.rejectedAt)}</span>
                  </div>
                )}

                {request.cancelledAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-700">Cancelled:</span>
                    <span className="font-semibold text-orange-700">{formatDate(request.cancelledAt)}</span>
                  </div>
                )}

                {request.status === "REJECTED" && request.rejectionReason && (
                  <div className="pt-2 border-t border-slate-300">
                    <p className="text-xs text-slate-700 font-semibold">Rejection Reason:</p>
                    <p className="text-slate-900">{request.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Blood Bank Response */}
            {request.bloodBankResponse && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4">
                <h3 className="text-sm font-bold text-indigo-900 mb-2">💬 Blood Bank Response</h3>
                <p className="text-sm text-indigo-900 break-words">{request.bloodBankResponse}</p>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-4 border-t border-[#f3c9c0]">
              <button
                onClick={onClose}
                className="w-full rounded-full bg-gradient-to-r from-[#8f0f1a] to-[#c62832] px-6 py-3 font-semibold text-white shadow-[0_15px_35px_rgba(143,15,26,0.25)] transition hover:scale-105"
              >
                Close Details
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#7a4c4c]">No request details available</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-full bg-[#8f0f1a] px-6 py-2 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
