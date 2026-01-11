/**
 * Priority Queue Dashboard
 * 
 * Displays pending blood requests sorted by priority
 * Auto-scoped by user role:
 * - Super Admin: sees ALL requests
 * - Blood Bank: sees only requests assigned to them
 * - Hospital: sees only their requests
 * Shows organization details (request source and destination)
 */

import React, { useState, useEffect } from 'react';
import PriorityBadge, { PriorityInfo, PriorityLegend } from './PriorityBadge';

const PriorityQueueDashboard = () => {
  const [queueData, setQueueData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Fetch priority queue
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/blood-requests/queue/priority?limit=100');
        const data = await response.json();

        if (data.success) {
          setQueueData(data.data);
          setError(null);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch priority queue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/blood-requests/priority/dashboard');
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Filter requests
  const filteredRequests = queueData?.queue.filter(req => {
    if (filter === 'ALL') return true;
    return req.priority.category === filter;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading priority queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Priority Queue Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time monitoring of pending blood requests
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">
              {queueData?.totalInQueue || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Requests in Queue
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded p-3 text-red-800 dark:text-red-100">
            ⚠️ {error}
          </div>
        )}

        {/* Refresh interval control */}
        <div className="flex items-center gap-2 mt-4">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Auto-refresh:
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="px-3 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
          </select>
        </div>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600">
              {stats.totals.totalRequests}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Requests
            </p>
          </div>

          {/* Critical */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-300 dark:border-red-700">
            <div className="text-3xl font-bold text-red-600">
              {stats.totals.critical}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              🔴 Critical
            </p>
          </div>

          {/* High */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-300 dark:border-orange-700">
            <div className="text-3xl font-bold text-orange-600">
              {stats.totals.high}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              🟠 High
            </p>
          </div>

          {/* Medium */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-300 dark:border-yellow-700">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.totals.medium}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              🟡 Medium
            </p>
          </div>

          {/* Low */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-300 dark:border-green-700">
            <div className="text-3xl font-bold text-green-600">
              {stats.totals.low}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              🟢 Low
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Filter Buttons */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2 flex-wrap">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === category
                      ? category === 'ALL' ? 'bg-blue-600 text-white' :
                        category === 'CRITICAL' ? 'bg-red-600 text-white' :
                        category === 'HIGH' ? 'bg-orange-600 text-white' :
                        category === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                        'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Queue Items */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No requests in this priority level
                </div>
              ) : (
                filteredRequests.map(request => (
                  <div
                    key={request._id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedRequest?._id === request._id ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {request.requestCode}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {request.bloodGroup} • {request.unitsRequired} units
                        </p>
                        
                        {/* Organization Information */}
                        <div className="mt-2 text-xs space-y-1">
                          {request.raisedfrom && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-blue-600 dark:text-blue-400">From:</span>
                              <span className="text-gray-700 dark:text-gray-300">{request.raisedfrom.name}</span>
                            </div>
                          )}
                          {request.assignedTo && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-green-600 dark:text-green-400">To:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {request.assignedTo.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <PriorityBadge
                        score={typeof request.priority === 'object' ? request.priority.score || 0 : request.priority || 0}
                        category={request.urgency}
                        size="small"
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{request.urgency}</span>
                      <span>{new Date(request.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Request Details */}
          {selectedRequest && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Request Details
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Request Code</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.requestCode}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400">Blood Group</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.bloodGroup}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400">Units Required</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.unitsRequired} units
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.status}
                  </p>
                </div>

                {/* Organization Details */}
                {selectedRequest.raisedfrom && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                    <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">Raised From</p>
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                      <p className="font-semibold text-blue-900 dark:text-blue-200">
                        {selectedRequest.raisedfrom.name}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Code: {selectedRequest.raisedfrom.code}
                      </p>
                      {selectedRequest.raisedfrom.location && (
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          📍 {selectedRequest.raisedfrom.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned To */}
                {selectedRequest.assignedTo && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                    <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">Assigned To</p>
                    <div className={`p-2 rounded ${
                      selectedRequest.assignedTo.type === 'Pending Assignment'
                        ? 'bg-yellow-50 dark:bg-yellow-900/30'
                        : 'bg-green-50 dark:bg-green-900/30'
                    }`}>
                      <p className={`font-semibold ${
                        selectedRequest.assignedTo.type === 'Pending Assignment'
                          ? 'text-yellow-900 dark:text-yellow-200'
                          : 'text-green-900 dark:text-green-200'
                      }`}>
                        {selectedRequest.assignedTo.name}
                      </p>
                      {selectedRequest.assignedTo.code && (
                        <p className={`text-xs ${
                          selectedRequest.assignedTo.type === 'Pending Assignment'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          Code: {selectedRequest.assignedTo.code}
                        </p>
                      )}
                      {selectedRequest.assignedTo.location && (
                        <p className={`text-xs ${
                          selectedRequest.assignedTo.type === 'Pending Assignment'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          📍 {selectedRequest.assignedTo.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                  <p className="text-gray-600 dark:text-gray-400">Created</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                onClick={() => {
                  // Navigate to request details or open action modal
                  console.log('View request:', selectedRequest._id);
                }}
              >
                View Full Details
              </button>
            </div>
          )}

          {/* Priority Legend */}
          <PriorityLegend />
        </div>
      </div>
    </div>
  );
};

export default PriorityQueueDashboard;
