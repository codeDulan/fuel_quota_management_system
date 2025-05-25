import ApiService from './ApiService';

const TransactionService = {
  processTransaction: async (transactionData) => {
    try {
      const response = await ApiService.processTransaction(transactionData);
      
      if (response.success) {
        return {
          success: true,
          transactionId: response.transactionId,
          message: response.message,
        };
      } else {
        throw new Error(response.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Process transaction error:', error);
      throw error;
    }
  },

  getTransactionHistory: async () => {
    try {
      const response = await ApiService.getTransactionHistory();
      
      if (response.success) {
        return response.transactions || [];
      } else {
        throw new Error(response.message || 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Get transaction history error:', error);
      // Return mock data for development
      return this.getMockTransactionHistory();
    }
  },

  // Mock data for development/testing
  getMockTransactionHistory: () => {
    return [
      {
        id: 1,
        vehicleNumber: 'ABC-1234',
        ownerName: 'John Doe',
        liters: 25.5,
        totalAmount: 3060.00,
        status: 'Completed',
        timestamp: '2024-05-24T09:30:00Z',
      },
      {
        id: 2,
        vehicleNumber: 'XYZ-5678',
        ownerName: 'Jane Smith',
        liters: 40.0,
        totalAmount: 4800.00,
        status: 'Completed',
        timestamp: '2024-05-24T08:15:00Z',
      },
      {
        id: 3,
        vehicleNumber: 'DEF-9012',
        ownerName: 'Bob Johnson',
        liters: 15.2,
        totalAmount: 1824.00,
        status: 'Completed',
        timestamp: '2024-05-24T07:45:00Z',
      },
    ];
  },
};

export default TransactionService;
