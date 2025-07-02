/**
 * NetworkHelper.ts
 * Helper functions for network connectivity
 */

import { Platform, NativeModules } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import DebugService from './DebugService';
import Config from 'react-native-config';

class NetworkHelper {
  /**
   * Check if the device has internet connection
   * @returns Promise<boolean> - true if connected, false otherwise
   */
  async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected || false;
    } catch (error) {
      DebugService.logError('Error checking network connection', error);
      return false;
    }
  }

  /**
   * Check if server is reachable
   * @returns Promise<boolean> - true if server is reachable, false otherwise
   */
  async isServerReachable(): Promise<boolean> {
    try {
      // Get the API URL from config or use a default
      const apiUrl = Config.API_URL || 'https://brewtopia-production.up.railway.app/api';
      
      // Add a query parameter to prevent caching
      const testUrl = `${apiUrl}/ping?_=${Date.now()}`;
      
      // Set a short timeout to avoid long waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      DebugService.logError('Error checking server reachability', error);
      return false;
    }
  }

  /**
   * Get detailed network information
   * @returns Promise<object> - Network information
   */
  async getNetworkInfo(): Promise<object> {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        details: state.details,
      };
    } catch (error) {
      DebugService.logError('Error getting network info', error);
      return {
        isConnected: false,
        error: error.message
      };
    }
  }
}

export default new NetworkHelper(); 