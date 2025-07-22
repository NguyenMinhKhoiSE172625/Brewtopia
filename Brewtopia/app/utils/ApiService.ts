/**
 * ApiService.ts
 * A service to handle API requests with debugging and retry logic
 */

import DebugService from './DebugService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import UserRoleHelper, { UserRole } from './UserRoleHelper';

// Base API URL with fallback
// Use 10.0.2.2 for Android emulators to refer to host machine
// Use localhost for iOS simulators
// Use physical device IP when running on real devices

/**
 * Production API URL:
 * Using deployed backend on Render
 */
const DEFAULT_API_URL = 'https://brewtopia-production.up.railway.app/api';

// Increase default timeout for slower network connections (30 seconds)
const DEFAULT_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT as string, 10) || 30000;

// Maximum number of retry attempts
const MAX_RETRIES = parseInt(process.env.EXPO_PUBLIC_MAX_RETRIES as string, 10) || 2;

// Request cache for GET requests
const requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ApiService {
  private token: string | null = null;
  private isRefreshing: boolean = false;

  constructor() {
    // Load token from storage when service initializes
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('token');
      
      // Validate token if exists
      if (this.token) {
        const isValid = await this.validateToken(this.token);
        if (!isValid) {
          await this.clearToken();
        }
      }
    } catch (error) {
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
      return false;
    }
  }

  private async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('token');
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
          await AsyncStorage.setItem('token', data.token);
          return data.token;
        }
      }
      return null;
    } catch (error) {
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
    const fullUrl = url.startsWith('http') ? url : `${DEFAULT_API_URL}${url}`;
    const method = options.method || 'GET';
    
    // Check cache for GET requests
    if (method === 'GET' && !options.body) {
      const cacheKey = fullUrl;
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.log(`🔄 Cache hit for: ${method} ${fullUrl}`);
        return cached.data;
      }
    }
    
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
      
      // Log the request
      console.log(`Request headers: ${JSON.stringify(headers)}`);
      console.log(`Current token: ${this.token}`);
      
      // Log the request
      console.log(`🔥 API Request: ${method} ${fullUrl}`);
      
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
      console.log(`✅ API Response: ${method} ${fullUrl} - Status: ${response.status}`, data);
      
      // Handle error responses
      if (!response.ok) {
        throw {
          status: response.status,
          data,
          message: data.message || 'API request failed',
        };
      }
      
      // Cache GET requests
      if (method === 'GET' && !options.body && response.ok) {
        const cacheKey = fullUrl;
        requestCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: CACHE_TTL
        });
        
        // Clean old cache entries
        if (requestCache.size > 100) {
          const now = Date.now();
          for (const [key, value] of requestCache.entries()) {
            if (now - value.timestamp > value.ttl) {
              requestCache.delete(key);
            }
          }
        }
      }
      
      return data as T;
    } catch (error: any) {
      // Handle aborted requests (timeout)
      if (error.name === 'AbortError') {
        console.log(`Request timeout for ${method} ${fullUrl}`);
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
        
        console.log(`Network error on ${method} ${fullUrl}`);
        
        // Retry logic
        if (retries > 0) {
          console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
          return this.fetch(url, options, retries - 1, timeout);
        }
        
        throw {
          status: 0,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.',
        };
      }
      
      // Log any other errors
      console.log(`API error on ${method} ${fullUrl}`);
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
        console.log('ApiService - Login response user:', response.user);
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        // Store userId separately for easy access (only if it exists)
        const userId = response.user?.id || response.user?._id;
        if (userId) {
          console.log('ApiService - Saving userId:', userId);
          await AsyncStorage.setItem('userId', userId);
        } else {
          console.log('ApiService - No userId found in response.user:', response.user);
        }
        this.token = response.token;

        // For admin users, save cafeId from response
        if (response.user.role === 'admin') {
          if (response.cafeId) {
            await AsyncStorage.setItem('cafeId', response.cafeId);
            console.log('ApiService - Saved cafeId from login response:', response.cafeId);
          } else {
            console.log('ApiService - No cafeId found in login response');
          }
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
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('cafeId');
      this.token = null;
      return { success: true };
    },
    
    // Check if user is logged in
    isLoggedIn: async () => {
      return !!this.token;
    },
    
    // Forgot password
    forgotPassword: async (email: string) => {
      return this.fetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    // Reset password
    resetPassword: async (token: string, newPassword: string) => {
      return this.fetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    },
    
    // Đăng nhập Google
    loginWithGoogle: async (code: string) => {
      // Gửi mã code tới backend để lấy token và user info
      const response = await this.fetch<{
        token: string;
        user: any;
        message?: string;
        cafeId?: string;
      }>(`/auth/google/callback?code=${code}`, {
        method: 'GET',
      });
      // Lưu token và user info
      if (response.token) {
        console.log('ApiService - Google login response user:', response.user);
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        // Store userId separately for easy access (only if it exists)
        const userId = response.user?.id || response.user?._id;
        if (userId) {
          console.log('ApiService - Google login: Saving userId:', userId);
          await AsyncStorage.setItem('userId', userId);
        } else {
          console.log('ApiService - Google login: No userId found in response.user:', response.user);
        }
        this.token = response.token;

        // For admin users, save cafeId from response
        if (response.user.role === 'admin') {
          if (response.cafeId) {
            await AsyncStorage.setItem('cafeId', response.cafeId);
            console.log('ApiService - Google login: Saved cafeId from response:', response.cafeId);
          } else {
            console.log('ApiService - Google login: No cafeId found in response');
          }
        }
      }
      return response;
    },

    // Đăng nhập Facebook
    loginWithFacebook: async (accessToken: string) => {
      const response = await this.fetch<{
        token: string;
        user: any;
        message?: string;
        cafeId?: string;
      }>('/auth/facebook', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      if (response.token) {
        console.log('ApiService - Facebook login response user:', response.user);
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        // Store userId separately for easy access (only if it exists)
        const userId = response.user?.id || response.user?._id;
        if (userId) {
          console.log('ApiService - Facebook login: Saving userId:', userId);
          await AsyncStorage.setItem('userId', userId);
        } else {
          console.log('ApiService - Facebook login: No userId found in response.user:', response.user);
        }
        this.token = response.token;

        // For admin users, save cafeId from response
        if (response.user.role === 'admin') {
          if (response.cafeId) {
            await AsyncStorage.setItem('cafeId', response.cafeId);
            console.log('ApiService - Facebook login: Saved cafeId from response:', response.cafeId);
          } else {
            console.log('ApiService - Facebook login: No cafeId found in response');
          }
        }
      }
      return response;
    },
  };

  // Cafe API methods
  cafe = {

    // Update cafe profile
    updateProfile: async (cafeId: string, profileData: {
      name?: string;
      shopName?: string;
      address?: string | {
        street?: string;
        ward?: string;
        district?: string;
        city?: string;
        coordinates?: [number, number];
      };
      email?: string;
      phoneNumber?: string;
      description?: string;
      images?: string[];
      openingHours?: {
        [key: string]: { open: string; close: string; };
      };
      status?: string;
      taxInfo?: {
        taxCode?: string;
        businessType?: string;
      };
      identification?: {
        nationality?: string;
        citizenIdImage?: string;
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
        address: string | {
          street?: string;
          ward?: string;
          district?: string;
          city?: string;
          coordinates?: [number, number];
        };
        email?: string;
        phoneNumber?: string;
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

    // Get all cafes
    getAllCafes: async () => {
      return this.fetch<Array<{
        _id: string;
        name: string;
        shopName?: string;
        address: string | {
          street?: string;
          ward?: string;
          district?: string;
          city?: string;
          coordinates?: [number, number];
        };
        rating?: number;
        status?: string;
        closingTime?: string;
        images?: string[];
        menu?: string[];
        menuid?: string;
        openingHours?: {
          [key: string]: { open: string; close: string; };
        };
      }>>('/cafes', {
        method: 'GET',
      });
    },

    // Get cafe by owner ID (để xử lý event navigation)
    getCafeByOwner: async (ownerId: string) => {
      const allCafes = await this.fetch<Array<{
        _id: string;
        owner: string;
        name?: string;
        shopName?: string;
        address: string | {
          street?: string;
          ward?: string;
          district?: string;
          city?: string;
          coordinates?: [number, number];
        };
        rating?: number;
        status?: string;
        closingTime?: string;
        images?: string[];
        menu?: string[];
        menuid?: string;
        description?: string;
        openingHours?: {
          [key: string]: { open: string; close: string; };
        };
      }>>('/cafes', {
        method: 'GET',
      });
      
      // Tìm cafe có owner khớp với ownerId
      return allCafes.find(cafe => cafe.owner === ownerId) || null;
    },
  };

  // Payment API methods
  payment = {
    // Create PayOS payment
    createPayosPayment: async (amount: number, description: string, targetModel: string = 'UpgradePremium') => {
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
          targetModel,
          amount,
          description,
          returnUrl: 'brewtopia://payment-success',
          cancelUrl: 'brewtopia://payment-cancel'
        }),
      });

      // Return the checkout URL for WebView
      return response.data.checkoutUrl;
    },
    callPayOsWebhook: async (orderCode: string, status: string = 'PAID') => {
      return this.fetch<any>(`/payments/webhook/PayOs?orderCode=${orderCode}&status=${status}`, {
        method: 'GET',
      });
    },
  };

  // Posts API methods
  posts = {
    // Get all posts with pagination
    getPosts: async (page: number = 1, limit: number = 10) => {
      return this.fetch<{
        message: string;
        data: Array<{
          shareCount: number;
          _id: string;
          user: string;
          content: string;
          images: string[];
          createdAt: string;
          updatedAt: string;
          likeCount: number;
        }>;
        total: number;
        page: number;
        totalPages: number;
      }>(`/posts/Allpost?page=${page}&limit=${limit}`, {
        method: 'GET',
      });
    },

    // Create a new post
    createPost: async (content: string, images: string[] = []) => {
      return this.fetch<{
        message: string;
        post: any;
      }>('/posts/Allpost', {
        method: 'POST',
        body: JSON.stringify({
          content,
          images
        }),
      });
    },

    // Like/unlike a post
    toggleLike: async (postId: string) => {
      return this.fetch<{
        message: string;
        liked: boolean;
        likeCount: number;
      }>(`/posts/${postId}/like`, {
        method: 'POST',
      });
    },

    // Add comment to a post
    addComment: async (targetId: string, content: string, targetType: string = 'Post') => {
      return this.fetch<{
        _id: string;
        user?: string; // User có thể undefined
        content: string;
        createdAt: string;
        updatedAt: string;
        targetId: string;
        targetType: string;
        likes: any[];
      }>('/comments', {
        method: 'POST',
        body: JSON.stringify({
          targetId,
          targetType,
          content
        }),
      });
    },

    // Get comments for a post - API trả về array trực tiếp
    getComments: async (targetId: string, targetType: string = 'Post') => {
      return this.fetch<Array<{
        _id: string;
        user?: string; // API trả về user ID thay vì object, có thể undefined
        content: string;
        createdAt: string;
        updatedAt: string;
        targetId: string;
        targetType: string;
        likes: any[];
      }>>('/comments/allComments', {
        method: 'POST',
        body: JSON.stringify({
          targetId,
          targetType
        }),
      });
    },

    // Alternative method if backend requires GET with query params instead of body
    getCommentsWithQuery: async (targetId: string, targetType: string = 'Post') => {
      return this.fetch<{
        message: string;
        comments: Array<{
          _id: string;
          user: {
            _id: string;
            name: string;
            email: string;
          };
          content: string;
          createdAt: string;
          updatedAt: string;
        }>;
      }>(`/comments?targetId=${targetId}&targetType=${targetType}`, {
        method: 'GET',
      });
    },
  };

  // User API methods
  user = {
    // Get user profile
    getProfile: async (userId: string) => {
      return this.fetch<{
        _id: string;
        id: string;
        name: string;
        email: string;
        avatar?: string;
        AccStatus?: string;
        [key: string]: any;
      }>(`/users/${userId}`, {
        method: 'GET',
      });
    },

    // Cập nhật thông tin user (ví dụ: AccStatus)
    updateUser: async (userId: string, data: { [key: string]: any }) => {
      return this.fetch<{ id: string; status: string; message: string }>(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // Get user stats and points
    getStats: async () => {
      return this.fetch<{
        totalOrders: number;
        totalPoints: number;
        totalReviews: number;
        favoriteShops: number;
      }>('/users/stats', {
        method: 'GET',
      });
    },

    // Get admin stats
    getAdminStats: async () => {
      return this.fetch<{
        totalSales: number;
        totalCustomers: number;
        totalEvents: number;
        totalMenuItems: number;
      }>('/admin/stats', {
        method: 'GET',
      });
    },
  };

  // Event API methods
  events = {
    // Lấy danh sách event
    getEvents: async () => {
      return this.fetch<Array<{
        Countfollower: number;
        _id: string;
        title: string;
        description: string;
        image: string;
        followers: string[];
        createdAt: string;
        updatedAt: string;
        cafe?: string;
      }>>('/events', {
        method: 'GET',
      });
    },
  };
}

// Export as singleton
export default new ApiService(); 