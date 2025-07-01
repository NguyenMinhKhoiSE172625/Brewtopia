import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { PRIMARY_BROWN } from '../config/constants';
import { getBestMapProvider, MAP_CONFIG, handleMapError, type MapProvider, MAP_ERROR_MESSAGES } from '../utils/MapUtils';

// Interfaces
interface MapComponentProps {
  onLocationSelect?: (location: { latitude: number; longitude: number; address?: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  cafes?: Array<{
    id: string;
    name: string;
    coordinate: { latitude: number; longitude: number };
    status: string;
  }>;
  onCafePress?: (cafe: any) => void;
  style?: any;
  showUserLocation?: boolean;
}

let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

// Initialize map libraries based on provider
const initMapLibraries = async (provider: MapProvider) => {
  if (provider === 'google') {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
    return true;
  }
  return false;
};

// Google Maps Component
const GoogleMapsComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  initialLocation,
  cafes = [],
  onCafePress,
  style,
  showUserLocation = true
}) => {
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || MAP_CONFIG.DEFAULT_LOCATION.latitude,
    longitude: initialLocation?.longitude || MAP_CONFIG.DEFAULT_LOCATION.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const handleMapPress = (event: any) => {
    if (onLocationSelect) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onLocationSelect({ latitude, longitude });
    }
  };

  try {
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={style}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
      >
        {cafes.map((cafe) => (
          <Marker
            key={cafe.id}
            coordinate={cafe.coordinate}
            onPress={() => onCafePress?.(cafe)}
          >
            <View style={mapStyles.markerContainer}>
              <View style={[mapStyles.markerInner, { 
                backgroundColor: cafe.status === 'Open' ? '#4CAF50' : '#F44336' 
              }]}>
                <MaterialIcons name="local-cafe" size={20} color="#FFFFFF" />
              </View>
              <View style={[mapStyles.markerTail, { 
                borderTopColor: cafe.status === 'Open' ? '#4CAF50' : '#F44336' 
              }]} />
            </View>
          </Marker>
        ))}
      </MapView>
    );
  } catch (error) {
    console.error('Google Maps render error:', error);
    return <MapFallbackComponent {...arguments[0]} />;
  }
};

// Fallback component when no maps are available
const MapFallbackComponent: React.FC<MapComponentProps> = ({
  cafes = [],
  onCafePress,
  style
}) => {
  return (
    <View style={[style, mapStyles.fallbackContainer]}>
      <View style={mapStyles.fallbackContent}>
        <MaterialIcons name="map-outline" size={64} color={PRIMARY_BROWN} />
        <Text style={mapStyles.fallbackTitle}>Bản đồ không khả dụng</Text>
        <Text style={mapStyles.fallbackMessage}>
          Không thể tải bản đồ. Vui lòng kiểm tra kết nối mạng hoặc restart ứng dụng.
        </Text>
        
        {cafes.length > 0 && (
          <View style={mapStyles.cafeList}>
            <Text style={mapStyles.cafeListTitle}>Danh sách quán cafe gần đây:</Text>
            {cafes.slice(0, 5).map((cafe) => (
              <TouchableOpacity
                key={cafe.id}
                style={mapStyles.cafeItem}
                onPress={() => onCafePress?.(cafe)}
              >
                <MaterialIcons 
                  name="local-cafe" 
                  size={20} 
                  color={cafe.status === 'Open' ? '#4CAF50' : '#F44336'} 
                />
                <Text style={mapStyles.cafeName}>{cafe.name}</Text>
                <Text style={mapStyles.cafeStatus}>
                  {cafe.status === 'Open' ? 'Mở cửa' : 'Đóng cửa'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// Main Map Component
const MapComponent: React.FC<MapComponentProps> = (props) => {
  const [mapProvider, setMapProvider] = useState<MapProvider>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupMap = async () => {
      try {
        setIsLoading(true);
        const provider = await getBestMapProvider();
        
        if (provider) {
          await initMapLibraries(provider);
          setMapProvider(provider);
        } else {
          setError(MAP_ERROR_MESSAGES.NO_PROVIDER);
        }
      } catch (err) {
        const errorMessage = handleMapError(err, 'MapComponent setup');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    setupMap();
  }, []);

  if (isLoading) {
    return (
      <View style={[props.style, mapStyles.loadingContainer]}>
        <MaterialIcons name="map" size={48} color={PRIMARY_BROWN} />
        <Text style={mapStyles.loadingText}>Đang tải bản đồ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[props.style, mapStyles.errorContainer]}>
        <MaterialIcons name="error-outline" size={48} color="#F44336" />
        <Text style={mapStyles.errorTitle}>Lỗi bản đồ</Text>
        <Text style={mapStyles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={mapStyles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={mapStyles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render Google Maps component
    return <GoogleMapsComponent {...props} />;
};

const mapStyles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: PRIMARY_BROWN,
    fontWeight: '500',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  fallbackContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_BROWN,
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  cafeListContainer: {
    width: '100%',
    marginTop: 20,
  },
  cafeListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_BROWN,
    marginBottom: 10,
  },
  cafeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cafeListName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  cafeListStatus: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  cafeList: {
    width: '100%',
    marginTop: 20,
  },
  cafeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cafeName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  cafeStatus: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_BROWN,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    backgroundColor: PRIMARY_BROWN,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default MapComponent; 