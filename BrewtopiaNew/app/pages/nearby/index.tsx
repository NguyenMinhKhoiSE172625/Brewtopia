import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Linking, SafeAreaView, ScrollView, Animated, FlatList, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as CachedImage } from 'expo-image';
import withAuth from '../../components/withAuth';

// Thay thế bằng Google Maps API key của bạn
const GOOGLE_MAPS_API_KEY = 'AIzaSyDmwLRVHrEYt9IkLZlf4ylndLQpPpF889w';

// Constants for pagination
const CAFES_PER_PAGE = 10;
const INITIAL_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

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

const CafeImage = memo(({ image }: { image: any }) => (
  <CachedImage
    source={image}
    style={styles.cafeImage}
    contentFit="cover"
    transition={200}
    cachePolicy="memory-disk"
  />
));

// Interface for share recipient
interface ShareRecipient {
  id: string;
  name: string;
  isGroup: boolean;
}

// Memoized marker component
const CafeMarker = memo(({ cafe, onPress }: { cafe: Cafe; onPress: () => void }) => (
  <Marker
    coordinate={cafe.coordinate}
    onPress={onPress}
  >
    <View style={styles.markerContainer}>
      <CachedImage 
        source={require('../../../assets/images/iconcafe.png')}
        style={styles.markerIcon}
        cachePolicy="memory-disk"
      />
    </View>
  </Marker>
));

// Memoized cafe card component
const CafeCard = memo(({ cafe, onClose, onGetDirections, onShare, slideAnim, fadeAnim }: {
  cafe: Cafe;
  onClose: () => void;
  onGetDirections: () => void;
  onShare: () => void;
  slideAnim: Animated.Value;
  fadeAnim: Animated.Value;
}) => {
  const router = useRouter();
  
  const keyExtractor = useCallback((item: any, index: number) => `cafe-image-${index}`, []);
  
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: horizontalScale(200),
    offset: horizontalScale(200) * index,
    index,
  }), []);
  
  const renderCafeImage = useCallback(({ item }: { item: any }) => (
    <CafeImage image={item} />
  ), []);

  return (
    <Animated.View style={[styles.cafeCard, {
      transform: [{ translateY: slideAnim }],
      opacity: fadeAnim
    }]}>
      <View style={styles.cafeHeader}>
        <View style={styles.cafeHeaderTop}>
          <Text style={styles.cafeName}>{cafe.name}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="more-horiz" size={28} color="#6E543C" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.cafeAddress}>{cafe.address}</Text>
          <Text style={styles.cafeStatus}>
            {cafe.status} - Closed at {cafe.closingTime}
          </Text>
        </View>
      </View>
      
      <View style={styles.cafeActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onGetDirections}
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
          onPress={onShare}
        >
          <MaterialIcons name="share" size={24} color="#6E543C" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.detailButton}
        onPress={() => router.push({
          pathname: 'pages/shop/detail' as any,
          params: { shopId: cafe.id }
        })}
      >
        <Text style={styles.detailButtonText}>Detail</Text>
      </TouchableOpacity>

      <FlatList 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.cafeImagesContainer}
        contentContainerStyle={styles.cafeImagesContent}
        data={cafe.images}
        keyExtractor={keyExtractor}
        renderItem={renderCafeImage}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={2}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
        progressViewOffset={1}
      />
    </Animated.View>
  );
});

