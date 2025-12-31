import { useState, useEffect } from 'react';
import { hospitalService } from '../../services/adminService';
import { Eye, Check, X, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchHospitals();
  }, [filters]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.getAllHospitals(filters);
      setHospitals(response.data.data.hospitals || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      toast.error('Failed to fetch hospitals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (hospitalId) => {
    try {
      await hospitalService.activateHospital(hospitalId);
      toast.success('Hospital activated successfully');
      fetchHospitals();
    } catch (error) {
      toast.error('Failed to activate hospital');
    }
  };

  const handleDeactivate = async (hospitalId) => {
    try {
      await hospitalService.deactivateHospital(hospitalId);
      toast.success('Hospital deactivated successfully');
      fetchHospitals();
    } catch (error) {
      toast.error('Failed to deactivate hospital');
    }
  };

  const viewDetails = async (hospitalId) => {
    try {
      const response = await hospitalService.getHospitalById(hospitalId);
      setSelectedHospital(response.data.data);
      setDetailsOpen(true);
    } catch (error) {
      toast.error('Failed to fetch hospital details');
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
        <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all registered hospitals</p>
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
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hospitals found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Hospital Name
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
                {hospitals.map((hospital) => (
                  <tr key={hospital._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {hospital.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {hospital.city}, {hospital.state}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {hospital.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          hospital.status
                        )}`}
                      >
                        {hospital.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActiveBadge(
                          hospital.isActive
                        )}`}
                      >
                        {hospital.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDetails(hospital._id)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {hospital.isActive ? (
                          <button
                            onClick={() => handleDeactivate(hospital._id)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Deactivate"
                          >
                            <X size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(hospital._id)}
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
              Page {pagination.currentPage} of {pagination.totalPages} •{' '}
              {pagination.totalDocuments} total hospitals
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
      {detailsOpen && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedHospital.name}</h2>
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
                      {selectedHospital.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedHospital.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hospital Code</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedHospital.organizationCode}
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
                      {selectedHospital.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">State</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedHospital.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedHospital.address}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4">
                  Hospital Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Total Bed Capacity</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedHospital.totalBedCapacity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        selectedHospital.status
                      )}`}
                    >
                      {selectedHospital.status}
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
                      {selectedHospital.isActive ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registered On</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(
                        selectedHospital.createdAt
                      ).toLocaleDateString()}
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
              {selectedHospital.isActive ? (
                <button
                  onClick={() => {
                    handleDeactivate(selectedHospital._id);
                    setDetailsOpen(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleActivate(selectedHospital._id);
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
