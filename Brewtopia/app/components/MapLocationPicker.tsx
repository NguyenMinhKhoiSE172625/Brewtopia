import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface MapLocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
  onClose: () => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function MapLocationPicker({ 
  onLocationSelect, 
  onClose, 
  initialLocation 
}: MapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);
  
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 10.7769, // Default to Ho Chi Minh City
    longitude: initialLocation?.longitude || 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      reverseGeocode(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [selectedLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập vị trí', 'Vui lòng cấp quyền truy cập vị trí để sử dụng tính năng này');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      if (!selectedLocation) {
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode[0]) {
        const addressComponents = [
          geocode[0].streetNumber,
          geocode[0].street,
          geocode[0].district,
          geocode[0].city,
          geocode[0].region,
        ].filter(Boolean);
        
        setAddress(addressComponents.join(', '));
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress('Không thể xác định địa chỉ');
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({
        ...selectedLocation,
        address,
      });
      onClose();
    } else {
      Alert.alert('Lỗi', 'Vui lòng chọn một vị trí trên bản đồ');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn vị trí quán</Text>
        <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
          <MaterialIcons name="my-location" size={24} color="#6E543C" />
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            draggable={true}
            onDragEnd={(event) => {
              const { latitude, longitude } = event.nativeEvent.coordinate;
              setSelectedLocation({ latitude, longitude });
            }}
          >
            <View style={styles.markerContainer}>
              <MaterialIcons name="location-on" size={40} color="#6E543C" />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.bottomContainer}>
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Địa chỉ được chọn:</Text>
          <Text style={styles.addressText}>{address || 'Đang tải...'}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6E543C',
  },
  locationButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#6E543C',
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6E543C',
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
