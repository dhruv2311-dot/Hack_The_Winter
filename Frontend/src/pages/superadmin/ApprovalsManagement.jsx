import { useState, useEffect } from 'react';
import { approvalService } from '../../services/adminService';
import { Check, X, Eye, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApprovalsManagement() {
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionModal, setActionModal] = useState(null); // 'approve', 'reject', or null
  const [actionData, setActionData] = useState({ remarks: '', reason: '' });
  const [filters, setFilters] = useState({
    type: 'all',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchApprovals();
    fetchStats();
  }, [filters]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response =
        filters.type === 'all'
          ? await approvalService.getAllPendingApprovals()
          : await approvalService.getPendingApprovals(filters.type);

      setApprovals(response.data.data || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch approvals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await approvalService.getApprovalStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const viewDetails = async (approvalId) => {
    try {
      const response = await approvalService.getOrganizationDetails(approvalId);
      setSelectedApproval(response.data.data);
      setDetailsOpen(true);
    } catch (error) {
      toast.error('Failed to fetch approval details');
    }
  };

  const handleApprove = async () => {
    if (!actionData.remarks.trim()) {
      toast.error('Approval remarks are required');
      return;
    }

    try {
      await approvalService.approveOrganization({
        organizationCode: selectedApproval.organizationCode,
        approvalRemarks: actionData.remarks,
      });
      toast.success('Organization approved successfully');
      setActionModal(null);
      setActionData({ remarks: '', reason: '' });
      setDetailsOpen(false);
      fetchApprovals();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve organization');
    }
  };

  const handleReject = async () => {
    if (!actionData.reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await approvalService.rejectOrganization({
        organizationCode: selectedApproval.organizationCode,
        rejectionReason: actionData.reason,
      });
      toast.success('Organization rejected successfully');
      setActionModal(null);
      setActionData({ remarks: '', reason: '' });
      setDetailsOpen(false);
      fetchApprovals();
      fetchStats();
    } catch (error) {
      toast.error('Failed to reject organization');
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      hospital: '🏥',
      bloodbank: '🩸',
      ngo: '❤️',
    };
    return icons[type.toLowerCase()] || '📋';
  };

  const getTypeBadge = (type) => {
    const colors = {
      hospital: 'bg-blue-100 text-blue-800',
      bloodbank: 'bg-red-100 text-red-800',
      ngo: 'bg-green-100 text-green-800',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Approvals & Requests</h1>
        <p className="text-gray-600 mt-2">Review and manage pending organization approvals</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Pending</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPending || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting review</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Hospitals</p>
            <p className="text-3xl font-bold text-gray-900">{stats.hospitalsPending || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Pending approval</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Blood Banks</p>
            <p className="text-3xl font-bold text-gray-900">{stats.bloodbanksPending || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Pending approval</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">NGOs</p>
            <p className="text-3xl font-bold text-gray-900">{stats.ngosPending || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Pending approval</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Types</option>
            <option value="hospital">Hospitals</option>
            <option value="bloodbank">Blood Banks</option>
            <option value="ngo">NGOs</option>
          </select>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        ) : approvals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No pending approvals</p>
            <p className="text-gray-500 text-sm mt-1">All organizations have been reviewed</p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div
              key={approval._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="text-4xl">{getTypeIcon(approval.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {approval.organizationName || 'Unknown'}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getTypeBadge(approval.type)}`}>
                        {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{approval.organizationCode}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Contact</p>
                        <p className="text-gray-900 font-medium">{approval.email}</p>
                        <p className="text-gray-900 font-medium">{approval.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="text-gray-900 font-medium">
                          {approval.city}, {approval.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewDetails(approval._id)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedApproval(approval);
                    setActionModal('approve');
                    setActionData({ remarks: '', reason: '' });
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedApproval(approval);
                    setActionModal('reject');
                    setActionData({ remarks: '', reason: '' });
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Modal - Approve */}
      {actionModal === 'approve' && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-green-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Approve Organization</h2>
              <button
                onClick={() => setActionModal(null)}
                className="hover:bg-green-700 p-2 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Organization</p>
                <p className="font-semibold text-gray-900">{selectedApproval.organizationName}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedApproval.organizationCode}</p>
              </div>

              <label className="block mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Approval Remarks</p>
                <textarea
                  value={actionData.remarks}
                  onChange={(e) =>
                    setActionData({ ...actionData, remarks: e.target.value })
                  }
                  placeholder="Enter approval remarks..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="4"
                ></textarea>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setActionModal(null)}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal - Reject */}
      {actionModal === 'reject' && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Reject Organization</h2>
              <button
                onClick={() => setActionModal(null)}
                className="hover:bg-red-700 p-2 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Organization</p>
                <p className="font-semibold text-gray-900">{selectedApproval.organizationName}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedApproval.organizationCode}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex gap-2">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-700">
                    This action cannot be undone. The organization will be notified of the rejection.
                  </p>
                </div>
              </div>

              <label className="block mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Rejection Reason</p>
                <textarea
                  value={actionData.reason}
                  onChange={(e) =>
                    setActionData({ ...actionData, reason: e.target.value })
                  }
                  placeholder="Enter reason for rejection..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="4"
                ></textarea>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setActionModal(null)}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
