/**
 * ApiService.ts
 * A service to handle API requests with debugging and retry logic
 */

import DebugService from './DebugService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { Platform } from 'react-native';
import UserRoleHelper, { UserRole } from './UserRoleHelper';

// Base API URL with fallback
// Use 10.0.2.2 for Android emulators to refer to host machine
// Use localhost for iOS simulators
// Use physical device IP when running on real devices

/**
 * Smart API URL selection:
 * 1. EMULATOR: Use 10.0.2.2 (Android) or localhost (iOS)
 * 2. PHYSICAL DEVICE: Use computer's IP address on the network
 */
// const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_HOST = Config.API_HOST || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const API_PORT = Config.API_PORT || '4000';
const API_PATH = Config.API_PATH || '/api';

// Use environment variable for API URL
const DEFAULT_API_URL = Config.API_URL || `http://${API_HOST}:${API_PORT}${API_PATH}`;

// Increase default timeout for slower network connections (30 seconds)
const DEFAULT_TIMEOUT = parseInt(Config.API_TIMEOUT as string, 10) || 30000;

// Maximum number of retry attempts
const MAX_RETRIES = parseInt(Config.MAX_RETRIES as string, 10) || 3;

class ApiService {
  private token: string | null = null;
  private isRefreshing: boolean = false;

