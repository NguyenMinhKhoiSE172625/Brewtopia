import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Linking, SafeAreaView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';

// Thay thế bằng Google Maps API key của bạn
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

interface Cafe {
  id: string;
  name: string;
  address: string;
  rating: number;
  status: string;
  closingTime: string;
  images: any[];
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export default function Nearby() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Dữ liệu mẫu cho các quán cafe
  const cafes: Cafe[] = [
    {
      id: '1',
      name: 'COFFEE SHOP 1',
      address: 'ABC St, WCD District, City A',
      rating: 4.5,
      status: 'Open',
      closingTime: '23:00',
      images: [
        require('../../../assets/images/cafe1.png'),
        require('../../../assets/images/cafe2.png'),
        require('../../../assets/images/cafe3.png'),
      ],
      coordinate: {
        latitude: 10.7769,
        longitude: 106.7009,
      },
    },
    {
      id: '2',
      name: 'Time Cafe',
      address: 'XYZ St, District 1, HCMC',
      rating: 4.8,
      status: 'Open',
      closingTime: '22:00',
      images: [
        require('../../../assets/images/cafe2.png'),
        require('../../../assets/images/cafe3.png'),
      ],
      coordinate: {
        latitude: 10.7799,
        longitude: 106.6999,
      },
    },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleMarkerPress = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setShowDirections(false);

    // Di chuyển map để hiển thị marker và card
    mapRef.current?.animateToRegion({
      latitude: cafe.coordinate.latitude,
      longitude: cafe.coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleGetDirections = () => {
    if (selectedCafe && location) {
      setShowDirections(true);
      
      // Mở Google Maps nếu người dùng muốn
      const url = Platform.select({
        ios: `maps://app?saddr=${location.coords.latitude}+${location.coords.longitude}&daddr=${selectedCafe.coordinate.latitude}+${selectedCafe.coordinate.longitude}`,
        android: `google.navigation:q=${selectedCafe.coordinate.latitude}+${selectedCafe.coordinate.longitude}`,
      });

      Linking.canOpenURL(url!).then(supported => {
        if (supported) {
          Linking.openURL(url!);
        }
      });
    }
  };

  const handleCurrentLocation = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {location && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {cafes.map((cafe) => (
              <Marker
                key={cafe.id}
                coordinate={cafe.coordinate}
                onPress={() => handleMarkerPress(cafe)}
              >
                <View style={styles.markerContainer}>
                  <Image 
                    source={require('../../../assets/images/iconcafe.png')}
                    style={styles.markerIcon}
                  />
                </View>
              </Marker>
            ))}

            {showDirections && selectedCafe && location && (
              <MapViewDirections
                origin={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                destination={selectedCafe.coordinate}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={3}
                strokeColor="#6E543C"
                mode="DRIVING"
              />
            )}
          </MapView>
        )}

        {/* Current Location Button */}
        <TouchableOpacity 
          style={[
            styles.currentLocationButton,
            {
              bottom: selectedCafe ? verticalScale(200) : verticalScale(30)
            }
          ]}
          onPress={handleCurrentLocation}
        >
          <MaterialIcons name="my-location" size={24} color="#6E543C" />
        </TouchableOpacity>

        {/* Selected Cafe Card */}
        {selectedCafe && (
          <View style={styles.cafeCard}>
            <View style={styles.cafeHeader}>
              <Text style={styles.cafeName}>{selectedCafe.name}</Text>
              <Text style={styles.cafeStatus}>
                {selectedCafe.status} - Closed at {selectedCafe.closingTime}
              </Text>
            </View>
            
            <View style={styles.cafeActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleGetDirections}
              >
                <MaterialIcons name="place" size={24} color="#6E543C" />
                <Text style={styles.actionText}>Path</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {/* Handle phone call */}}
              >
                <MaterialIcons name="phone" size={24} color="#6E543C" />
                <Text style={styles.actionText}>Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {/* Toggle notifications */}}
              >
                <MaterialIcons name="notifications" size={24} color="#6E543C" />
                <Text style={styles.actionText}>Alert</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {/* Share cafe */}}
              >
                <MaterialIcons name="share" size={24} color="#6E543C" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cafeImages}>
              {selectedCafe.images.map((image, index) => (
                <Image
                  key={index}
                  source={image}
                  style={styles.cafeImage}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(4),
    borderWidth: 2,
    borderColor: '#6E543C',
  },
  markerIcon: {
    width: horizontalScale(24),
    height: verticalScale(24),
  },
  currentLocationButton: {
    position: 'absolute',
    right: horizontalScale(16),
    backgroundColor: '#FFFFFF',
    padding: moderateScale(12),
    borderRadius: moderateScale(30),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cafeCard: {
    position: 'absolute',
    bottom: verticalScale(16),
    left: horizontalScale(16),
    right: horizontalScale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cafeHeader: {
    marginBottom: verticalScale(12),
  },
  cafeName: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#000000',
    marginBottom: verticalScale(4),
  },
  cafeStatus: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  cafeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: verticalScale(16),
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: fontScale(12),
    color: '#6E543C',
    marginTop: verticalScale(4),
  },
  cafeImages: {
    flexDirection: 'row',
    gap: horizontalScale(8),
  },
  cafeImage: {
    width: horizontalScale(100),
    height: verticalScale(80),
    borderRadius: moderateScale(8),
  },
}); 