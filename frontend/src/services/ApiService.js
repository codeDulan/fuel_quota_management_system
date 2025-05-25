// src/services/ApiService.js
import axios from 'axios';
import authHeader from './authHeader';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth header to requests
api.interceptors.request.use(
  (config) => {
    const authHeaders = authHeader();
    config.headers = { ...config.headers, ...authHeaders };
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== VEHICLE SERVICES ====================
export const VehicleService = {
  // Register a new vehicle
  registerVehicle: (vehicleData) => {
    return api.post('/vehicle/register', vehicleData);
  },

  // Get user's vehicles
  getMyVehicles: () => {
    return api.get('/vehicle/my-vehicles');
  },

  // Validate vehicle without registration
  validateVehicle: (registrationNumber, chassisNumber) => {
    return api.post('/vehicle/validate', {
      registrationNumber,
      chassisNumber
    });
  },

  // Scan QR code (for stations)
  scanVehicleQR: (qrData) => {
    return api.get(`/vehicle/scan/${qrData}`);
  },

  // Get vehicle by ID (admin only)
  getVehicleById: (vehicleId) => {
    return api.get(`/vehicle/${vehicleId}`);
  },

  // Get all vehicles (admin only)
  getAllVehicles: () => {
    return api.get('/vehicle/all');
  }
};


// ==================== USER PROFILE SERVICES ====================
export const UserProfileService = {
  // Get current user profile
  getCurrentProfile: () => {
    return api.get('/user/profile');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return api.put('/user/profile', profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return api.put('/user/profile/password', passwordData);
  }
};


// ==================== FUEL QUOTA SERVICES ====================
export const FuelQuotaService = {
  // Check quota by QR scan (for stations)
  checkQuotaByQR: (qrData) => {
    return api.get(`/fuel/quota/scan/${qrData}`);
  },

  // Check quota by vehicle ID
  checkQuotaByVehicleId: (vehicleId) => {
    return api.get(`/fuel/quota/vehicle/${vehicleId}`);
  },

  // Record fuel pumping transaction
  recordFuelPump: (pumpData) => {
    return api.post('/fuel/pump', pumpData);
  },

  // Get vehicle transaction history
  getVehicleTransactions: (vehicleId) => {
    return api.get(`/fuel/transactions/vehicle/${vehicleId}`);
  },

  // Get station transaction history
  getStationTransactions: (stationId) => {
    return api.get(`/fuel/transactions/station/${stationId}`);
  },

  // Reset vehicle quota (admin only)
  resetVehicleQuota: (vehicleId) => {
    return api.post(`/fuel/quota/reset/${vehicleId}`);
  }
};

// ==================== FUEL STATION SERVICES ====================
export const FuelStationService = {
  // Register a new fuel station
  registerStation: (stationData) => {
    return api.post('/station/register', stationData);
  },

  // Get user's stations
  getMyStations: () => {
    return api.get('/station/my-stations');
  },

  // Get all stations (admin only)
  getAllStations: () => {
    return api.get('/station/all');
  },

  // Get station by ID
  getStationById: (stationId) => {
    return api.get(`/station/${stationId}`);
  },

  // Update station information
  updateStation: (stationId, stationData) => {
    return api.put(`/station/${stationId}`, stationData);
  },

  // Update station status (admin only)
  updateStationStatus: (stationId, active) => {
    return api.put(`/station/${stationId}/status`, null, {
      params: { active }
    });
  },

  // Get nearby stations
  getNearbyStations: (city, fuelType = null) => {
    const params = { city };
    if (fuelType) params.fuelType = fuelType;
    return api.get('/station/nearby', { params });
  },

  // Get station dashboard
  getStationDashboard: (stationId) => {
    return api.get(`/station/${stationId}/dashboard`);
  },

  // Get station statistics
  getStationStatistics: (stationId, startDate, endDate) => {
    return api.get(`/station/${stationId}/statistics`, {
      params: { startDate, endDate }
    });
  },

  // Get station count by city (admin only)
  getStationCountByCity: () => {
    return api.get('/station/analytics/by-city');
  },

  // Get station status summary (admin only)
  getStationStatusSummary: () => {
    return api.get('/station/analytics/status-summary');
  }
};

// ==================== ADMIN SERVICES ====================
export const AdminService = {
  // Get admin dashboard
  getAdminDashboard: () => {
    return api.get('/admin/dashboard');
  },

  // User management
  getAllUsers: (role = null) => {
    const params = role ? { role } : {};
    return api.get('/admin/users', { params });
  },

  getUserById: (userId) => {
    return api.get(`/admin/users/${userId}`);
  },

  updateUserRoles: (userId, roles) => {
    return api.put(`/admin/users/${userId}/roles`, roles);
  },

  updateUserStatus: (userId, active) => {
    return api.put(`/admin/users/${userId}/status`, null, {
      params: { active }
    });
  },

  // Reports
  getFuelConsumptionReport: (startDate, endDate, fuelType = null) => {
    const params = { startDate, endDate };
    if (fuelType) params.fuelType = fuelType;
    return api.get('/admin/reports/fuel-consumption', { params });
  },

  getQuotaUtilizationReport: (month = null) => {
    const params = month ? { month } : {};
    return api.get('/admin/reports/quota-utilization', { params });
  },

  getVehicleRegistrationReport: (startDate, endDate) => {
    return api.get('/admin/reports/vehicle-registrations', {
      params: { startDate, endDate }
    });
  },

  getStationPerformanceReport: (startDate, endDate) => {
    return api.get('/admin/reports/station-performance', {
      params: { startDate, endDate }
    });
  },

  // Quota management
  bulkAllocateQuotas: (vehicleType, fuelType, quotaAmount, period) => {
    return api.post('/admin/quota/bulk-allocate', null, {
      params: { vehicleType, fuelType, quotaAmount, period }
    });
  },

  resetAllQuotas: (confirmationCode) => {
    return api.post('/admin/quota/reset-all', null, {
      params: { confirmationCode }
    });
  },

  // System management
  getSystemHealth: () => {
    return api.get('/admin/system/health');
  },

  getNotificationStatistics: () => {
    return api.get('/admin/system/notifications');
  },

  exportTransactionData: (startDate, endDate, format = 'CSV') => {
    return api.get('/admin/export/transactions', {
      params: { startDate, endDate, format },
      responseType: 'blob' // For file download
    });
  },

  // Analytics
  getTopFuelConsumers: (limit = 10, period = null) => {
    const params = { limit };
    if (period) params.period = period;
    return api.get('/admin/analytics/top-consumers', { params });
  },

  getUsageTrends: (startDate, endDate, groupBy = 'daily') => {
    return api.get('/admin/analytics/usage-trends', {
      params: { startDate, endDate, groupBy }
    });
  },

  getDatabaseStatistics: () => {
    return api.get('/admin/system/database-stats');
  },

  triggerBackup: (backupType = 'FULL') => {
    return api.post('/admin/system/backup', null, {
      params: { backupType }
    });
  }
};

// ==================== ERROR HANDLING UTILITIES ====================
export const ApiErrorHandler = {
  // Extract error message from response
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response && error.request;
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    return error.response?.status === 401;
  },

  // Check if error is authorization related
  isAuthorizationError: (error) => {
    return error.response?.status === 403;
  },

  // Handle common API errors
  handleApiError: (error, showNotification = null) => {
    const message = ApiErrorHandler.getErrorMessage(error);
    
    if (ApiErrorHandler.isNetworkError(error)) {
      const networkMessage = 'Network error. Please check your connection.';
      if (showNotification) showNotification(networkMessage, 'error');
      return networkMessage;
    }
    
    if (ApiErrorHandler.isAuthError(error)) {
      // Token expired, redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
      return 'Session expired. Please login again.';
    }
    
    if (showNotification) showNotification(message, 'error');
    return message;
  }
};

// ==================== REQUEST HELPERS ====================
export const ApiHelpers = {
  // Format date for API requests
  formatDate: (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  },

  // Build query string from params
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },

  // Download file from blob response
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

// ==================== CACHE UTILITIES (Optional) ====================
export const ApiCache = {
  // Simple cache for GET requests
  cache: new Map(),
  
  get: (key) => {
    const item = ApiCache.cache.get(key);
    if (!item) return null;
    
    // Check if cache expired (5 minutes default)
    if (Date.now() - item.timestamp > 300000) {
      ApiCache.cache.delete(key);
      return null;
    }
    
    return item.data;
  },
  
  set: (key, data) => {
    ApiCache.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  clear: () => {
    ApiCache.cache.clear();
  }
};

// Default export with all services
export default {
  VehicleService,
  FuelQuotaService,
  FuelStationService,
  AdminService,
  ApiErrorHandler,
  ApiHelpers,
  ApiCache
};