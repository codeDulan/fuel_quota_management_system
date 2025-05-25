// src/services/NotificationService.js
import { toast } from 'react-toastify';

class NotificationService {
  // Success notification
  success(message, options = {}) {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Error notification
  error(message, options = {}) {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Warning notification
  warning(message, options = {}) {
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Info notification
  info(message, options = {}) {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Loading notification (returns toast id for updates)
  loading(message, options = {}) {
    return toast.loading(message, {
      position: "top-right",
      ...options
    });
  }

  // Update existing toast
  update(toastId, type, message, options = {}) {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 3000,
      ...options
    });
  }

  // Dismiss toast
  dismiss(toastId) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss(); // Dismiss all
    }
  }

  // Promise-based notifications (useful for async operations)
  promise(promise, messages = {}) {
    const defaultMessages = {
      pending: 'Processing...',
      success: 'Operation completed successfully!',
      error: 'Operation failed!'
    };

    const finalMessages = { ...defaultMessages, ...messages };

    return toast.promise(promise, finalMessages, {
      position: "top-right"
    });
  }

  // Custom notification types for fuel quota system
  quotaAlert(message, quotaPercentage) {
    if (quotaPercentage <= 10) {
      this.error(`⛽ Critical Quota Alert: ${message}`, {
        autoClose: false // Don't auto-close critical alerts
      });
    } else if (quotaPercentage <= 25) {
      this.warning(`⛽ Low Quota Warning: ${message}`);
    } else {
      this.info(`⛽ Quota Info: ${message}`);
    }
  }

  transactionSuccess(vehicleReg, amount, fuelType, remainingQuota) {
    this.success(
      `✅ Fuel dispensed: ${amount}L ${fuelType} to ${vehicleReg}. Remaining quota: ${remainingQuota}L`,
      { autoClose: 5000 }
    );
  }

  registrationSuccess(type, identifier) {
    this.success(
      `🎉 ${type} registered successfully! ID: ${identifier}`,
      { autoClose: 4000 }
    );
  }

  authAlert(message) {
    this.error(`🔐 Authentication Error: ${message}`, {
      autoClose: 6000
    });
  }

  networkError() {
    this.error('🌐 Network error. Please check your internet connection.', {
      autoClose: false
    });
  }

  maintenanceAlert() {
    this.warning('🔧 System maintenance in progress. Some features may be unavailable.', {
      autoClose: false
    });
  }
}

export default new NotificationService();