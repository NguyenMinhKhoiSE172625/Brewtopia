// Load từ environment variables
export const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyD_M3ZYZLMAI-oU_YSs_h_MWGUAivujm3U';
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://brewtopia-production.up.railway.app/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://brewtopia-production.up.railway.app';
export const DEBUG_MODE = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || true; // Bật debug mode để troubleshoot socket

// UI Constants
export const PRIMARY_BROWN = '#7B4B27'; // Nâu đậm template web

// Debug helper
export const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, data ? data : '');
  }
}; 