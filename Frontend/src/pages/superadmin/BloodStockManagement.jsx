import { useState, useEffect } from 'react';
import { bloodStockService } from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'];

export default function BloodStockManagement() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allStocks, setAllStocks] = useState([]);
  const [filters, setFilters] = useState({
    bloodBankId: '',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchBloodStockSummary();
    fetchAllBloodStocks();
  }, [filters]);

  const fetchBloodStockSummary = async () => {
    try {
      const response = await bloodStockService.getBloodStockSummary();
      setSummary(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch blood stock summary');
      console.error(error);
    }
  };

  const fetchAllBloodStocks = async () => {
    try {
      setLoading(true);
      const response = await bloodStockService.getAllBloodStocks(filters);
      setAllStocks(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch blood stocks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const getChartData = () => {
    if (!summary || !summary.byBloodGroup) return [];
    return BLOOD_GROUPS.map((group) => ({
      bloodGroup: group,
      units: summary.byBloodGroup[group] || 0,
    }));
  };

  const getLowStockData = () => {
    if (!summary || !summary.byBloodGroup) return [];
    return BLOOD_GROUPS.filter((group) => (summary.byBloodGroup[group] || 0) < 50).map((group) => ({
      name: group,
      units: summary.byBloodGroup[group] || 0,
    }));
  };

  const getStockStatus = (units) => {
    if (units > 100) return { label: 'Healthy', color: 'bg-green-100 text-green-800' };
    if (units > 50) return { label: 'Normal', color: 'bg-yellow-100 text-yellow-800' };
    if (units > 20) return { label: 'Low', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Critical', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blood Stock Management</h1>
        <p className="text-gray-600 mt-2">Monitor blood stock levels across all blood banks</p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Units</p>
            <p className="text-3xl font-bold text-gray-900">{summary.totalUnits}</p>
            <p className="text-xs text-gray-500 mt-2">Across all blood banks</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Most Available</p>
            <p className="text-3xl font-bold text-gray-900">{summary.mostAvailable}</p>
            <p className="text-xs text-gray-500 mt-2">Blood group</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Low Stock Items</p>
            <p className="text-3xl font-bold text-gray-900">{summary.lowStockCount || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Below 50 units</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Blood Banks</p>
            <p className="text-3xl font-bold text-gray-900">{summary.bankCount || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Active blood banks</p>
          </div>
        </div>
      )}

      {/* Alert for Low Stock */}
      {summary && summary.lowStockCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 flex gap-4">
          <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-900">
              {summary.lowStockCount} blood groups are running low
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Please coordinate with blood banks to replenish critical blood types
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Blood Stock by Type - Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock by Blood Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bloodGroup" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="units" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ bloodGroup, units }) => `${bloodGroup}: ${units}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="units"
              >
                {BLOOD_GROUPS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Blood Group Status Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Group Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BLOOD_GROUPS.map((group) => {
            const units = summary?.byBloodGroup?.[group] || 0;
            const status = getStockStatus(units);
            return (
              <div key={group} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">{group}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-600">{units} units</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((units / 200) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low Stock Alert */}
      {getLowStockData().length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            Low Stock Alert
          </h2>
          <div className="space-y-3">
            {getLowStockData().map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-red-600">{item.name}</span>
                  <span className="text-sm text-gray-600">{item.units} units available</span>
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium">
                  Request Supply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Blood Stocks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Blood Stocks</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        ) : allStocks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No blood stocks found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Blood Bank
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Blood Group
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allStocks.map((stock) => {
                  const status = getStockStatus(stock.units);
                  return (
                    <tr key={stock._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {stock.bloodBankName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{stock.bloodGroup}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">
                        {stock.units}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {new Date(stock.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
