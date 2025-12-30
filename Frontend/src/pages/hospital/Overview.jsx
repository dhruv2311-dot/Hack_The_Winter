import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHospitalById } from "../../services/hospitalApi";
import { 
  getHospitalBloodRequests, 
  getCriticalBloodRequests 
} from "../../services/hospitalBloodRequestApi";
import { getHospitalNgoDrives } from "../../services/hospitalNgoDriveApi";

export default function HospitalOverview() {
  const [hospital, setHospital] = useState(null);
  const [stats, setStats] = useState({
    totalBloodRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    ngoDrivesCreated: 0,
    verificationStatus: "PENDING",
  });
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Get auth data from localStorage
  const token = localStorage.getItem('token');
  const organizationId = localStorage.getItem('organizationId'); // Organization ID from login

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hospital details using organizationId
      const hospitalResponse = await getHospitalById(organizationId);
      const hospitalData = hospitalResponse.data.data;
      setHospital(hospitalData);

      // Fetch all blood requests to calculate stats
      const requestsResponse = await getHospitalBloodRequests(
        organizationId,
        { page: 1, limit: 100 },
        token
      );
      
      // Handle different response structures
      let allRequests = [];
      if (requestsResponse?.data?.data) {
        allRequests = Array.isArray(requestsResponse.data.data) 
          ? requestsResponse.data.data 
          : [];
      }

      console.log('[OVERVIEW] Blood requests fetched:', allRequests.length);

      // Calculate stats
      const pending = allRequests.filter(r => r.status === 'PENDING').length;
      const completed = allRequests.filter(r => r.status === 'COMPLETED').length;

      // Fetch NGO drives
      const drivesResponse = await getHospitalNgoDrives(
        organizationId,
        { page: 1, limit: 100 },
        token
      );
      
      // Handle different response structures
      let allDrives = [];
      if (drivesResponse?.data?.data) {
        allDrives = Array.isArray(drivesResponse.data.data) 
          ? drivesResponse.data.data 
          : [];
      }

      console.log('[OVERVIEW] NGO drives fetched:', allDrives.length);

      // Fetch critical requests
      const criticalResponse = await getCriticalBloodRequests(
        { hospitalId: organizationId },
        token
      );
      
      // Handle different response structures
      let criticalData = [];
      if (criticalResponse?.data?.data) {
        criticalData = Array.isArray(criticalResponse.data.data) 
          ? criticalResponse.data.data 
          : [];
      }

      console.log('[OVERVIEW] Critical requests fetched:', criticalData.length);

      // Format urgent requests for display
      const formattedUrgent = criticalData.slice(0, 2).map(req => ({
        _id: req._id,
        label: req.purpose || "Critical Requirement",
        bloodGroup: req.bloodGroup,
        units: req.units,
        status: getStatusText(req.status),
        requestedAt: formatDate(req.createdAt),
      }));

      setStats({
        totalBloodRequests: allRequests.length,
        pendingRequests: pending,
        completedRequests: completed,
        ngoDrivesCreated: allDrives.length,
        verificationStatus: hospitalData.verificationStatus,
      });

      setUrgentRequests(formattedUrgent);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Awaiting bank confirmation',
      'ACCEPTED': 'Accepted by blood bank',
      'COMPLETED': 'Fulfilled',
      'REJECTED': 'Rejected'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const time = date.toLocaleString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    return `${day} ${month} • ${time}`;
  };

  const statCards = [
    {
      title: "Total Blood Requests",
      value: stats.totalBloodRequests,
      meta: "since registration",
      accent: "from-[#7c0d16] to-[#b71d24]",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      meta: "awaiting bank response",
      accent: "from-[#d1661c] to-[#f29f4a]",
    },
    {
      title: "Completed Requests",
      value: stats.completedRequests,
      meta: "fulfilled via SEBN",
      accent: "from-[#1f7a3a] to-[#4dc97d]",
    },
    {
      title: "NGO Drives Created",
      value: stats.ngoDrivesCreated,
      meta: "active collaboration",
      accent: "from-[#1e5aa8] to-[#6fb1ff]",
    },
    {
      title: "Verification Status",
      value: stats.verificationStatus,
      meta: hospital ? `Updated ${formatDate(hospital.updatedAt)}` : "Loading...",
      accent: "from-[#d93f42] to-[#f08a8d]",
    },
  ];

  if (loading) {
    return (
      <section className="space-y-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#8f0f1a] border-r-transparent"></div>
            <p className="mt-4 text-sm text-[#7a4c4c]">Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-semibold text-red-800">Error Loading Dashboard</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#8f0f1a]">
            Overview
          </p>
          <h2 className="text-3xl font-semibold text-[#2f1012]">
            {hospital ? hospital.name : 'Loading...'} {/* ← Hospital name from backend */}
          </h2>
          <p className="text-sm text-[#7a4c4c]">
            Real-time picture of hospital blood activity across SEBN.
          </p>
          {hospital && (
            <p className="mt-2 text-xs text-[#8f0f1a] font-semibold">
              Hospital Code: {hospital.hospitalCode} | Status: {hospital.verificationStatus}
            </p>
          )}
        </div>
        <button 
          onClick={() => navigate('/hospital/blood-requests', { state: { openCreateModal: true } })}
          className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-[#8f0f1a] to-[#c62832] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(143,15,26,0.3)] transition hover:scale-105"
        >
          + Create Blood Request
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <article
            key={card.title}
            className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_25px_55px_rgba(143,15,26,0.12)]"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-[#7a4c4c]">
              {card.title}
            </p>
            <h3
              className={`mt-4 bg-linear-to-r ${card.accent} bg-clip-text text-4xl font-semibold text-transparent`}
            >
              {card.value}
            </h3>
            <p className="mt-2 text-sm text-[#6b3c3c]">{card.meta}</p>
          </article>
        ))}
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_30px_60px_rgba(77,10,15,0.12)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8f0f1a]">
              Urgent Requests
            </p>
            <h3 className="text-2xl font-semibold text-[#2f1012]">
              Critical Requirements
            </h3>
            <p className="text-sm text-[#7a4c4c]">
              Critical units tracked until fulfillment.
            </p>
          </div>
          <button className="rounded-full border border-[#f3c9c0] px-5 py-2 text-sm font-semibold text-[#8f0f1a] transition hover:border-[#8f0f1a]">
            View all requests
          </button>
        </div>

        {urgentRequests.length === 0 ? (
          <div className="mt-5 text-center py-8">
            <p className="text-sm text-[#7a4c4c]">No critical requests at the moment</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {urgentRequests.map((req) => (
              <article
                key={req._id}
                className="rounded-2xl border border-[#f7d5cc] bg-linear-to-br from-[#fff1ed] to-white p-5 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-[#2f1012]">
                    {req.label}
                  </h4>
                  <span className="rounded-full border border-[#f08a8d] px-3 py-1 text-xs font-semibold text-[#8f0f1a]">
                    {req.bloodGroup}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#7a4c4c]">
                  {req.units} units • Requested {req.requestedAt}
                </p>
                <p className="mt-3 text-sm font-medium text-[#a13b44]">
                  {req.status}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
