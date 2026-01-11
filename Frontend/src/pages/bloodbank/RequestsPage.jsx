import React, { useState, useEffect } from 'react';
import EnhancedBloodRequestCard from '../components/BloodBank/EnhancedBloodRequestCard';

/**
 * Blood Bank Dashboard - Hospital Requests Page
 * 
 * यह page Blood Bank के dashboard में hospital की सभी blood requests को display करता है
 * Distance calculation के साथ
 */

const BloodBankRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodBankLocation, setBloodBankLocation] = useState(null);
  const [filter, setFilter] = useState('PENDING');

  // Fetch blood bank details and location
  useEffect(() => {
    fetchBloodBankDetails();
    fetchRequests();
  }, [filter]);

  const fetchBloodBankDetails = async () => {
    try {
      // Get blood bank ID from auth context or localStorage
      const bloodBankId = localStorage.getItem('bloodBankId');
      
      const response = await fetch(`/api/bloodbanks/${bloodBankId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setBloodBankLocation(data.data.location);
      }
    } catch (error) {
      console.error('Error fetching blood bank details:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Get blood bank ID from auth context or localStorage
      const bloodBankId = localStorage.getItem('bloodBankId');
      
      const response = await fetch(
        `/api/hospital-blood-requests/bloodbank/${bloodBankId}?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (acceptedData) => {
    // Refresh requests after acceptance
    fetchRequests();
    
    // You can also show a success notification here
    console.log('Request accepted:', acceptedData);
  };

  const handleReject = async (request) => {
    const reason = prompt('Please enter rejection reason:');
    
    if (!reason || reason.trim().length < 5) {
      alert('Rejection reason must be at least 5 characters long');
      return;
    }

    try {
      const response = await fetch(
        `/api/hospital-blood-requests/${request._id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ rejectionReason: reason })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Request rejected successfully');
        fetchRequests();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Hospital Blood Requests
          </h1>
          <p className="text-gray-600">
            Manage incoming blood requests from hospitals with distance information
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {['PENDING', 'ACCEPTED', 'FULFILLED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md font-semibold text-sm whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'ACCEPTED').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Fulfilled</p>
            <p className="text-2xl font-bold text-purple-600">
              {requests.filter(r => r.status === 'FULFILLED').length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No {filter.toLowerCase()} requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <EnhancedBloodRequestCard
                key={request._id}
                request={request}
                bloodBankLocation={bloodBankLocation}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodBankRequestsPage;
