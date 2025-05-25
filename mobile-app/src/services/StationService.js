import ApiService from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StationService = {  getStationInfo: async () => {
    try {
      const stationId = await AsyncStorage.getItem('stationId');
      console.log('StationService: Retrieved stationId from storage:', stationId);
      
      if (!stationId) {
        throw new Error('Station ID not found. Please login again.');
      }
      
      const response = await ApiService.getStationDashboard(stationId);
      console.log('StationService: getStationInfo response:', response);
      
      if (response && (response.stationName || response.stationId)) {
        // Extract station info from dashboard response
        return {
          id: response.stationId,
          name: response.stationName,
          address: response.address,
          phone: response.phone || 'N/A',
          operatorName: response.operatorName || 'Station Manager',
          registrationNumber: response.registrationNumber,
        };
      } else {
        throw new Error(response.message || 'Failed to load station info');
      }
    } catch (error) {
      console.error('Get station info error:', error);
      // Return mock data for development
      return StationService.getMockStationInfo();
    }
  },

  getTodayStats: async () => {
    try {
      const stationId = await AsyncStorage.getItem('stationId');
      console.log('StationService: Retrieved stationId for stats:', stationId);
      
      if (!stationId) {
        throw new Error('Station ID not found. Please login again.');
      }
      
      const response = await ApiService.getTodayStats(stationId);
      console.log('StationService: getTodayStats response:', response);
      
      if (response && typeof response === 'object') {
        return {
          totalTransactions: response.todayTransactionCount || response.todayTransactions || 0,
          totalLiters: response.todayFuelDispensed || (response.todayPetrolDispensed + response.todayDieselDispensed) || 0,
          totalRevenue: response.todayRevenue || 0,
        };
      } else {
        throw new Error(response.message || 'Failed to load today stats');
      }
    } catch (error) {
      console.error('Get today stats error:', error);
      // Return mock data for development
      return StationService.getMockTodayStats();
    }
  },

  // Mock data for development/testing
  getMockStationInfo: () => {
    return {
      id: 1,
      name: 'City Fuel Station',
      address: '123 Main Street, Colombo 07',
      phone: '+94112345678',
      operatorName: 'Station Manager',
      licenseNumber: 'FS001234',
      operatingHours: '06:00 AM - 10:00 PM',
    };
  },

  getMockTodayStats: () => {
    return {
      totalTransactions: 25,
      totalLiters: 1250.5,
      totalRevenue: 150060.00,
      averageTransactionSize: 50.02,
      peakHour: '08:00 AM - 09:00 AM',
    };
  },
};

export default StationService;
