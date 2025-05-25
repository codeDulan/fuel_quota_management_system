import ApiService from './ApiService';

const VehicleService = {
  getVehicleByQR: async (qrCode) => {
    try {
      const response = await ApiService.getVehicleByQR(qrCode);
      
      if (response.success) {
        return {
          id: response.vehicle.id,
          vehicleNumber: response.vehicle.vehicleNumber,
          vehicleType: response.vehicle.vehicleType,
          ownerName: response.vehicle.ownerName,
          ownerPhone: response.vehicle.ownerPhone,
          availableQuota: response.vehicle.availableQuota,
          totalQuota: response.vehicle.totalQuota,
          lastTransaction: response.vehicle.lastTransaction,
        };
      } else {
        throw new Error(response.message || 'Vehicle not found');
      }
    } catch (error) {
      console.error('Get vehicle by QR error:', error);
      throw error;
    }
  },

  // Mock data for development/testing
  getMockVehicleData: (qrCode) => {
    // This can be used for testing when backend is not available
    return {
      id: 1,
      vehicleNumber: 'ABC-1234',
      vehicleType: 'Car',
      ownerName: 'John Doe',
      ownerPhone: '+94771234567',
      availableQuota: 50.0,
      totalQuota: 100.0,
      lastTransaction: '2024-05-23T10:30:00Z',
    };
  },
};

export default VehicleService;
