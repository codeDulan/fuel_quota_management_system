// src/services/AuthService.js (Simplified - Works with your current backend)
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

class AuthService {
  constructor() {
    this.tokenKey = 'user';
    this.setupInterceptors();
  }

  // Setup axios interceptors for automatic token handling
  setupInterceptors() {
    // Request interceptor to add auth header
    axios.interceptors.request.use(
      (config) => {
        const user = this.getCurrentUser();
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Login method
  async login(username, password) {
    try {
      const response = await axios.post(API_URL + "signin", {
        username,
        password
      });

      if (response.data.token) {
        // Store user data in localStorage
        localStorage.setItem(this.tokenKey, JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 403) {
        throw new Error('Account is disabled or suspended');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later');
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection');
      }
      
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Logout method
  logout() {
    localStorage.removeItem(this.tokenKey);
    delete axios.defaults.headers.common['Authorization'];
  }

  // Register method
  async register(username, email, password, fullName, phoneNumber, role) {
    try {
      // Map frontend role to backend role
      const roleMapping = {
        'vehicle': 'vehicle',
        'station': 'station',
        'admin': 'admin'
      };

      const response = await axios.post(API_URL + "signup", {
        username,
        email,
        password,
        fullName,
        phoneNumber,
        roles: [roleMapping[role] || 'vehicle']
      });

      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem(this.tokenKey);
    if (!userStr) return null;

    try {
      const userData = JSON.parse(userStr);
      
      // Validate user data structure
      if (!userData.id || !userData.username || !userData.roles) {
        this.logout();
        return null;
      }

      return userData;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  // Get just the token
  getToken() {
    const user = this.getCurrentUser();
    return user?.token || null;
  }

  // Check if user is logged in
  isLoggedIn() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('ROLE_ADMIN');
  }

  // Check if user is station owner
  isStationOwner() {
    return this.hasRole('ROLE_STATION_OWNER');
  }

  // Check if user is vehicle owner
  isVehicleOwner() {
    return this.hasRole('ROLE_VEHICLE_OWNER');
  }

  // Get auth header for manual requests
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get user's dashboard route based on role
  getDashboardRoute() {
    if (this.isAdmin()) return '/admin';
    if (this.isStationOwner()) return '/station';
    if (this.isVehicleOwner()) return '/vehicle';
    return '/';
  }
}

export default new AuthService();