  constructor() {
    // Load token from storage when service initializes
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
      console.log('Token loaded:', this.token);
      
      // Validate token if exists
      if (this.token) {
        const isValid = await this.validateToken(this.token);
        if (!isValid) {
          console.log('Invalid token found, clearing...');
          await this.clearToken();
        }
      }
    } catch (error) {
      console.error('Error loading token:', error);
      await this.clearToken();
    }
  }

  private async validateToken(token: string): Promise<boolean> {
    try {
      // Make a test request to validate token
      const response = await fetch(`${DEFAULT_API_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  private async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }

  private async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        const checkToken = setInterval(() => {
          if (!this.isRefreshing) {
            clearInterval(checkToken);
            resolve(this.token);
          }
        }, 100);
      });
    }

    this.isRefreshing = true;
    try {
      const response = await fetch(`${DEFAULT_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          this.token = data.token;
          await AsyncStorage.setItem('auth_token', data.token);
          return data.token;
        }
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Generic fetch method with debug logging and retry logic
  async fetch<T>(
    url: string, 
    options: RequestInit = {}, 
    retries = MAX_RETRIES,
    timeout = DEFAULT_TIMEOUT
  ): Promise<T> {
    // Kiểm tra kết nối mạng trước
    const netInfo = await import('@react-native-community/netinfo');
    const networkState = await netInfo.default.fetch();
    
    if (!networkState.isConnected) {
      throw {
        status: 0,
        message: 'Không có kết nối internet. Vui lòng kiểm tra lại kết nối của bạn.'
      };
    }
    
    const fullUrl = url.startsWith('http') ? url : `${DEFAULT_API_URL}${url}`;
    const method = options.method || 'GET';
    
    try {
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Add abort signal to options
      options.signal = controller.signal;
      
      // Prepare headers with auth token if available
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
        ...options.headers,
      };
      
      console.log('Request headers:', headers);
      console.log('Current token:', this.token);
      
      // Log the request
      DebugService.logRequest(fullUrl, method, options.body ? JSON.parse(options.body as string) : null);
      
      // Make the request
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Handle 401 Unauthorized
      if (response.status === 401 && this.token) {
        console.log('Token expired, attempting refresh...');
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry request with new token
          return this.fetch(url, options, retries, timeout);
        } else {
          // Clear token and throw error
          await this.clearToken();
          throw {
            status: 401,
            message: 'Session expired. Please login again.'
          };
        }
      }
      
      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Log the response
      DebugService.logResponse(fullUrl, method, response.status, data);
      
      // Handle error responses
      if (!response.ok) {
        throw {
          status: response.status,
          data,
          message: data.message || 'API request failed',
        };
      }
      
      return data as T;
    } catch (error: any) {
      // Handle aborted requests (timeout)
      if (error.name === 'AbortError') {
        DebugService.logError(`Request timeout for ${method} ${fullUrl}`, error);
        throw {
          status: 408,
          message: 'Request timeout. Please try again later.',
        };
      }
      
      // Handle network errors
      if (error.message && (
          error.message.includes('Network request failed') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network error'))) {
        
        DebugService.logError(`Network error on ${method} ${fullUrl}`, error);
        
        // Retry logic
        if (retries > 0) {
          DebugService.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
          return this.fetch(url, options, retries - 1, timeout);
        }
        
        throw {
          status: 0,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.',
        };
      }
      
      // Log any other errors
      DebugService.logError(`API error on ${method} ${fullUrl}`, error);
      throw error;
    }
  }

  // Auth API methods
  auth = {
    // Login with email and password
    login: async (email: string, password: string, expectedRole?: string) => {
      // Original login logic
      const response = await this.fetch<{
        token: string;
        user: any;
        message?: string;
        cafeId?: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Role validation using UserRoleHelper
      if (expectedRole) {
        const userRole = response.user.role || UserRole.USER;
        if (!UserRoleHelper.isValidRoleForPath(userRole, expectedRole)) {
          throw {
            status: 403,
            message: UserRoleHelper.getRoleValidationError(userRole, expectedRole),
          };
        }
      }
      
      // Store the token for future requests
      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        this.token = response.token;
        if (response.cafeId) {
          await AsyncStorage.setItem('cafeId', response.cafeId);
          console.log('ApiService - Saved cafeId:', response.cafeId);
        }
      }
      
      return response;
    },
    
    // Register a new user
    register: (userData: { 
      email: string; 
      name: string; 
      password: string; 
      role?: string;
    }) => {
      return this.fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    
    // Verify email with code
    verifyCode: async (email: string, code: string) => {
      return this.fetch('/auth/verification', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
    },
    
    // Resend verification code
    resendVerificationCode: async (email: string) => {
      return this.fetch('/auth/verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    
    // Logout
    logout: async () => {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      this.token = null;
      return { success: true };
    },
    
    // Check if user is logged in
    isLoggedIn: async () => {
      return !!this.token;
    },
    
    // Forgot password
    forgotPassword: async (email: string) => {
      return this.fetch('/auth/forgotPassword', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    
    // Đăng nhập Google
    loginWithGoogle: async (code: string) => {
      // Gửi mã code tới backend để lấy token và user info
      const response = await this.fetch<{
        token: string;
        user: any;
        message?: string;
      }>(`/auth/google/callback?code=${code}`, {
        method: 'GET',
      });
      // Lưu token và user info
      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        this.token = response.token;
      }
      return response;
    },

    // Đăng nhập Facebook
    loginWithFacebook: async (accessToken: string) => {
      const response = await this.fetch<{
        token: string;
        user: any;
        message?: string;
      }>('/auth/facebook', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });
      
      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        this.token = response.token;
      }
      return response;
    },
  };

  // Cafe API methods
  cafe = {
    // Create a new cafe for admin
    createCafe: async (adminId: string) => {
      return this.fetch<{
        id: string;
        name: string;
        status: string;
        message?: string;
      }>('/cafes', {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      });
    },

    // Update cafe profile
    updateProfile: async (cafeId: string, profileData: {
      name: string;
      address: string;
      description?: string;
      images?: string[];
      openingHours?: {
        [key: string]: { open: string; close: string; };
      };
    }) => {
      return this.fetch<{
        id: string;
        status: string;
        message: string;
      }>(`/cafes/${cafeId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    // Get cafe profile
    getProfile: async (cafeId: string) => {
      return this.fetch<{
        id: string;
        name: string;
        address: string;
        status: string;
        description?: string;
        images?: string[];
        openingHours?: {
          [key: string]: { open: string; close: string; };
        };
      }>(`/cafes/${cafeId}`, {
        method: 'GET',
      });
    },
  };

  // Payment API methods
  payment = {
    // Create PayOS payment
    createPayosPayment: async (amount: number, description: string) => {
      console.log('Payment API - Current token:', this.token);
      
      if (!this.token) {
        console.log('Payment API - No token found');
        throw {
          status: 401,
          message: 'Please login to make payment'
        };
      }

      console.log('Payment API - Making request with token');
      const response = await this.fetch<{
        data: {
          checkoutUrl: string;
          [key: string]: any;
        };
        message: string;
      }>('/payments/createPayos', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          description
        }),
      });

      // Return the checkout URL for WebView
      return response.data.checkoutUrl;
    },
  };
}

// Export as singleton
export default new ApiService(); 