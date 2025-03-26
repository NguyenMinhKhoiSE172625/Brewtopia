import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Linking, SafeAreaView, ScrollView, Animated, FlatList, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import { useRouter } from 'expo-router';

// Thay thế bằng Google Maps API key của bạn
const GOOGLE_MAPS_API_KEY = 'AIzaSyDmwLRVHrEYt9IkLZlf4ylndLQpPpF889w';

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
  visitDate?: string;
}

// Move cafes array outside the component
const MOCK_CAFES: Cafe[] = [
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
  {
    id: '3',
    name: 'The Coffee House',
    address: '123 Nguyen Du St, District 1',
    rating: 4.3,
    status: 'Open',
    closingTime: '22:30',
    images: [
      require('../../../assets/images/cafe4.png'),
      require('../../../assets/images/cafe3.png'),
    ],
    coordinate: {
      latitude: 10.7785,
      longitude: 106.6990,
    },
  },
  {
    id: '4',
    name: 'Highlands Coffee',
    address: '45 Le Loi Blvd, District 1',
    rating: 4.1,
    status: 'Open',
    closingTime: '23:30',
    images: [
      require('../../../assets/images/cafe1.png'),
      require('../../../assets/images/cafe5.png'),
    ],
    coordinate: {
      latitude: 10.7762,
      longitude: 106.7030,
    },
  },
  {
    id: '5',
    name: 'Trung Nguyen Legend',
    address: '98 Nguyen Hue St, District 1',
    rating: 4.7,
    status: 'Open',
    closingTime: '22:00',
    images: [
      require('../../../assets/images/cafe5.png'),
      require('../../../assets/images/cafe2.png'),
    ],
    coordinate: {
      latitude: 10.7790,
      longitude: 106.7040,
    },
  },
  {
    id: '6',
    name: 'Starbucks Coffee',
    address: '76 Le Thanh Ton St, District 1',
    rating: 4.4,
    status: 'Open',
    closingTime: '23:00',
    images: [
      require('../../../assets/images/cafe3.png'),
      require('../../../assets/images/cafe4.png'),
    ],
    coordinate: {
      latitude: 10.7740,
      longitude: 106.7020,
    },
  },
  {
    id: '7',
    name: 'Phuc Long Coffee',
    address: '42 Nguyen Hue St, District 1',
    rating: 4.6,
    status: 'Open',
    closingTime: '22:30',
    images: [
      require('../../../assets/images/cafe2.png'),
      require('../../../assets/images/cafe1.png'),
    ],
    coordinate: {
      latitude: 10.7820,
      longitude: 106.7000,
    },
  },
  {
    id: '8',
    name: 'Cong Caphe',
    address: '26 Ly Tu Trong St, District 1',
    rating: 4.5,
    status: 'Open',
    closingTime: '23:00',
    images: [
      require('../../../assets/images/cafe4.png'),
      require('../../../assets/images/cafe1.png'),
    ],
    coordinate: {
      latitude: 10.7810,
      longitude: 106.6960,
    },
  },
  {
    id: '9',
    name: 'Cheese Coffee',
    address: '151 Dong Khoi St, District 1',
    rating: 4.2,
    status: 'Open',
    closingTime: '21:30',
    images: [
      require('../../../assets/images/cafe3.png'),
      require('../../../assets/images/cafe5.png'),
    ],
    coordinate: {
      latitude: 10.7750,
      longitude: 106.6970,
    },
  },
  {
    id: '10',
    name: 'Milano Coffee',
    address: '33 Pasteur St, District 1',
    rating: 4.3,
    status: 'Open',
    closingTime: '22:00',
    images: [
      require('../../../assets/images/cafe5.png'),
      require('../../../assets/images/cafe3.png'),
    ],
    coordinate: {
      latitude: 10.7730,
      longitude: 106.7000,
    },
  }
];

