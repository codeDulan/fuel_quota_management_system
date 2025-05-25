import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './ApiService';

// Get the API_BASE_URL from ApiService
const getApiBaseUrl = () => {
  return 'http://192.168.8.111:8080/api';
};

const AuthService = {
  login: async (username, password) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      console.log('Attempting login to:', `${apiBaseUrl}/auth/signin`);
      console.log('Login credentials:', { username, password: '***' });
      
      const response = await ApiService.login(username, password);
      
      if (response.token) {
        // Store basic auth info
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userRole', response.roles[0]); // Get first role
        
        // If user is a station owner, get their station ID
        if (response.roles[0] === 'ROLE_STATION_OWNER') {
          try {
            const stationsResponse = await ApiService.getMyStations();
            if (stationsResponse && stationsResponse.length > 0) {
              // For now, use the first station if multiple stations
              const stationId = stationsResponse[0].id;
              await AsyncStorage.setItem('stationId', stationId.toString());
              console.log('Stored stationId:', stationId);
            }
          } catch (stationError) {
            console.warn('Failed to fetch station info:', stationError);
            // Don't fail login if station fetch fails
          }
        }
        
        console.log('Login successful, role:', response.roles[0]);
        return { success: true, role: response.roles[0] };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
        if (error.response?.status === 401) {
        return { success: false, message: 'Invalid username or password' };
      } else if (error.response?.status === 403) {
        return { success: false, message: 'Access denied. Station owner account required.' };
      } else if (error.response?.data?.message) {
        return { success: false, message: error.response.data.message };
      }
      
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userRole', 'stationId']);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Failed to logout' };
    }
  },

  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const role = await AsyncStorage.getItem('userRole');
      const stationId = await AsyncStorage.getItem('stationId');
      
      if (token) {
        return {
          token,
          role,
          stationId: stationId ? parseInt(stationId) : null
        };
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }
};

export default AuthService;
