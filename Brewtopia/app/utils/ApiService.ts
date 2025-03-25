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
 * 2. PHYSICAL DEVICE: Use computer's IP address on the network (192.168.2.125)
 */
const COMPUTER_IP = '192.168.1.82'; // Your computer's IP on the network
const API_PORT = '4000';
const API_PATH = '/api';

// Simple approach that works on Android emulators, iOS simulators, and physical devices
const DEFAULT_API_URL = Platform.select({
  // Android emulator uses 10.0.2.2, physical devices use the computer's actual IP
  android: __DEV__ ? `http://10.0.2.2:${API_PORT}${API_PATH}` : `http://${COMPUTER_IP}:${API_PORT}${API_PATH}`,
  
  // iOS simulator uses localhost, physical devices use the computer's actual IP
  ios: __DEV__ ? `http://localhost:${API_PORT}${API_PATH}` : `http://${COMPUTER_IP}:${API_PORT}${API_PATH}`,
  
  // Default fallback, use computer's IP to support physical devices
  default: `http://${COMPUTER_IP}:${API_PORT}${API_PATH}`
});

// For easier debugging, dynamically check if on physical device using a dedicated environment variable
// This can be set to 'true' when testing on physical devices
const USE_PHYSICAL_DEVICE_URL = true; // Set to true for physical device testing
const PHYSICAL_DEVICE_URL = `http://${COMPUTER_IP}:${API_PORT}${API_PATH}`;

// Final API URL selection, prioritizing explicit config for physical devices
const API_BASE_URL = Config.API_URL || 
                    (USE_PHYSICAL_DEVICE_URL ? PHYSICAL_DEVICE_URL : DEFAULT_API_URL);

// Increase default timeout for slower network connections (15 seconds)
const DEFAULT_TIMEOUT = parseInt(Config.API_TIMEOUT as string, 10) || 15000;

// Maximum number of retry attempts
const MAX_RETRIES = parseInt(Config.MAX_RETRIES as string, 10) || 2;

class ApiService {
  // Generic fetch method with debug logging and retry logic
  async fetch<T>(
    url: string, 
    options: RequestInit = {}, 
    retries = MAX_RETRIES,
    timeout = DEFAULT_TIMEOUT
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const method = options.method || 'GET';
    
    try {
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Add abort signal to options
      options.signal = controller.signal;
      
      // Get auth token if available
      const token = await AsyncStorage.getItem('auth_token');
      
      // Prepare headers with auth token if available
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      };
      
      // Log the request
      DebugService.logRequest(fullUrl, method, options.body ? JSON.parse(options.body as string) : null);
      
      // Make the request
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
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
      if (error.message && error.message.includes('Network request failed')) {
        DebugService.logError(`Network error on ${method} ${fullUrl}`, error);
        DebugService.log(`API Base URL: ${API_BASE_URL}`);
        
        // Retry logic for network errors
        if (retries > 0) {
          DebugService.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
          return this.fetch(url, options, retries - 1, timeout);
        }
        
        throw {
          status: 0,
          message: 'Unable to connect to the server. Please check your network connection.',
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
      const response = await this.fetch<{token: string; user: any}>('/auth/login', {
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
    
    // Logout
    logout: async () => {
      await AsyncStorage.removeItem('auth_token');
      return { success: true };
    },
    
    // Check if user is logged in
    isLoggedIn: async () => {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    },
    
    // Forgot password
    forgotPassword: async (email: string) => {
      return this.fetch('/auth/forgotPassword', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  };
}

// Export as singleton
export default new ApiService(); 