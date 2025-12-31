import { useState, useEffect } from 'react';
import { bloodStockService } from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function BloodStockManagement() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankDetailModal, setBankDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
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
      const stockData = response.data.data || {};
      const stockDocs = stockData.stocks || [];
      
      // Group stocks by blood bank
      const bankMap = new Map();
      
      stockDocs.forEach((bankStock) => {
        const bankId = bankStock._id;
        
        if (!bankMap.has(bankId)) {
          bankMap.set(bankId, {
            _id: bankId,
            bloodBankId: bankStock.bloodBankId,
            bloodBankCode: bankStock.bloodBankCode,
            bloodBankName: bankStock.bloodBankName || bankStock.bloodBankCode || 'Unknown',
            totalUnitsAvailable: bankStock.totalUnitsAvailable || 0,
            lastStockUpdateAt: bankStock.lastStockUpdateAt || new Date(),
            bloodStock: bankStock.bloodStock || {},
            criticalCount: bankStock.criticalCount || 0,
          });
        }
      });
      
      const banksArray = Array.from(bankMap.values());
      setBloodBanks(banksArray);
    } catch (error) {
      toast.error('Failed to fetch blood stocks');
      console.error('Error fetching blood stocks:', error);
      setBloodBanks([]);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const getChartData = () => {
    if (!summary || !summary.bloodGroupBreakdown) return [];
    return BLOOD_GROUPS.map((group) => ({
      bloodGroup: group,
      units: summary.bloodGroupBreakdown[group] || 0,
    }));
  };

  const getMostAvailable = () => {
    if (!summary || !summary.bloodGroupBreakdown) return 'N/A';
    const bloodGroups = Object.entries(summary.bloodGroupBreakdown);
    if (bloodGroups.length === 0) return 'N/A';
    const [group] = bloodGroups.reduce((prev, current) =>
      prev[1] > current[1] ? prev : current
    );
    return group;
  };

  const getLowStockCount = () => {
    if (!summary || !summary.bloodGroupBreakdown) return 0;
    return Object.values(summary.bloodGroupBreakdown).filter(units => units < 50).length;
  };

  const getLowStockData = () => {
    if (!summary || !summary.bloodGroupBreakdown) return [];
    return Object.entries(summary.bloodGroupBreakdown)
      .filter(([_, units]) => units < 50)
      .map(([name, units]) => ({
        name,
        units,
      }));
  };

  const getStockStatus = (units) => {
    if (units > 100) return { label: 'Healthy', color: 'bg-green-100 text-green-800' };
    if (units > 50) return { label: 'Normal', color: 'bg-yellow-100 text-yellow-800' };
    if (units > 20) return { label: 'Low', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Critical', color: 'bg-red-100 text-red-800' };
  };

  const getBankHealthStatus = (bank) => {
    const totalUnits = bank.totalUnitsAvailable || 0;
    const criticalItems = Object.entries(bank.bloodStock || {}).filter(
      ([_, data]) => (data.units || 0) < 10
    ).length;
    
    if (totalUnits > 200 && criticalItems === 0) {
      return { label: 'Excellent', color: 'bg-green-100 text-green-800', icon: '✓' };
    } else if (totalUnits > 100 && criticalItems < 2) {
      return { label: 'Good', color: 'bg-blue-100 text-blue-800', icon: '✓' };
    } else if (totalUnits > 50) {
      return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800', icon: '⚠' };
    } else if (totalUnits > 20) {
      return { label: 'Low', color: 'bg-orange-100 text-orange-800', icon: '!' };
    }
    return { label: 'Critical', color: 'bg-red-100 text-red-800', icon: '!' };
  };

  const openBankDetail = (bank) => {
    setSelectedBank(bank);
    setBankDetailModal(true);
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
            <p className="text-3xl font-bold text-gray-900">{summary.totalUnitsAvailable || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Across all blood banks</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Most Available</p>
            <p className="text-3xl font-bold text-gray-900">{getMostAvailable()}</p>
            <p className="text-xs text-gray-500 mt-2">Blood group</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Low Stock Items</p>
            <p className="text-3xl font-bold text-gray-900">{getLowStockCount()}</p>
            <p className="text-xs text-gray-500 mt-2">Below 50 units</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
            <p className="text-gray-600 text-sm font-semibold mb-2">Blood Banks</p>
            <p className="text-3xl font-bold text-gray-900">{summary.bloodBankCount || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Active blood banks</p>
          </div>
        </div>
      )}

      {/* Alert for Low Stock */}
      {getLowStockCount() > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 flex gap-4">
          <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-900">
              {getLowStockCount()} blood groups are running low
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Please coordinate with blood banks to replenish critical blood types
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 mb-8">
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
      </div>

      {/* Blood Group Status Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Group Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BLOOD_GROUPS.map((group) => {
            const units = summary?.bloodGroupBreakdown?.[group] || 0;
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

      {/* All Blood Banks with Health Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Blood Banks</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        ) : bloodBanks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No blood banks found
          </div>
        ) : (
          <div className="space-y-4">
            {bloodBanks.map((bank) => {
              const health = getBankHealthStatus(bank);
              const lowBloodGroups = Object.entries(bank.bloodStock || {})
                .filter(([_, data]) => (data.units || 0) < 10)
                .map(([bg, _]) => bg);
              
              return (
                <div
                  key={bank._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => openBankDetail(bank)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{bank.bloodBankName}</h3>
                      <p className="text-sm text-gray-500">Code: {bank.bloodBankCode}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${health.color}`}>
                      {health.icon} {health.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Total Units</p>
                      <p className="text-2xl font-bold text-gray-900">{bank.totalUnitsAvailable}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Critical Items</p>
                      <p className="text-2xl font-bold text-red-600">{bank.criticalCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(bank.lastStockUpdateAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {lowBloodGroups.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-700 mb-2">
                        Low Stock: {lowBloodGroups.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Eye size={16} />
                    <span className="text-sm font-medium">View Blood Stock Report</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bank Detail Modal */}
      {bankDetailModal && selectedBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedBank.bloodBankName}</h2>
                <p className="text-sm text-gray-500 mt-1">Code: {selectedBank.bloodBankCode}</p>
              </div>
              <button
                onClick={() => setBankDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Bank Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-semibold text-red-700 mb-2">Total Units Available</p>
                  <p className="text-3xl font-bold text-red-900">{selectedBank.totalUnitsAvailable}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm font-semibold text-orange-700 mb-2">Critical Items</p>
                  <p className="text-3xl font-bold text-orange-900">{selectedBank.criticalCount}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-2">Last Updated</p>
                  <p className="text-lg font-bold text-blue-900">
                    {new Date(selectedBank.lastStockUpdateAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Blood Stock Report */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Stock Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BLOOD_GROUPS.map((group) => {
                    const data = selectedBank.bloodStock[group];
                    const units = data?.units || 0;
                    const status = getStockStatus(units);
                    
                    return (
                      <div
                        key={group}
                        className={`rounded-lg p-4 border-2 ${
                          units < 10
                            ? 'border-red-300 bg-red-50'
                            : units < 50
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-green-300 bg-green-50'
                        }`}
                      >
                        <p className="text-lg font-bold text-gray-900 mb-2">{group}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">{units} units</p>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                        <div className="w-full bg-gray-300 rounded-full h-2 mt-3">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              units < 10
                                ? 'bg-red-600'
                                : units < 50
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min((units / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                        {data?.lastUpdated && (
                          <p className="text-xs text-gray-500 mt-2">
                            Updated: {new Date(data.lastUpdated).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setBankDetailModal(false)}
                  className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
