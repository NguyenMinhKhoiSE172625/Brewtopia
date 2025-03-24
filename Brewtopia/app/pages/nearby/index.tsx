import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Linking, SafeAreaView, ScrollView, Animated } from 'react-native';
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

    // Animate card appearance
    slideAnim.setValue(0);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Di chuyển map để hiển thị marker và card
    mapRef.current?.animateToRegion({
      latitude: cafe.coordinate.latitude,
      longitude: cafe.coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleCloseCard = () => {
    // Animate card disappearance
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedCafe(null);
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
              bottom: selectedCafe ? verticalScale(400) : verticalScale(30)
            }
          ]}
          onPress={handleCurrentLocation}
        >
          <MaterialIcons name="my-location" size={24} color="#6E543C" />
        </TouchableOpacity>

        {/* Map Overlay for tap outside */}
        {selectedCafe && (
          <TouchableOpacity 
            style={[styles.mapOverlay, { opacity: fadeAnim }]}
            activeOpacity={1}
            onPress={handleCloseCard}
          />
        )}

        {/* Selected Cafe Card */}
        {selectedCafe && (
          <Animated.View 
            style={[
              styles.cafeCard,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [200, 0],
                    }),
                  },
                ],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.cafeHeader}>
              <View style={styles.cafeHeaderTop}>
                <Text style={styles.cafeName}>{selectedCafe.name}</Text>
                <TouchableOpacity onPress={handleCloseCard}>
                  <MaterialIcons name="close" size={24} color="#6E543C" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cafeAddress}>{selectedCafe.address}</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {[...Array(5)].map((_, index) => (
                    <MaterialIcons
                      key={index}
                      name="star"
                      size={16}
                      color={index < selectedCafe.rating ? '#FFD700' : '#D3D3D3'}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>{selectedCafe.rating}</Text>
              </View>
              <Text style={styles.cafeStatus}>
                {selectedCafe.status} - Closed at {selectedCafe.closingTime}
              </Text>
            </View>
            
            <View style={styles.cafeActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleGetDirections}
              >
                <MaterialIcons name="place" size={28} color="#6E543C" />
                <Text style={styles.actionText}>Path</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {/* Handle phone call */}}
              >
                <MaterialIcons name="phone" size={28} color="#6E543C" />
                <Text style={styles.actionText}>Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {/* Toggle notifications */}}
              >
                <MaterialIcons name="notifications" size={28} color="#6E543C" />
                <Text style={styles.actionText}>Alert</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {/* Share cafe */}}
              >
                <MaterialIcons name="share" size={28} color="#6E543C" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.cafeImagesContainer}
              contentContainerStyle={styles.cafeImagesContent}
            >
              {selectedCafe.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() => {/* Handle image press */}}
                >
                  <Image
                    source={image}
                    style={styles.cafeImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
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
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cafeCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(20),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: '60%',
  },
  cafeHeader: {
    marginBottom: verticalScale(16),
  },
  cafeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  cafeName: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: horizontalScale(16),
  },
  cafeAddress: {
    fontSize: fontScale(16),
    color: '#666666',
    marginBottom: verticalScale(12),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  stars: {
    flexDirection: 'row',
    marginRight: horizontalScale(8),
  },
  ratingText: {
    fontSize: fontScale(16),
    color: '#666666',
    marginLeft: horizontalScale(4),
  },
  cafeStatus: {
    fontSize: fontScale(16),
    color: '#666666',
    marginBottom: verticalScale(16),
  },
  cafeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: verticalScale(20),
  },
  actionButton: {
    alignItems: 'center',
    padding: moderateScale(12),
    minWidth: horizontalScale(70),
  },
  actionText: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginTop: verticalScale(8),
    fontWeight: '500',
  },
  cafeImagesContainer: {
    marginTop: verticalScale(4),
    height: verticalScale(150),
  },
  cafeImagesContent: {
    paddingRight: horizontalScale(16),
  },
  cafeImage: {
    width: horizontalScale(200),
    height: verticalScale(150),
    borderRadius: moderateScale(12),
    marginRight: horizontalScale(12),
  },
}); 