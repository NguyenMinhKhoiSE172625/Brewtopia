import Constants from 'expo-constants';

// Map provider types
export type MapProvider = 'google' | null;

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_LOCATION: {
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  DEFAULT_ZOOM: 14,
};

// Check if Google Maps is available  
export const isGoogleMapsAvailable = (): boolean => {
  try {
    require('react-native-maps');
    return true;
  } catch (error) {
    console.log('Google Maps not available:', error);
    return false;
  }
};

// Get best available map provider
export const getBestMapProvider = async (): Promise<MapProvider> => {
  // Use Google Maps
  if (isGoogleMapsAvailable()) {
    console.log('✅ Using Google Maps');
    return 'google';
  }

  console.log('❌ No map provider available');
  return null;
};

// Error messages in Vietnamese
export const MAP_ERROR_MESSAGES = {
  NO_PROVIDER: 'Không có thư viện bản đồ khả dụng',
  INIT_FAILED: 'Không thể khởi tạo bản đồ',
  GOOGLE_FAILED: 'Google Maps không hoạt động',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  LOCATION_ERROR: 'Không thể lấy vị trí',
};

// Utility function to handle map errors
export const handleMapError = (error: any, context: string = '') => {
  console.error(`Map error ${context}:`, error);
  
  if (error?.message?.includes('network')) {
    return MAP_ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error?.message?.includes('location')) {
    return MAP_ERROR_MESSAGES.LOCATION_ERROR;
  }
  
  return MAP_ERROR_MESSAGES.INIT_FAILED;
};

// Convert coordinates for Google Maps
export const convertCoordinates = (
  latitude: number, 
  longitude: number, 
  provider: MapProvider
): any => {
  // Google Maps uses {latitude, longitude} format
  return { latitude, longitude };
};

// Get map style URL based on provider
export const getMapStyle = (provider: MapProvider): string => {
  return ''; // Google Maps doesn't use style URLs
}; 