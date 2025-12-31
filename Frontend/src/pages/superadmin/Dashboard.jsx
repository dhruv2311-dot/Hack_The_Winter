import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertCircle,
  TrendingUp,
  Users,
  Building2,
  Heart,
  Droplet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Try to fetch from backend API
      const response = await adminService.getDashboardOverview();
      
      console.log('Dashboard API Response:', response);
      
      if (response && response.data) {
        // Handle nested data structure from API
        const dashboardData = response.data.data || response.data;
        console.log('Dashboard Data:', dashboardData);
        
        if (dashboardData && dashboardData.organizations) {
          setData(dashboardData);
          toast.success('Dashboard data loaded successfully');
          return;
        }
      }
      
      // Fallback to mock data
      console.log('No valid data received, using mock data');
      setMockData();
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to fetch dashboard data, using mock data');
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const mockData = {
      organizations: {
        total: 45,
        hospitals: 12,
        bloodBanks: 8,
        ngos: 25,
        pending: 3,
        approved: 42,
        suspended: 0
      },
      bloodStock: {
        totalUnitsAvailable: 5400,
        criticalBloodBanks: 2,
        totalBloodBanks: 8,
        status: 'WARNING'
      },
      alerts: {
        total: 8,
        unread: 3,
        critical: 1,
        high: 2
      },
      users: {
        organizationUsers: 156,
        systemAdmins: 5,
        total: 161
      },
      recentActivity: [
        { _id: 1, action: 'HOSPITAL_ACTIVATED', entity: 'City Hospital', timestamp: new Date(Date.now() - 2*60*60*1000) },
        { _id: 2, action: 'BLOOD_STOCK_UPDATE', entity: 'Blood Bank A', timestamp: new Date(Date.now() - 3*60*60*1000) },
        { _id: 3, action: 'APPROVAL_REJECTED', entity: 'NGO Health Plus', timestamp: new Date(Date.now() - 24*60*60*1000) },
        { _id: 4, action: 'NGO_ACTIVATED', entity: 'Red Cross NGO', timestamp: new Date(Date.now() - 48*60*60*1000) },
        { _id: 5, action: 'BLOOD_BANK_SUSPENDED', entity: 'Blood Center B', timestamp: new Date(Date.now() - 72*60*60*1000) }
      ]
    };
    setData(mockData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">No data available</div>;
  }

  const monthlyData = [
    { month: 'Jan', hospitals: 5, ngos: 10, banks: 2 },
    { month: 'Feb', hospitals: 7, ngos: 12, banks: 3 },
    { month: 'Mar', hospitals: 10, ngos: 15, banks: 4 },
    { month: 'Apr', hospitals: 12, ngos: 20, banks: 6 },
    { month: 'May', hospitals: 12, ngos: 22, banks: 7 },
    { month: 'Jun', hospitals: 12, ngos: 25, banks: 8 }
  ];

  const bloodStockData = [
    { name: 'O+', units: 450 },
    { name: 'O-', units: 280 },
    { name: 'A+', units: 520 },
    { name: 'A-', units: 290 },
    { name: 'B+', units: 380 },
    { name: 'B-', units: 210 },
    { name: 'AB+', units: 180 },
    { name: 'AB-', units: 110 }
  ];

  const organizationDistribution = [
    { name: 'Hospitals', value: data.organizations?.hospitals || 12 },
    { name: 'Blood Banks', value: data.organizations?.bloodBanks || 8 },
    { name: 'NGOs', value: data.organizations?.ngos || 25 }
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308'];

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (action) => {
    if (action.includes('ACTIVATED')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (action.includes('REJECTED') || action.includes('SUSPENDED')) return <XCircle className="w-5 h-5 text-red-600" />;
    if (action.includes('UPDATE')) return <Zap className="w-5 h-5 text-blue-600" />;
    return <Clock className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to BloodHub Administration Panel</p>
      </div>

      {/* === PRIMARY STATS CARDS - TOP ROW (MAIN 4) === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Hospitals Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Hospitals</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{data.organizations?.hospitals || 12}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-400 opacity-60" />
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+2.5% this month</span>
          </div>
        </div>

        {/* NGOs Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-purple-700">Total NGOs</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">{data.organizations?.ngos || 25}</p>
            </div>
            <Heart className="w-12 h-12 text-purple-400 opacity-60" />
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+1.2% this month</span>
          </div>
        </div>

        {/* Blood Banks Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border-l-4 border-red-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-red-700">Blood Banks</p>
              <p className="text-3xl font-bold text-red-800 mt-2">{data.organizations?.bloodBanks || 8}</p>
            </div>
            <Droplet className="w-12 h-12 text-red-400 opacity-60" />
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+0.8% this month</span>
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md p-6 border-l-4 border-yellow-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-yellow-700">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-800 mt-2">{data.organizations?.pending || 3}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-400 opacity-60" />
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600 font-medium">Action Required</span>
          </div>
        </div>
      </div>

      {/* === ENHANCED SECONDARY STATS - Blood Stock & Emergency === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Blood Stock Units Card */}
        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl shadow-md p-6 border border-red-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Blood Stock</p>
              <p className="text-3xl font-bold text-red-700 mt-3">{data.bloodStock?.totalUnitsAvailable || 5400}</p>
              <p className="text-xs text-red-600 mt-2">Total units available</p>
            </div>
            <Droplet className="w-14 h-14 text-red-300" />
          </div>
          <div className="mt-4 w-full bg-red-200 rounded-full h-2">
            <div className="bg-red-600 h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>

        {/* Critical Blood Banks Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl shadow-md p-6 border border-yellow-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Critical Banks</p>
              <p className="text-3xl font-bold text-yellow-700 mt-3">{data.bloodStock?.criticalBloodBanks || 2}</p>
              <p className="text-xs text-yellow-600 mt-2">Low stock alert</p>
            </div>
            <AlertTriangle className="w-14 h-14 text-yellow-300" />
          </div>
          <div className="mt-4 p-2 bg-yellow-100 rounded-lg">
            <p className="text-xs font-semibold text-yellow-800">⚠️ Requires attention</p>
          </div>
        </div>

        {/* Active Alerts Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-md p-6 border border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Active Alerts</p>
              <p className="text-3xl font-bold text-purple-700 mt-3">{data.alerts?.total || 8}</p>
              <p className="text-xs text-purple-600 mt-2">System notifications</p>
            </div>
            <Zap className="w-14 h-14 text-purple-300" />
          </div>
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-semibold">Critical: {data.alerts?.critical || 1}</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-semibold">High: {data.alerts?.high || 2}</span>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-md p-6 border border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Active Users</p>
              <p className="text-3xl font-bold text-green-700 mt-3">{data.users?.total || 161}</p>
              <p className="text-xs text-green-600 mt-2">Organization & Admin</p>
            </div>
            <Users className="w-14 h-14 text-green-300" />
          </div>
          <div className="mt-4 text-xs space-y-1">
            <p className="text-green-700">👥 Org Users: {data.users?.organizationUsers || 156}</p>
            <p className="text-green-700">🔐 Admins: {data.users?.systemAdmins || 5}</p>
          </div>
        </div>
      </div>

      {/* === CHARTS SECTION === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Organization Growth */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" /> Organization Growth Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="hospitals" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
              <Line type="monotone" dataKey="ngos" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
              <Line type="monotone" dataKey="banks" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Organization Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Organization Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={organizationDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {organizationDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === BLOOD STOCK BY TYPE & ALERT STATUS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Blood Stock by Group */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-red-600" /> Blood Stock by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bloodStockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="units" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Status Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" /> Alert Summary
          </h3>
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
              <p className="text-sm text-red-700 font-semibold">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{data.alerts?.critical || 1}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-600">
              <p className="text-sm text-orange-700 font-semibold">High Priority</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{data.alerts?.high || 2}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-600">
              <p className="text-sm text-yellow-700 font-semibold">Unread</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{data.alerts?.unread || 3}</p>
            </div>
            <div className={`rounded-lg p-4 border-l-4 ${
              data.bloodStock?.status === 'OK' ? 'bg-green-50 border-green-600' :
              data.bloodStock?.status === 'WARNING' ? 'bg-yellow-50 border-yellow-600' :
              'bg-red-50 border-red-600'
            }`}>
              <p className={`text-sm font-semibold ${
                data.bloodStock?.status === 'OK' ? 'text-green-700' :
                data.bloodStock?.status === 'WARNING' ? 'text-yellow-700' :
                'text-red-700'
              }`}>System Status</p>
              <p className={`text-2xl font-bold mt-1 ${
                data.bloodStock?.status === 'OK' ? 'text-green-600' :
                data.bloodStock?.status === 'WARNING' ? 'text-yellow-600' :
                'text-red-600'
              }`}>{data.bloodStock?.status || 'OK'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* === RECENT ACTIVITY & BLOOD STOCK SUMMARY === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {data.recentActivity && data.recentActivity.slice(0, 5).map((activity, idx) => (
              <div key={activity._id || idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                <div className="mt-1">{getActivityIcon(activity.action)}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{activity.action?.replace(/_/g, ' ') || 'Action'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{activity.entity || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatActivityTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blood Stock Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-red-600" /> Blood Stock Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Units Available</p>
                <p className="text-xs text-gray-600 mt-1">All blood types combined</p>
              </div>
              <span className="text-2xl font-bold text-red-600">{data.bloodStock?.totalUnitsAvailable || 5400}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Critical Banks</p>
                <p className="text-xs text-gray-600 mt-1">Requiring urgent attention</p>
              </div>
              <span className="text-2xl font-bold text-orange-600">{data.bloodStock?.criticalBloodBanks || 2}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Blood Banks</p>
                <p className="text-xs text-gray-600 mt-1">Operational centers</p>
              </div>
              <span className="text-2xl font-bold text-green-600">{data.bloodStock?.totalBloodBanks || 8}</span>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              data.bloodStock?.status === 'OK' ? 'bg-green-50 border-green-300' :
              data.bloodStock?.status === 'WARNING' ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <p className={`text-sm font-semibold ${
                data.bloodStock?.status === 'OK' ? 'text-green-800' :
                data.bloodStock?.status === 'WARNING' ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                ⚠️ Stock Status: <span className="text-lg">{data.bloodStock?.status || 'OK'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === FOOTER SUMMARY CARDS === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-md p-6 border border-indigo-200 hover:shadow-lg transition-shadow">
          <p className="text-sm font-medium text-indigo-700 uppercase tracking-wide">Total Organizations</p>
          <p className="text-4xl font-bold text-indigo-800 mt-3">{data.organizations?.total || 45}</p>
          <p className="text-xs text-indigo-600 mt-2">All registered entities</p>
          <div className="mt-3 w-full bg-indigo-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border border-green-200 hover:shadow-lg transition-shadow">
          <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Approved Status</p>
          <p className="text-4xl font-bold text-green-800 mt-3">{data.organizations?.approved || 42}</p>
          <p className="text-xs text-green-600 mt-2">Operational organizations</p>
          <div className="mt-3 w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '93%' }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl shadow-md p-6 border border-pink-200 hover:shadow-lg transition-shadow">
          <p className="text-sm font-medium text-red-700 uppercase tracking-wide">Suspended</p>
          <p className="text-4xl font-bold text-red-800 mt-3">{data.organizations?.suspended || 0}</p>
          <p className="text-xs text-red-600 mt-2">Currently inactive</p>
          <div className="mt-3 w-full bg-red-200 rounded-full h-2">
            <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
