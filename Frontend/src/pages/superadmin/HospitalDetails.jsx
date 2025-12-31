import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/adminService';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchHospitalDetails();
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.getHospitalById(id);
      const hospitalData = response.data.data;
      setHospital({
        ...hospitalData,
        isActive: hospitalData.status === 'APPROVED'
      });
    } catch (error) {
      toast.error('Failed to fetch hospital details');
      console.error(error);
      navigate('/admin/hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      await hospitalService.approveHospital(id);
      toast.success('Hospital approved successfully');
      setHospital(prev => ({ ...prev, status: 'APPROVED', isActive: true }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve hospital');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setApproving(true);
      await hospitalService.rejectHospital(id);
      toast.success('Hospital rejected successfully');
      setHospital(prev => ({ ...prev, status: 'REJECTED', isActive: false }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject hospital');
    } finally {
      setApproving(false);
    }
  };

  const handleActivate = async () => {
    try {
      setApproving(true);
      await hospitalService.activateHospital(id);
      toast.success('Hospital activated successfully');
      setHospital(prev => ({ ...prev, isActive: true }));
      fetchHospitalDetails();
    } catch (error) {
      toast.error('Failed to activate hospital');
    } finally {
      setApproving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setApproving(true);
      await hospitalService.deactivateHospital(id);
      toast.success('Hospital deactivated successfully');
      setHospital(prev => ({ ...prev, isActive: false }));
      fetchHospitalDetails();
    } catch (error) {
      toast.error('Failed to deactivate hospital');
    } finally {
      setApproving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin">
          <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Hospital not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/hospitals')}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{hospital.name}</h1>
          <p className="text-gray-600 mt-1">{hospital.organizationCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{hospital.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900">{hospital.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contact Person</p>
                <p className="text-sm font-medium text-gray-900">{hospital.contactPerson || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
              Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                <p className="text-sm font-medium text-gray-900">{hospital.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">City</p>
                <p className="text-sm font-medium text-gray-900">{hospital.city}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">State & Pincode</p>
                <p className="text-sm font-medium text-gray-900">{hospital.state} - {hospital.pinCode}</p>
              </div>
            </div>
          </div>

          {/* Hospital Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
              Hospital Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Bed Capacity</p>
                <p className="text-sm font-medium text-gray-900">{hospital.totalBedCapacity || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Emergency Capacity</p>
                <p className="text-sm font-medium text-gray-900">{hospital.emergencyCapacity || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Registration Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {hospital.registeredDate ? new Date(hospital.registeredDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
              License Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">License Number</p>
                <p className="text-sm font-medium text-gray-900">{hospital.licenseNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valid Till</p>
                <p className="text-sm font-medium text-gray-900">
                  {hospital.licenseValidTill ? new Date(hospital.licenseValidTill).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Issuing Authority</p>
                <p className="text-sm font-medium text-gray-900">{hospital.issuingAuthority || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Admin Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-100">
              Admin Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Admin Name</p>
                <p className="text-sm font-medium text-gray-900">{hospital.adminName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Admin Email</p>
                <p className="text-sm font-medium text-gray-900">{hospital.adminEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Admin Phone</p>
                <p className="text-sm font-medium text-gray-900">{hospital.adminPhone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Approval Status</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(hospital.status)}`}>
                  {hospital.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Activity Status</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  hospital.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {hospital.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {hospital.status === 'PENDING' && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve Hospital
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={approving}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject Hospital
                  </button>
                </>
              )}

              {hospital.status === 'APPROVED' && (
                <>
                  {hospital.isActive ? (
                    <button
                      onClick={handleDeactivate}
                      disabled={approving}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={handleActivate}
                      disabled={approving}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                    >
                      Activate
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => navigate('/admin/hospitals')}
                className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
