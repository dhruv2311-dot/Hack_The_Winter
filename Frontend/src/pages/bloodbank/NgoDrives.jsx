import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Briefcase,
  Stethoscope,
  ChevronRight,
  Filter,
  Search
} from "lucide-react";
import { toast } from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { getAllRequests, updateRequestStatus } from "../../services/resourceRequestApi";

export default function NgoDrives() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAllRequests();
      if (res.data?.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching admin requests", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, reason = null) => {
    try {
      const res = await updateRequestStatus(id, status, reason);
      if (res.data?.success) {
        toast.success(`Request ${status} successfully`);
        fetchRequests(); // Refresh
        setRejectModalOpen(false);
        setRejectionReason("");
        setSelectedRequest(null);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openRejectModal = (req) => {
    setSelectedRequest(req);
    setRejectModalOpen(true);
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Inbox</p>
          <h2 className="text-2xl font-bold text-gray-900">Resource Requests</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-gray-50 px-3 py-2 border border-gray-200">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {filteredRequests.map(req => (
          <div key={req._id} className="group flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md hover:border-pink-100">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {getStatusBadge(req.status)}
                <span className="text-xs text-gray-400 font-medium">
                  ID: {req._id.substring(req._id.length - 6).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{req.campName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <span className="font-semibold text-gray-700">{req.organizationName}</span>
                  • {req.organizerName}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-400" /> {req.location || "N/A"}
                </span>
                <span className="flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-lg text-pink-700">
                  <Briefcase className="h-4 w-4" /> Equipment: <b>{req.equipmentCount}</b>
                </span>
                <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700">
                  <Stethoscope className="h-4 w-4" /> Doctors: <b>{req.doctorCount}</b>
                </span>
              </div>

              {req.status === 'rejected' && req.rejectionReason && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm text-red-800">
                  <strong>Rejection Reason:</strong> {req.rejectionReason}
                </div>
              )}
            </div>

            {req.status === 'pending' && (
              <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
                <button
                  onClick={() => openRejectModal(req)}
                  className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(req._id, 'approved')}
                  className="rounded-full bg-[#ff4d6d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#ff3355] shadow-lg shadow-pink-200 transition"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && <div className="text-center py-10">Loading...</div>}
        {!loading && filteredRequests.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            No requests found matching filters.
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <Dialog.Root open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-50 border border-red-100">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
              Reject Request
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting this request.
            </Dialog.Description>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full h-32 rounded-xl border border-gray-200 p-3 text-sm focus:border-red-400 focus:outline-none resize-none mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected', rejectionReason)}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
