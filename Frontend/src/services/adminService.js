import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Create axios instance with default headers
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to each request
adminAPI.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============= HOSPITAL MANAGEMENT =============
export const hospitalService = {
  getAllHospitals: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return adminAPI.get(`/admin/hospitals?${params.toString()}`);
  },
  
  getHospitalById: (id) => adminAPI.get(`/admin/hospitals/id/${id}`),
  
  getHospitalByCode: (code) => adminAPI.get(`/admin/hospitals/code/${code}`),
  
  activateHospital: (id) => adminAPI.post(`/admin/hospitals/${id}/activate`),
  
  deactivateHospital: (id) => adminAPI.post(`/admin/hospitals/${id}/deactivate`),
  
  updateHospital: (id, data) => adminAPI.put(`/admin/hospitals/${id}`, data),
};

// ============= NGO MANAGEMENT =============
export const ngoService = {
  getAllNGOs: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return adminAPI.get(`/admin/ngos?${params.toString()}`);
  },
  
  getNGOById: (id) => adminAPI.get(`/admin/ngos/id/${id}`),
  
  getNGOByCode: (code) => adminAPI.get(`/admin/ngos/code/${code}`),
  
  activateNGO: (id) => adminAPI.post(`/admin/ngos/${id}/activate`),
  
  deactivateNGO: (id) => adminAPI.post(`/admin/ngos/${id}/deactivate`),
  
  updateNGO: (id, data) => adminAPI.put(`/admin/ngos/${id}`, data),
};

// ============= BLOOD BANK MANAGEMENT =============
export const bloodBankService = {
  getAllBloodBanks: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.emergency24x7 !== undefined) params.append('emergency24x7', filters.emergency24x7);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return adminAPI.get(`/admin/blood-banks?${params.toString()}`);
  },
  
  getBloodBankById: (id) => adminAPI.get(`/admin/blood-banks/id/${id}`),
  
  getBloodBankByCode: (code) => adminAPI.get(`/admin/blood-banks/code/${code}`),
  
  activateBloodBank: (id) => adminAPI.post(`/admin/blood-banks/${id}/activate`),
  
  deactivateBloodBank: (id) => adminAPI.post(`/admin/blood-banks/${id}/deactivate`),
  
  updateBloodBank: (id, data) => adminAPI.put(`/admin/blood-banks/${id}`, data),
};

// ============= BLOOD STOCK MANAGEMENT =============
export const bloodStockService = {
  getBloodStockSummary: () => adminAPI.get(`/admin/blood-stock/summary`),
  
  getAllBloodStocks: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.bloodBankId) params.append('bloodBankId', filters.bloodBankId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return adminAPI.get(`/admin/blood-stock?${params.toString()}`);
  },
  
  getBloodStockByBankId: (bankId) => adminAPI.get(`/admin/blood-stock/bank/${bankId}`),
};

// ============= APPROVAL MANAGEMENT =============
export const approvalService = {
  getAllPendingApprovals: () => adminAPI.get(`/admin/approvals/pending/all`),
  
  getPendingApprovals: (type) => adminAPI.get(`/admin/approvals/pending?type=${type}`),
  
  getPendingHospitals: () => adminAPI.get(`/admin/approvals/pending/hospitals`),
  
  getPendingBloodBanks: () => adminAPI.get(`/admin/approvals/pending/bloodbanks`),
  
  getPendingNGOs: () => adminAPI.get(`/admin/approvals/pending/ngos`),
  
  getApprovalStats: () => adminAPI.get(`/admin/approvals/stats`),
  
  getOrganizationDetails: (id) => adminAPI.get(`/admin/approvals/${id}`),
  
  approveOrganization: (data) => adminAPI.post(`/admin/approvals/approve`, data),
  
  rejectOrganization: (data) => adminAPI.post(`/admin/approvals/reject`, data),
  
  suspendOrganization: (data) => adminAPI.post(`/admin/approvals/suspend`, data),
};

// ============= DASHBOARD STATISTICS =============
export const dashboardService = {
  getDashboardStats: () => adminAPI.get(`/admin/dashboard/stats`),
  
  getRecentActivities: () => adminAPI.get(`/admin/dashboard/activities`),
  
  getAlerts: () => adminAPI.get(`/admin/alerts`),
};
// ============= NEW DASHBOARD API =============
const dashboardAPI = {
  getDashboardOverview: () => adminAPI.get(`/admin/dashboard/overview`),
  
  getOrganizationStats: () => adminAPI.get(`/admin/dashboard/organizations`),
  
  getBloodStockStats: () => adminAPI.get(`/admin/dashboard/blood-stock`),
  
  getAlertStats: () => adminAPI.get(`/admin/dashboard/alerts`),
  
  getUserStats: () => adminAPI.get(`/admin/dashboard/users`),
  
  getRecentActivity: (limit = 10) => adminAPI.get(`/admin/dashboard/activity?limit=${limit}`),
  
  getSystemHealth: () => adminAPI.get(`/admin/dashboard/health`),
};

// Merge dashboard services
const adminService = {
  ...dashboardService,
  ...dashboardAPI,
};
// ============= AUDIT & MONITORING =============
export const auditService = {
  getAuditLogs: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.action) params.append('action', filters.action);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return adminAPI.get(`/admin/audit-logs?${params.toString()}`);
  },
};

export default adminService;
