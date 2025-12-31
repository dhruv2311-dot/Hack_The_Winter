import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/adminService';
import { Eye, Check, X, Edit2, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HospitalManagement() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});

  // Fetch hospitals when filters change
  useEffect(() => {
    fetchHospitals();
  }, [filters]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      // Reset to page 1 on new search
      if (searchTerm.trim()) {
        setFilters(prev => ({ ...prev, page: 1, limit: 100 })); // Get more results for search
      } else {
        setFilters(prev => ({ ...prev, page: 1, limit: 10 })); // Reset to normal pagination
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm]);

  // Helper function to determine if hospital is active based on status
  const isHospitalActive = (status) => {
    return status === 'APPROVED';
  };

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.getAllHospitals(filters);
      let fetchedHospitals = response.data.data.hospitals || [];
      
      // Add isActive property based on status
      fetchedHospitals = fetchedHospitals.map((hospital) => ({
        ...hospital,
        isActive: isHospitalActive(hospital.status)
      }));
      
      // Client-side filtering for search term (searches across all fetched hospitals)
      if (searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase();
        fetchedHospitals = fetchedHospitals.filter((hospital) =>
          hospital.name?.toLowerCase().includes(lowerSearch) ||
          hospital.email?.toLowerCase().includes(lowerSearch) ||
          hospital.organizationCode?.toLowerCase().includes(lowerSearch) ||
          hospital.city?.toLowerCase().includes(lowerSearch) ||
          hospital.phone?.includes(lowerSearch)
        );
      }
      
      setHospitals(fetchedHospitals);
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
    navigate(`/superadmin/hospital/${hospitalId}`);
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
            placeholder="Search by hospital name, email or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({ status: '', city: '', page: 1, limit: 10 });
            }}
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedHospital.name}</h2>
                <p className="text-red-100 text-sm mt-1">Code: {selectedHospital.organizationCode}</p>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-white hover:bg-red-700 p-2 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Contact Person</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.contactPerson || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
                    Location Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">City</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">State & Pincode</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.state} - {selectedHospital.pinCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospital Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
                    Hospital Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total Bed Capacity</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.totalBedCapacity || 'N/A'} beds</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Emergency Capacity</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.emergencyCapacity || 'N/A'} beds</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Registration Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedHospital.registeredDate || selectedHospital.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
                    License Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">License Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.licenseNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">License Valid Till</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedHospital.licenseValidTill 
                          ? new Date(selectedHospital.licenseValidTill).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Issuing Authority</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.issuingAuthority || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Details */}
              {selectedHospital.adminEmail && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
                    Admin Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Admin Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.adminEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Admin Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.adminName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Admin Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedHospital.adminPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
                    Approval Status
                  </h3>
                  <div>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                        selectedHospital.status
                      )}`}
                    >
                      {selectedHospital.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
                    Activity Status
                  </h3>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getActiveBadge(
                      selectedHospital.isActive
                    )}`}
                  >
                    {selectedHospital.isActive ? 'Active' : 'Inactive'}
                  </span>
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