// Generate random cafes function
const generateRandomCafes = (userLocation: Location.LocationObject, count: number = 10) => {
  const baseLatitude = userLocation.coords.latitude;
  const baseLongitude = userLocation.coords.longitude;
  const cafeNames = [
    'Espresso Express', 'Morning Brew', 'Coffee Corner', 'Urban Roast',
    'Cafe Delight', 'Bean Scene', 'Brew Haven', 'Java Junction',
    'The Daily Grind', 'Cafe Aroma', 'Cup & Saucer', 'Golden Coffee',
    'The Roasted Bean', 'Coffee Culture', 'Cappuccino Club'
  ];
  
  const cafeImages = [
    require('../../../assets/images/cafe1.png'),
    require('../../../assets/images/cafe2.png'),
    require('../../../assets/images/cafe3.png'),
    require('../../../assets/images/cafe4.png'),
    require('../../../assets/images/cafe5.png'),
  ];
  
  const randomCafes: Cafe[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomLat = baseLatitude + (Math.random() - 0.5) * 0.01;
    const randomLng = baseLongitude + (Math.random() - 0.5) * 0.01;
    
    const randomName = cafeNames[Math.floor(Math.random() * cafeNames.length)];
    const id = `random-${i + 1}`;
    const randomRating = 3.5 + Math.random() * 1.5;
    const randomClosingHour = 20 + Math.floor(Math.random() * 4);
    
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

const RecentlyVisitedItem = memo(({ cafe, onPress }: { cafe: Cafe; onPress: () => void }) => (
  <TouchableOpacity 
    style={styles.recentlyVisitedItem}
    onPress={onPress}
  >
    <CachedImage 
      source={cafe.images[0]} 
      style={styles.recentlyVisitedImage}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />
    <View style={styles.recentlyVisitedInfo}>
      <Text style={styles.recentlyVisitedName}>{cafe.name}</Text>
      <Text style={styles.recentlyVisitedDate}>{cafe.visitDate}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#6E543C" />
  </TouchableOpacity>
));

const RecipientItem = memo(({ recipient, onPress }: { recipient: ShareRecipient; onPress: () => void }) => (
  <TouchableOpacity 
    style={styles.recipientItem}
    onPress={onPress}
  >
    <CachedImage 
      source={recipient.isGroup 
        ? require('../../../assets/images/profile1.png') 
        : require('../../../assets/images/avatar1.png')}
      style={styles.recipientAvatar}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />
    <Text style={styles.recipientName}>{recipient.name}</Text>
    <MaterialIcons name="chevron-right" size={24} color="#6E543C" />
  </TouchableOpacity>
));

function Nearby() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [recentlyVisited, setRecentlyVisited] = useState<Cafe[]>([]);
  const [showDirections, setShowDirections] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareRecipients, setShareRecipients] = useState<ShareRecipient[]>([]);
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [visibleCafes, setVisibleCafes] = useState<Cafe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecentlyVisited, setShowRecentlyVisited] = useState(false);
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Generate random cafes around user location
      const randomCafes = generateRandomCafes(location);
      setAllCafes([...MOCK_CAFES, ...randomCafes]);
    })();
  }, []);

  // Load visible cafes based on current page
  useEffect(() => {
    const startIndex = (currentPage - 1) * CAFES_PER_PAGE;
    const endIndex = startIndex + CAFES_PER_PAGE;
    setVisibleCafes(allCafes.slice(startIndex, endIndex));
  }, [currentPage, allCafes]);

  const handleRegionChange = useCallback((region: Region) => {
    if (currentPage * CAFES_PER_PAGE >= allCafes.length) {
      setCurrentPage((prev: number) => prev + 1);
    }
  }, [currentPage, allCafes.length]);

  // Memoize handlers
  const handleMarkerPress = useCallback((cafe: Cafe) => {
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

    mapRef.current?.animateToRegion({
      latitude: cafe.coordinate.latitude,
      longitude: cafe.coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [slideAnim, fadeAnim]);

  const handleCloseCard = useCallback(() => {
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
  }, [slideAnim, fadeAnim]);

  // Initialize recently visited cafes just once on component mount
  useEffect(() => {
    // Simulate that the user has visited 3 cafes from the list
    const visitedCafes = [
      { ...MOCK_CAFES[0], visitDate: 'Today' },
      { ...MOCK_CAFES[2], visitDate: 'Yesterday' },
      { ...MOCK_CAFES[5], visitDate: 'Last Week' }
    ];
    setRecentlyVisited(visitedCafes);
  }, []);

  // Initialize share recipients (similar to chatItems in profile)
  useEffect(() => {
    const recipients = [
      {
        id: '1',
        name: 'Group đi cà phê đê',
        isGroup: true
      },
      {
        id: '2',
        name: 'John Weed',
        isGroup: false
      }
    ];
    setShareRecipients(recipients);
  }, []);

  // Focus on shared cafe if navigated from profile
  useEffect(() => {
    const focusCafeId = params.focusCafeId as string;
    const latitude = params.latitude ? parseFloat(params.latitude as string) : null;
    const longitude = params.longitude ? parseFloat(params.longitude as string) : null;
    
    if (focusCafeId && latitude && longitude && allCafes.length > 0) {
      // Try to find the cafe by ID first
      const cafe = allCafes.find(c => c.id === focusCafeId);
      
      if (cafe) {
        // If found, select this cafe
        handleMarkerPress(cafe);
      } else {
        // If not found (might be a case where the actual cafe is not in our list),
        // create a temporary cafe object to show
        const tempCafe: Cafe = {
          id: focusCafeId,
          name: 'Shared Coffee Shop',
          address: 'Address from shared location',
          rating: 4.5,
          status: 'Open',
          closingTime: '22:00',
          images: [
            require('../../../assets/images/cafe1.png'),
            require('../../../assets/images/cafe2.png'),
          ],
          coordinate: {
            latitude,
            longitude,
          },
        };
        
        // Add this cafe to allCafes
        setAllCafes(prev => [...prev, tempCafe]);
        
        // Select this cafe
        setTimeout(() => {
          handleMarkerPress(tempCafe);
        }, 500);
      }
      
      // Animate map to this location
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [params, allCafes]);

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

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handleShareWithRecipient = async (recipient: ShareRecipient) => {
    if (!selectedCafe) return;
    
    try {
      // Get existing shared cafes or initialize an empty array
      const sharedCafesStr = await AsyncStorage.getItem('shared_cafes') || '[]';
      const sharedCafes = JSON.parse(sharedCafesStr);
      
      // Add the new shared cafe with recipient info
      const sharedCafe = {
        cafeId: selectedCafe.id,
        cafeName: selectedCafe.name,
        cafeAddress: selectedCafe.address,
        cafeImage: selectedCafe.images[0],
        coordinate: selectedCafe.coordinate,
        recipientId: recipient.id,
        recipientName: recipient.name,
        sharedAt: new Date().toISOString(),
      };
      
      sharedCafes.push(sharedCafe);
      
      // Save updated shared cafes
      await AsyncStorage.setItem('shared_cafes', JSON.stringify(sharedCafes));
      
      // Save as a chat message
      const chatMessagesKey = `chat_messages_${recipient.id}`;
      const messagesStr = await AsyncStorage.getItem(chatMessagesKey) || '[]';
      const messages = JSON.parse(messagesStr);
      
      // Create a shared cafe message
      const cafeMessage = {
        id: Date.now().toString(),
        sender: 'me',
        text: `I want to share this cafe with you: ${selectedCafe.name}`,
        timestamp: new Date().toISOString(),
        sharedCafe: {
          cafeId: selectedCafe.id,
          cafeName: selectedCafe.name,
          cafeAddress: selectedCafe.address,
          coordinate: selectedCafe.coordinate,
        }
      };
      
      messages.push(cafeMessage);
      await AsyncStorage.setItem(chatMessagesKey, JSON.stringify(messages));
      
      // Close modal
      setShowShareModal(false);
      
      // Navigate to chat page
      router.push({
        pathname: '/pages/chat/chat',
        params: { 
          chatId: recipient.id, 
          chatName: recipient.name, 
          isGroup: recipient.isGroup.toString()
        }
      });
    } catch (error) {
      console.error('Error sharing cafe:', error);
      alert('Failed to share cafe. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}
      
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
            onRegionChangeComplete={handleRegionChange}
            maxZoomLevel={18}
            minZoomLevel={10}
          >
            {visibleCafes.map((cafe) => (
              <CafeMarker
                key={cafe.id}
                cafe={cafe}
                onPress={() => handleMarkerPress(cafe)}
              />
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
                onStart={() => setIsLoading(true)}
                onReady={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
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

            {recentlyVisited.length === 0 ? (
              <Text style={styles.noRecentText}>You haven't visited any cafes in the past week.</Text>
            ) : (
              <FlatList
                data={recentlyVisited}
                renderItem={({ item }) => (
                  <RecentlyVisitedItem
                    cafe={item}
                    onPress={() => handleSelectRecentCafe(item)}
                  />
                )}
                keyExtractor={(item) => `recent-${item.id}`}
                style={styles.recentlyVisitedList}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={3}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
              />
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
          <CafeCard
            cafe={selectedCafe}
            onClose={handleCloseCard}
            onGetDirections={handleGetDirections}
            onShare={() => handleShare()}
            slideAnim={slideAnim}
            fadeAnim={fadeAnim}
          />
        )}

        {/* Share Modal */}
        <Modal
          visible={showShareModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseShareModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.shareModalContent}>
              <View style={styles.shareModalHeader}>
                <Text style={styles.shareModalTitle}>Chọn Người Gửi</Text>
                <TouchableOpacity onPress={handleCloseShareModal}>
                  <MaterialIcons name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={shareRecipients}
                renderItem={({ item }) => (
                  <RecipientItem
                    recipient={item}
                    onPress={() => handleShareWithRecipient(item)}
                  />
                )}
                keyExtractor={(item) => item.id}
                style={styles.recipientsList}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
              />
            </View>
          </View>
        </Modal>
      </View>

      <BottomBar />
    </SafeAreaView>
  );
}

export default withAuth(Nearby);

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
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  // Share modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  shareModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(16),
    maxHeight: '70%',
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: verticalScale(16),
  },
  shareModalTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  recipientsList: {
    maxHeight: verticalScale(400),
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recipientAvatar: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: horizontalScale(20),
    marginRight: horizontalScale(12),
  },
  recipientName: {
    flex: 1,
    fontSize: fontScale(16),
    color: '#333333',
  },
}); 