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
const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_PORT = '4000';
const API_PATH = '/api';

// Use localhost for development
const DEFAULT_API_URL = `http://${API_HOST}:${API_PORT}${API_PATH}`;

// Increase default timeout for slower network connections (30 seconds)
const DEFAULT_TIMEOUT = parseInt(Config.API_TIMEOUT as string, 10) || 30000;

// Maximum number of retry attempts
const MAX_RETRIES = parseInt(Config.MAX_RETRIES as string, 10) || 3;

class ApiService {
  // Generic fetch method with debug logging and retry logic
  async fetch<T>(
    url: string, 
    options: RequestInit = {}, 
    retries = MAX_RETRIES,
    timeout = DEFAULT_TIMEOUT
  ): Promise<T> {
    // For test accounts, return immediately without making API calls
    if (url.includes('/auth/login')) {
      const body = options.body ? JSON.parse(options.body as string) : {};
      if ((body.email === 'minhkhoi1910@gmail.com' && body.password === '123') ||
          (body.email === 'nmkgaming69@gmail.com' && body.password === '123')) {
        return this.handleTestAccountLogin(body.email) as Promise<T>;
      }
    }

    const fullUrl = url.startsWith('http') ? url : `${DEFAULT_API_URL}${url}`;
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

  // Handle test account login
  private async handleTestAccountLogin(email: string) {
    const testUser = email === 'minhkhoi1910@gmail.com' ? {
      email: 'minhkhoi1910@gmail.com',
      name: 'Minh Khoi',
      role: UserRole.USER
    } : {
      email: 'nmkgaming69@gmail.com',
      name: 'NMK Gaming',
      role: UserRole.ADMIN
    };
    
    // Store test user data
    await AsyncStorage.setItem('auth_token', 'test_token');
    await AsyncStorage.setItem('user_data', JSON.stringify(testUser));
    
    return {
      token: 'test_token',
      user: testUser
    };
  }
  
  // Auth API methods
  auth = {
    // Login with email and password
    login: async (email: string, password: string, expectedRole?: string) => {
      // Test accounts handling
      if ((email === 'minhkhoi1910@gmail.com' && password === '123') ||
          (email === 'nmkgaming69@gmail.com' && password === '123')) {
        return this.handleTestAccountLogin(email);
      }

      // Original login logic for other accounts
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