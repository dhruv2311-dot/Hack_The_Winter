import { useState } from "react";
import toast from "react-hot-toast";

export default function RejectionReasonModal({ isOpen, onClose, onConfirm, requestCode }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate that reason is provided
    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (reason.trim().length < 5) {
      toast.error("Reason must be at least 5 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      // Reset form
      setReason("");
    } catch (error) {
      console.error("Error submitting rejection reason:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Reject Blood Request</h2>
          <p className="text-sm text-gray-600 mt-1">Request Code: {requestCode}</p>
        </div>

        {/* Warning Message */}
        <div className="mb-4 rounded-md bg-[#fde4e4] p-3 border border-[#f5a5ad]">
          <p className="text-sm text-[#9e121c]">
            ⚠️ Please provide a reason for rejecting this request. This will be sent to the hospital.
          </p>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason (e.g., Insufficient stock, Incorrect blood group, etc.)"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
            rows={4}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            {reason.length}/500 characters • Minimum 5 characters required
          </p>
        </div>

        {/* Quick Reason Buttons */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">Quick Reasons:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setReason("Insufficient blood stock available")}
              disabled={isSubmitting}
              className="rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
            >
              Insufficient Stock
            </button>
            <button
              onClick={() => setReason("Incorrect blood group specified")}
              disabled={isSubmitting}
              className="rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
            >
              Wrong Blood Group
            </button>
            <button
              onClick={() => setReason("Request exceeds approved limits")}
              disabled={isSubmitting}
              className="rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
            >
              Exceeds Limits
            </button>
            <button
              onClick={() => setReason("Cannot fulfill at this time")}
              disabled={isSubmitting}
              className="rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
            >
              Cannot Fulfill
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 rounded-lg bg-[#c5114d] px-4 py-2 font-medium text-white transition hover:bg-[#a30f40] disabled:opacity-50"
          >
            {isSubmitting ? "Rejecting..." : "Reject Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
