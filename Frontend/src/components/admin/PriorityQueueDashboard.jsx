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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d6d] mx-auto mb-4"></div>
          <p className="text-[#7c4a5e]">Loading priority queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_25px_60px_rgba(241,122,146,0.18)]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
              Priority Queue Dashboard
            </p>
            <h1 className="text-3xl font-bold text-[#31101e] mt-1">
              Real-time Monitoring
            </h1>
            <p className="text-[#7c4a5e] mt-1">
              Pending blood requests sorted by priority
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold bg-gradient-to-r from-[#ff4d6d] to-[#ff6b85] bg-clip-text text-transparent">
              {queueData?.totalInQueue || 0}
            </div>
            <p className="text-sm text-[#7c4a5e] mt-1">
              Requests in Queue
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            ⚠️ {error}
          </div>
        )}

        {/* Refresh interval control */}
        <div className="flex items-center gap-2 mt-4">
          <label className="text-sm font-semibold text-[#7c4a5e]">
            Auto-refresh:
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="rounded-full border border-pink-100 bg-white px-3 py-1.5 text-sm text-[#5c283a] focus:border-[#ff4d6d] focus:outline-none focus:ring-2 focus:ring-[#ff4d6d]/20"
          >
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
          </select>
        </div>
      </section>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Requests */}
          <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5 shadow-sm">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#ff4d6d] to-[#ff6b85] bg-clip-text text-transparent">
              {stats.totals.totalRequests}
            </div>
            <p className="text-sm text-[#7c4a5e] mt-2 font-semibold">
              Total Requests
            </p>
          </div>

          {/* Critical */}
          <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
            <div className="text-4xl font-bold text-red-600">
              {stats.totals.critical}
            </div>
            <p className="text-sm text-red-700 mt-2 font-semibold flex items-center gap-1">
              🔴 Critical
            </p>
          </div>

          {/* High */}
          <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
            <div className="text-4xl font-bold text-orange-600">
              {stats.totals.high}
            </div>
            <p className="text-sm text-orange-700 mt-2 font-semibold flex items-center gap-1">
              🟠 High
            </p>
          </div>

          {/* Medium */}
          <div className="rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm">
            <div className="text-4xl font-bold text-yellow-600">
              {stats.totals.medium}
            </div>
            <p className="text-sm text-yellow-700 mt-2 font-semibold flex items-center gap-1">
              🟡 Medium
            </p>
          </div>

          {/* Low */}
          <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm">
            <div className="text-4xl font-bold text-green-600">
              {stats.totals.low}
            </div>
            <p className="text-sm text-green-700 mt-2 font-semibold flex items-center gap-1">
              🟢 Low
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-white/80 bg-white/95 shadow-[0_25px_60px_rgba(241,122,146,0.18)] overflow-hidden">
            {/* Filter Buttons */}
            <div className="p-4 border-b border-pink-100 flex gap-2 flex-wrap bg-pink-50/50">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filter === category
                      ? category === 'ALL' ? 'bg-gradient-to-r from-[#ff4d6d] to-[#ff6b85] text-white shadow-md' :
                        category === 'CRITICAL' ? 'bg-red-600 text-white shadow-md' :
                        category === 'HIGH' ? 'bg-orange-600 text-white shadow-md' :
                        category === 'MEDIUM' ? 'bg-yellow-600 text-white shadow-md' :
                        'bg-green-600 text-white shadow-md'
                      : 'bg-white border border-pink-100 text-[#5c283a] hover:bg-pink-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Queue Items */}
            <div className="divide-y divide-pink-100 max-h-96 overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-[#7c4a5e]">
                  No requests in this priority level
                </div>
              ) : (
                filteredRequests.map(request => (
                  <div
                    key={request._id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 cursor-pointer transition-all hover:bg-pink-50 ${
                      selectedRequest?._id === request._id ? 'bg-pink-100 border-l-4 border-l-[#ff4d6d]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-[#31101e]">
                          {request.requestCode}
                        </h4>
                        <p className="text-sm text-[#7c4a5e] mt-1">
                          {request.bloodGroup} • {request.unitsRequired} units
                        </p>
                        
                        {/* Organization Information */}
                        <div className="mt-2 text-xs space-y-1">
                          {request.raisedfrom && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-[#ff4d6d]">From:</span>
                              <span className="text-[#5c283a]">{request.raisedfrom.name}</span>
                            </div>
                          )}
                          {request.assignedTo && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-emerald-600">To:</span>
                              <span className="text-[#5c283a]">
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
                    <div className="flex justify-between items-center text-xs text-[#8a5c70]">
                      <span className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 font-semibold text-[#ff4d6d]">
                        {request.urgency}
                      </span>
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
            <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_25px_60px_rgba(241,122,146,0.18)]">
              <h3 className="text-lg font-bold text-[#31101e] mb-4 border-b border-pink-100 pb-2">
                Request Details
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-[#7c4a5e] font-semibold uppercase tracking-wider">Request Code</p>
                  <p className="font-bold text-[#31101e] mt-1">
                    {selectedRequest.requestCode}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#7c4a5e] font-semibold uppercase tracking-wider">Blood Group</p>
                  <p className="font-bold text-[#ff4d6d] mt-1 text-lg">
                    {selectedRequest.bloodGroup}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#7c4a5e] font-semibold uppercase tracking-wider">Units Required</p>
                  <p className="font-bold text-[#31101e] mt-1">
                    {selectedRequest.unitsRequired} units
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#7c4a5e] font-semibold uppercase tracking-wider">Status</p>
                  <p className="font-semibold text-[#31101e] mt-1">
                    {selectedRequest.status}
                  </p>
                </div>

                {/* Organization Details */}
                {selectedRequest.raisedfrom && (
                  <div className="border-t border-pink-100 pt-3 mt-3">
                    <p className="text-xs text-[#7c4a5e] font-bold uppercase tracking-wider mb-2">Raised From</p>
                    <div className="rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-3">
                      <p className="font-bold text-[#ff4d6d]">
                        {selectedRequest.raisedfrom.name}
                      </p>
                      <p className="text-xs text-[#8a5c70] mt-1">
                        Code: {selectedRequest.raisedfrom.code}
                      </p>
                      {selectedRequest.raisedfrom.location && (
                        <p className="text-xs text-[#8a5c70] mt-1">
                          📍 {selectedRequest.raisedfrom.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned To */}
                {selectedRequest.assignedTo && (
                  <div className="border-t border-pink-100 pt-3 mt-3">
                    <p className="text-xs text-[#7c4a5e] font-bold uppercase tracking-wider mb-2">Assigned To</p>
                    <div className={`rounded-xl p-3 border ${
                      selectedRequest.assignedTo.type === 'Pending Assignment'
                        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                        : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
                    }`}>
                      <p className={`font-bold ${
                        selectedRequest.assignedTo.type === 'Pending Assignment'
                          ? 'text-yellow-700'
                          : 'text-emerald-700'
                      }`}>
                        {selectedRequest.assignedTo.name}
                      </p>
                      {selectedRequest.assignedTo.code && (
                        <p className={`text-xs mt-1 ${
                          selectedRequest.assignedTo.type === 'Pending Assignment'
                            ? 'text-yellow-600'
                            : 'text-emerald-600'
                        }`}>
                          Code: {selectedRequest.assignedTo.code}
                        </p>
                      )}
                      {selectedRequest.assignedTo.location && (
                        <p className={`text-xs mt-1 ${
                          selectedRequest.assignedTo.type === 'Pending Assignment'
                            ? 'text-yellow-600'
                            : 'text-emerald-600'
                        }`}>
                          📍 {selectedRequest.assignedTo.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-pink-100 pt-3 mt-3">
                  <p className="text-xs text-[#7c4a5e] font-semibold uppercase tracking-wider">Created</p>
                  <p className="font-semibold text-[#31101e] mt-1 text-xs">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full mt-4 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#ff6b85] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_25px_60px_rgba(241,122,146,0.18)]">
            <PriorityLegend />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityQueueDashboard;