export default function Nearby() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [showRecentlyVisited, setShowRecentlyVisited] = useState(false);
  const [recentlyVisitedCafes, setRecentlyVisitedCafes] = useState<Cafe[]>([]);
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  // Use the static cafe data from outside the component
  const cafes = useMemo(() => MOCK_CAFES, []);

  // Generate random cafes around the user's location
  const generateRandomCafes = (userLocation: Location.LocationObject, count: number = 10) => {
    const baseLatitude = userLocation.coords.latitude;
    const baseLongitude = userLocation.coords.longitude;
    const cafeNames = [
      'Espresso Express', 'Morning Brew', 'Coffee Corner', 'Urban Roast',
      'Cafe Delight', 'Bean Scene', 'Brew Haven', 'Java Junction',
      'The Daily Grind', 'Cafe Aroma', 'Cup & Saucer', 'Golden Coffee',
      'The Roasted Bean', 'Coffee Culture', 'Cappuccino Club'
    ];
    
    // Define all cafe images statically
    const cafeImages = [
      require('../../../assets/images/cafe1.png'),
      require('../../../assets/images/cafe2.png'),
      require('../../../assets/images/cafe3.png'),
      require('../../../assets/images/cafe4.png'),
      require('../../../assets/images/cafe5.png'),
    ];
    
    const randomCafes: Cafe[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate a point within ~500m radius
      // 0.005 in lat/lng is roughly 500m
      const randomLat = baseLatitude + (Math.random() - 0.5) * 0.01;
      const randomLng = baseLongitude + (Math.random() - 0.5) * 0.01;
      
      const randomName = cafeNames[Math.floor(Math.random() * cafeNames.length)];
      const id = `random-${i + 1}`;
      const randomRating = 3.5 + Math.random() * 1.5; // Rating between 3.5-5.0
      const randomClosingHour = 20 + Math.floor(Math.random() * 4); // 20:00 - 23:00
      
      // Select random images from the predefined array
      const randomImage1 = cafeImages[Math.floor(Math.random() * cafeImages.length)];
      const randomImage2 = cafeImages[Math.floor(Math.random() * cafeImages.length)];
      
      randomCafes.push({
        id,
        name: `${randomName} ${i + 1}`,
        address: `${Math.floor(Math.random() * 100) + 1} Street, District ${Math.floor(Math.random() * 5) + 1}`,
        rating: Math.round(randomRating * 10) / 10,
        status: 'Open',
        closingTime: `${randomClosingHour}:00`,
        images: [randomImage1, randomImage2],
        coordinate: {
          latitude: randomLat,
          longitude: randomLng,
        },
      });
    }
    
    return randomCafes;
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Combine hardcoded cafes with randomly generated ones
      const randomCafes = generateRandomCafes(location, 15);
      setAllCafes([...cafes, ...randomCafes]);
    })();
  }, [cafes]);

  // Initialize recently visited cafes just once on component mount
  useEffect(() => {
    // Simulate that the user has visited 3 cafes from the list
    const visitedCafes = [
      { ...MOCK_CAFES[0], visitDate: 'Today' },
      { ...MOCK_CAFES[2], visitDate: 'Yesterday' },
      { ...MOCK_CAFES[5], visitDate: 'Last Week' }
    ];
    setRecentlyVisitedCafes(visitedCafes);
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

  const handleToggleRecentlyVisited = () => {
    setShowRecentlyVisited(!showRecentlyVisited);
  };

  const handleSelectRecentCafe = (cafe: Cafe) => {
    setShowRecentlyVisited(false);
    handleMarkerPress(cafe);
    mapRef.current?.animateToRegion({
      latitude: cafe.coordinate.latitude,
      longitude: cafe.coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
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
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
            showsBuildings={true}
            showsTraffic={false}
            showsIndoors={true}
          >
            {allCafes.map((cafe) => (
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

        {/* Recently Visited Button */}
        <TouchableOpacity 
          style={[
            styles.currentLocationButton,
            styles.recentlyVisitedButton,
            {
              bottom: selectedCafe ? verticalScale(460) : verticalScale(90)
            }
          ]}
          onPress={handleToggleRecentlyVisited}
        >
          <MaterialIcons name="history" size={24} color="#6E543C" />
        </TouchableOpacity>

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

        {/* Recently Visited Popup */}
        {showRecentlyVisited && (
          <View style={styles.recentlyVisitedContainer}>
            <View style={styles.recentlyVisitedHeader}>
              <Text style={styles.recentlyVisitedTitle}>Recently Visited</Text>
              <TouchableOpacity onPress={handleToggleRecentlyVisited}>
                <MaterialIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {recentlyVisitedCafes.length === 0 ? (
              <Text style={styles.noRecentText}>You haven't visited any cafes in the past week.</Text>
            ) : (
              <ScrollView style={styles.recentlyVisitedList}>
                {recentlyVisitedCafes.map((cafe, index) => (
                  <TouchableOpacity 
                    key={`recent-${cafe.id}`}
                    style={styles.recentlyVisitedItem}
                    onPress={() => handleSelectRecentCafe(cafe)}
                  >
                    <Image 
                      source={cafe.images[0]} 
                      style={styles.recentlyVisitedImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.recentlyVisitedInfo}>
                      <Text style={styles.recentlyVisitedName}>{cafe.name}</Text>
                      <Text style={styles.recentlyVisitedDate}>{cafe.visitDate}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#6E543C" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

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
                      outputRange: [300, 0],
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
                  <MaterialIcons name="more-horiz" size={28} color="#6E543C" />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.cafeAddress}>{selectedCafe.address}</Text>
                <Text style={styles.cafeStatus}>
                  {selectedCafe.status} - Closed at {selectedCafe.closingTime}
                </Text>
              </View>
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

            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => router.push({
                pathname: 'pages/shop/detail' as any,
                params: { shopId: selectedCafe.id }
              })}
            >
              <Text style={styles.detailButtonText}>Detail</Text>
            </TouchableOpacity>

            <FlatList 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.cafeImagesContainer}
              contentContainerStyle={styles.cafeImagesContent}
              data={selectedCafe.images}
              keyExtractor={(_, index) => `cafe-image-${index}`}
              renderItem={({ item, index }) => (
                <Image
                  source={item}
                  style={styles.cafeImage}
                  resizeMode="cover"
                  progressiveRenderingEnabled={true}
                  fadeDuration={200}
                />
              )}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={2}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={50}
              getItemLayout={(data, index) => ({
                length: horizontalScale(200),
                offset: horizontalScale(200) * index,
                index,
              })}
            />
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
    padding: moderateScale(16),
    paddingBottom: verticalScale(80),
  },
  cafeHeader: {
    marginBottom: verticalScale(16),
  },
  cafeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(4),
  },
  cafeName: {
    fontSize: fontScale(28),
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    marginRight: horizontalScale(16),
  },
  cafeAddress: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  cafeStatus: {
    fontSize: fontScale(14),
    color: '#666666',
    marginLeft: horizontalScale(8),
  },
  cafeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(16),
    gap: horizontalScale(8),
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F1ED',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(25),
    flex: 1,
  },
  actionText: {
    fontSize: fontScale(12),
    color: '#6E543C',
    marginTop: verticalScale(4),
  },
  cafeImagesContainer: {
    marginTop: verticalScale(16),
  },
  cafeImagesContent: {
    gap: horizontalScale(6),
  },
  cafeImage: {
    width: horizontalScale(200),
    height: verticalScale(150),
    borderRadius: moderateScale(12),
  },
  detailButton: {
    backgroundColor: '#6E543C',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  recentlyVisitedButton: {
    right: horizontalScale(16),
  },
  recentlyVisitedContainer: {
    position: 'absolute',
    top: verticalScale(80),
    right: horizontalScale(16),
    left: horizontalScale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    maxHeight: verticalScale(300),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recentlyVisitedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: verticalScale(12),
  },
  recentlyVisitedTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  recentlyVisitedList: {
    maxHeight: verticalScale(230),
  },
  recentlyVisitedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentlyVisitedImage: {
    width: horizontalScale(50),
    height: horizontalScale(50),
    borderRadius: moderateScale(8),
    marginRight: horizontalScale(12),
  },
  recentlyVisitedInfo: {
    flex: 1,
  },
  recentlyVisitedName: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#333333',
    marginBottom: verticalScale(4),
  },
  recentlyVisitedDate: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  noRecentText: {
    fontSize: fontScale(14),
    color: '#666666',
    textAlign: 'center',
    paddingVertical: verticalScale(20),
  },
}); 