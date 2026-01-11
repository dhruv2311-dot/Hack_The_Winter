import React, { useState, useEffect } from 'react';

/**
 * Enhanced Blood Request Card with Pre-calculated Distance
 * 
 * यह component request card में ही distance show करता है
 * ताकि Blood Bank staff को पहले से पता हो कि hospital कितनी दूर है
 */

const EnhancedBloodRequestCard = ({ request, bloodBankLocation, onAccept, onReject }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [distance, setDistance] = useState(null);
  const [response, setResponse] = useState('');

  // Calculate distance on component mount
  useEffect(() => {
    if (request.hospitalLocation && bloodBankLocation) {
      calculateDistance();
    }
  }, [request, bloodBankLocation]);

  // Haversine formula for distance calculation (client-side)
  const calculateDistance = () => {
    try {
      const hospitalCoords = request.hospitalLocation?.coordinates || 
                            [request.hospitalLocation?.longitude, request.hospitalLocation?.latitude];
      const bloodBankCoords = bloodBankLocation.coordinates || 
                             [bloodBankLocation.longitude, bloodBankLocation.latitude];

      if (!hospitalCoords || !bloodBankCoords) return;

      const [lon1, lat1] = hospitalCoords;
      const [lon2, lat2] = bloodBankCoords;

      // Validate coordinates
      if (lat1 === 0 && lon1 === 0 || lat2 === 0 && lon2 === 0) return;

      const R = 6371; // Earth's radius in km
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;

      setDistance({
        kilometers: parseFloat(distanceKm.toFixed(2)),
        miles: parseFloat((distanceKm * 0.621371).toFixed(2)),
        category: getDistanceCategory(distanceKm)
      });
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const getDistanceCategory = (km) => {
    if (km < 5) return 'VERY_CLOSE';
    if (km < 15) return 'CLOSE';
    if (km < 30) return 'MODERATE';
    if (km < 50) return 'FAR';
    return 'VERY_FAR';
  };

  const getDistanceCategoryColor = (category) => {
    switch (category) {
      case 'VERY_CLOSE': return 'bg-green-100 text-green-800 border-green-300';
      case 'CLOSE': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'FAR': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'VERY_FAR': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDistanceCategoryIcon = (category) => {
    switch (category) {
      case 'VERY_CLOSE': return '🟢';
      case 'CLOSE': return '🔵';
      case 'MODERATE': return '🟡';
      case 'FAR': return '🟠';
      case 'VERY_FAR': return '🔴';
      default: return '⚪';
    }
  };

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
        // Show success message
        let message = '✅ Request Accepted Successfully!\n\n';
        
        if (data.distanceInfo) {
          message += `🏥 Hospital: ${data.hospitalDetails.name}\n`;
          message += `📍 Distance: ${data.distanceInfo.formatted}\n`;
          message += `🚗 Category: ${data.distanceInfo.category}\n\n`;
          message += `Blood units will be ready for pickup.`;
        }
        
        alert(message);
        setShowAcceptModal(false);
        
        if (onAccept) {
          onAccept(data);
        }
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('❌ Failed to accept request');
    } finally {
      setIsAccepting(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

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
        {/* Header with Distance Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Request #{request.requestCode || request._id.slice(-6)}
              </h3>
              {distance && (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getDistanceCategoryColor(distance.category)}`}>
                  {getDistanceCategoryIcon(distance.category)} {distance.kilometers} km
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {new Date(request.requestedAt).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(request.urgency)}`}>
              {request.urgency}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>

        {/* Distance Information Card */}
        {distance && (
          <div className={`rounded-md p-3 mb-4 border ${getDistanceCategoryColor(distance.category)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold mb-1">📍 Distance from Blood Bank</p>
                <p className="text-lg font-bold">
                  {distance.kilometers} km ({distance.miles} miles)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Category</p>
                <p className="text-sm font-semibold">
                  {getDistanceCategoryIcon(distance.category)} {distance.category.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Hospital Information */}
        {request.hospitalName && (
          <div className="bg-blue-50 rounded-md p-3 mb-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">🏥 Hospital Information</p>
            <div className="text-sm text-blue-800">
              <p className="font-semibold">{request.hospitalName}</p>
              {request.hospitalAddress && (
                <p className="text-xs mt-1">{request.hospitalAddress.city}, {request.hospitalAddress.state}</p>
              )}
            </div>
          </div>
        )}

        {/* Patient Info */}
        {request.patientInfo && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">👤 Patient Information</p>
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
            <p className="text-xs font-semibold text-gray-700 mb-1">📝 Hospital Notes</p>
            <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">{request.hospitalNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {request.status === 'PENDING' && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowAcceptModal(true)}
              disabled={isAccepting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>{isAccepting ? 'Processing...' : 'Accept Request'}</span>
            </button>
            <button
              onClick={() => onReject && onReject(request)}
              disabled={isAccepting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>✗</span>
              <span>Reject Request</span>
            </button>
          </div>
        )}
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ✅ Confirm Request Acceptance
            </h2>

            <div className="mb-4">
              {/* Request Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Request Summary</p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Blood Group:</strong> {request.bloodGroup}</p>
                  <p><strong>Units:</strong> {request.unitsRequired}</p>
                  <p><strong>Urgency:</strong> {request.urgency}</p>
                  {distance && (
                    <p><strong>Distance:</strong> {distance.kilometers} km ({distance.category.replace('_', ' ')})</p>
                  )}
                </div>
              </div>

              {/* Distance Warning for Far Locations */}
              {distance && (distance.category === 'FAR' || distance.category === 'VERY_FAR') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    ⚠️ Distance Alert
                  </p>
                  <p className="text-xs text-yellow-800">
                    Hospital is {distance.kilometers} km away. Please ensure proper logistics for blood transportation.
                  </p>
                </div>
              )}

              {/* Response Message */}
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

            {/* Action Buttons */}
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

export default EnhancedBloodRequestCard;
