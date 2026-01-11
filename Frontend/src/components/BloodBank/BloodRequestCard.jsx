import React, { useState } from 'react';

/**
 * Blood Request Card Component with Distance Calculation
 * 
 * यह component Blood Bank dashboard में hospital की blood request को display करता है
 * और distance calculation के साथ accept/reject functionality provide करता है
 */

const BloodRequestCard = ({ request, onAccept, onReject }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [response, setResponse] = useState('');

  // Handle accept button click - shows confirmation modal with distance
  const handleAcceptClick = async () => {
    setIsAccepting(true);
    try {
      // Call API to get distance information (without actually accepting)
      // You can create a separate endpoint for this or show modal first
      setShowAcceptModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process request');
    } finally {
      setIsAccepting(false);
    }
  };

  // Confirm accept with distance information
  const confirmAccept = async () => {
    setIsAccepting(true);
    try {
      const result = await fetch(`/api/hospital-blood-requests/${request._id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bloodBankResponse: response || 'Request accepted. Blood units will be ready for pickup.'
        })
      });

      const data = await result.json();

      if (data.success) {
        setDistanceInfo(data.distanceInfo);
        
        // Show success message with distance
        let message = 'Request Accepted Successfully!\n\n';
        
        if (data.distanceInfo) {
          message += `Hospital: ${data.hospitalDetails.name}\n`;
          message += `Distance: ${data.distanceInfo.formatted}\n`;
          message += `Category: ${data.distanceInfo.category}\n\n`;
          message += `Blood units will be ready for pickup.`;
        } else if (data.distanceError) {
          message += `Note: ${data.distanceError}`;
        }
        
        alert(message);
        setShowAcceptModal(false);
        
        // Call parent callback
        if (onAccept) {
          onAccept(data);
        }
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    } finally {
      setIsAccepting(false);
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'FULFILLED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Request #{request.requestCode || request._id.slice(-6)}
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(request.requestedAt).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
              {request.urgency}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>

        {/* Blood Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Blood Group</p>
            <p className="text-lg font-bold text-red-600">{request.bloodGroup}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Units Required</p>
            <p className="text-lg font-bold text-gray-900">{request.unitsRequired}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Component</p>
            <p className="text-sm font-medium text-gray-700">{request.component || 'WHOLE_BLOOD'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Priority</p>
            <p className="text-sm font-medium text-gray-700">{request.priority || 'N/A'}</p>
          </div>
        </div>

        {/* Patient Info */}
        {request.patientInfo && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Patient Information</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {request.patientInfo.age && (
                <p><span className="text-gray-600">Age:</span> {request.patientInfo.age} years</p>
              )}
              {request.patientInfo.condition && (
                <p><span className="text-gray-600">Condition:</span> {request.patientInfo.condition}</p>
              )}
              {request.patientInfo.department && (
                <p className="col-span-2"><span className="text-gray-600">Department:</span> {request.patientInfo.department}</p>
              )}
            </div>
          </div>
        )}

        {/* Hospital Notes */}
        {request.hospitalNotes && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">Hospital Notes</p>
            <p className="text-sm text-gray-600 italic">{request.hospitalNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {request.status === 'PENDING' && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAcceptClick}
              disabled={isAccepting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAccepting ? 'Processing...' : '✓ Accept Request'}
            </button>
            <button
              onClick={() => onReject && onReject(request)}
              disabled={isAccepting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✗ Reject Request
            </button>
          </div>
        )}
      </div>

      {/* Accept Confirmation Modal with Distance */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Request Acceptance
            </h2>

            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Request Details</p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Blood Group:</strong> {request.bloodGroup}</p>
                  <p><strong>Units:</strong> {request.unitsRequired}</p>
                  <p><strong>Urgency:</strong> {request.urgency}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  📍 Distance Calculation
                </p>
                <p className="text-xs text-yellow-800">
                  Distance will be calculated and displayed after acceptance based on hospital and blood bank locations.
                </p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Message (Optional)
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter your response message for the hospital..."
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmAccept}
                disabled={isAccepting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                {isAccepting ? 'Accepting...' : 'Confirm & Accept'}
              </button>
              <button
                onClick={() => setShowAcceptModal(false)}
                disabled={isAccepting}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BloodRequestCard;
