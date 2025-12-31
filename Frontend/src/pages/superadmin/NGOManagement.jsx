import { useState, useEffect } from 'react';
import { ngoService } from '../../services/adminService';
import { Eye, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NGOManagement() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchNGOs();
  }, [filters]);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const response = await ngoService.getAllNGOs(filters);
      setNgos(response.data.data.ngos || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      toast.error('Failed to fetch NGOs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (ngoId) => {
    try {
      await ngoService.activateNGO(ngoId);
      toast.success('NGO activated successfully');
      fetchNGOs();
    } catch (error) {
      toast.error('Failed to activate NGO');
    }
  };

  const handleDeactivate = async (ngoId) => {
    try {
      await ngoService.deactivateNGO(ngoId);
      toast.success('NGO deactivated successfully');
      fetchNGOs();
    } catch (error) {
      toast.error('Failed to deactivate NGO');
    }
  };

  const viewDetails = async (ngoId) => {
    try {
      const response = await ngoService.getNGOById(ngoId);
      setSelectedNgo(response.data.data);
      setDetailsOpen(true);
    } catch (error) {
      toast.error('Failed to fetch NGO details');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-red-200 text-red-900',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getActiveBadge = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">NGO Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all registered NGOs</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <input
            type="text"
            placeholder="Search by city..."
            value={filters.city}
            onChange={(e) =>
              setFilters({ ...filters, city: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={() => setFilters({ status: '', city: '', page: 1, limit: 10 })}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        ) : ngos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No NGOs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    NGO Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ngos.map((ngo) => (
                  <tr key={ngo._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {ngo.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ngo.city}, {ngo.state}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ngo.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          ngo.status
                        )}`}
                      >
                        {ngo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActiveBadge(
                          ngo.isActive
                        )}`}
                      >
                        {ngo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDetails(ngo._id)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {ngo.isActive ? (
                          <button
                            onClick={() => handleDeactivate(ngo._id)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Deactivate"
                          >
                            <X size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(ngo._id)}
                            className="text-green-600 hover:text-green-800 transition"
                            title="Activate"
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages && pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalDocuments}{' '}
              total NGOs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.max(1, filters.page - 1),
                  })
                }
                disabled={filters.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.min(pagination.totalPages, filters.page + 1),
                  })
                }
                disabled={filters.page === pagination.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailsOpen && selectedNgo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedNgo.name}</h2>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-white hover:bg-red-700 p-2 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNgo.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNgo.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">NGO Code</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNgo.organizationCode}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">
                  Location Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNgo.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">State</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNgo.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNgo.address}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">
                  NGO Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Registration Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNgo.registrationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        selectedNgo.status
                      )}`}
                    >
                      {selectedNgo.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">
                  Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Active</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNgo.isActive ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registered On</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedNgo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setDetailsOpen(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Close
              </button>
              {selectedNgo.isActive ? (
                <button
                  onClick={() => {
                    handleDeactivate(selectedNgo._id);
                    setDetailsOpen(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleActivate(selectedNgo._id);
                    setDetailsOpen(false);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
