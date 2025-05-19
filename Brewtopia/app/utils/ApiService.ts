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
const COMPUTER_IP = '104.248.150.14'; // Production server IP
const API_PORT = '4000';
const API_PATH = '/api';

// Try HTTPS first, fallback to HTTP if needed
const DEFAULT_API_URL_HTTPS = `https://${COMPUTER_IP}:${API_PORT}${API_PATH}`;
const DEFAULT_API_URL_HTTP = `http://${COMPUTER_IP}:${API_PORT}${API_PATH}`;

// Simple approach that works on all environments - try HTTPS first
const DEFAULT_API_URL = DEFAULT_API_URL_HTTP; // Start with HTTP since most dev servers don't have HTTPS

// For easier debugging, dynamically check if on physical device using a dedicated environment variable
// This can be set to 'true' when testing on physical devices
const USE_PHYSICAL_DEVICE_URL = true; // Set to true for production
const PHYSICAL_DEVICE_URL = DEFAULT_API_URL;

// Final API URL selection, prioritizing explicit config for physical devices
const API_BASE_URL = Config.API_URL || 
                    (USE_PHYSICAL_DEVICE_URL ? PHYSICAL_DEVICE_URL : DEFAULT_API_URL);

// Increase default timeout for slower network connections (15 seconds)
const DEFAULT_TIMEOUT = parseInt(Config.API_TIMEOUT as string, 10) || 15000;

// Maximum number of retry attempts - increased for better reliability
const MAX_RETRIES = parseInt(Config.MAX_RETRIES as string, 10) || 3;

class ApiService {
  // Generic fetch method with debug logging and retry logic
  async fetch<T>(
    url: string, 
    options: RequestInit = {}, 
    retries = MAX_RETRIES,
    timeout = DEFAULT_TIMEOUT,
    useHttps = false // New parameter to track protocol switching
  ): Promise<T> {
    // Determine which protocol to use
    let baseUrl = API_BASE_URL;
    
    // If we're manually switching protocols during retry
    if (useHttps && baseUrl.startsWith('http:')) {
      baseUrl = baseUrl.replace('http:', 'https:');
    } else if (!useHttps && baseUrl.startsWith('https:')) {
      baseUrl = baseUrl.replace('https:', 'http:');
    }
    
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
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
        DebugService.log(`API Base URL: ${baseUrl}`);
        
        // Retry logic with protocol switching
        if (retries > 0) {
          DebugService.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
          
          // On first retry, try switching protocols (HTTP -> HTTPS or HTTPS -> HTTP)
          if (retries === MAX_RETRIES - 1) {
            DebugService.log(`Switching protocol from ${useHttps ? 'HTTPS to HTTP' : 'HTTP to HTTPS'}`);
            return this.fetch(url, options, retries - 1, timeout, !useHttps);
          }
          
          // Regular retry with the same protocol
          return this.fetch(url, options, retries - 1, timeout, useHttps);
        }
        
        throw {
          status: 0,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.',
        };
      }
      
      // Handle SSL errors specifically
      if (error.message && error.message.includes('SSL')) {
        DebugService.logError(`SSL error on ${method} ${fullUrl}`, error);
        
        // If we get an SSL error and we're using HTTPS, try switching to HTTP
        if (fullUrl.startsWith('https:') && retries > 0) {
          DebugService.log('SSL error detected, switching to HTTP...');
          return this.fetch(url, options, retries - 1, timeout, false);
        }
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
      // Test accounts handling
      if ((email === 'minhkhoi1910@gmail.com' && password === '123') ||
          (email === 'nmkgaming69@gmail.com' && password === '123')) {
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