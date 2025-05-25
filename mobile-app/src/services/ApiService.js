import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Actual IP address of the pc where the backend server is running
export const API_BASE_URL = 'http://192.168.8.111:8080/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

const ApiService = {
  // Auth endpoints
  login: async (username, password) => {
    console.log('Making login request to:', `${API_BASE_URL}/auth/signin`);
    const response = await apiClient.post('/auth/signin', {
      username,
      password,
    });
    return response.data;
  },
  
  // Vehicle quota endpoints
  checkQuotaByQR: async (qrData) => {
    const response = await apiClient.get(`/fuel/quota/scan/${qrData}`);
    return response.data;
  },

  // Transaction endpoints
  recordFuelPump: async (fuelPumpData) => {
    const response = await apiClient.post('/fuel/pump', fuelPumpData);
    return response.data;
  },

  getStationTransactions: async (stationId) => {
    const response = await apiClient.get(`/fuel/transactions/station/${stationId}`);
    return response.data;
  },
  
  // Station endpoints
  getMyStations: async () => {
    const response = await apiClient.get('/station/my-stations');
    return response.data;
  },

  getStationInfo: async (stationId) => {
    const response = await apiClient.get(`/station/${stationId}`);
    return response.data;
  },

  // Get station dashboard with today's stats
  getStationDashboard: async (stationId) => {
    const response = await apiClient.get(`/station/${stationId}/dashboard`);
    return response.data;
  },

  // Get today's stats for a station 
  getTodayStats: async (stationId) => {
    const response = await apiClient.get(`/station/${stationId}/dashboard`);
    return response.data;
  },
};

export default ApiService;
