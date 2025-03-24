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
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:4000/api',
  ios: 'http://localhost:4000/api',
  default: 'http://10.0.2.2:4000/api'
});

// Get API URL from environment or use default
const API_BASE_URL = Config.API_URL || DEFAULT_API_URL;

// Default timeout for requests in milliseconds (10 seconds)
const DEFAULT_TIMEOUT = parseInt(Config.API_TIMEOUT as string, 10) || 10000;

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
          message: 'Request timeout. Vui lòng thử lại sau.',
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
          message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
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
  };
}

// Export as singleton
export default new ApiService(); 