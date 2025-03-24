import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, ScrollView, FlatList, Modal, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';

interface LiveStream {
  id: string;
  shopName: string;
  shopLogo: any;
  streamTitle: string;
  thumbnail: any;
  isLive: boolean;
  viewerCount: number;
}

export default function Stream() {
  const router = useRouter();
  const [showStartModal, setShowStartModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check user role when component mounts
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await UserRoleHelper.getCurrentRole();
        setIsAdmin(role === UserRole.ADMIN);
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, []);
  
  // Featured live streams
  const liveStreams: LiveStream[] = [
    {
      id: '1',
      shopName: 'COFFEE SHOP 1',
      shopLogo: require('../../../assets/images/iconcafe2.png'),
      streamTitle: 'Lorem ipsum is simply dummy text',
      thumbnail: require('../../../assets/images/live1.png'),
      isLive: true,
      viewerCount: 100
    },
    {
      id: '2',
      shopName: 'COFFEE 22',
      shopLogo: require('../../../assets/images/iconcafe3.png'),
      streamTitle: 'Lorem ipsum is simply dummy text',
      thumbnail: require('../../../assets/images/live2.png'),
      isLive: true,
      viewerCount: 150
    },
    {
      id: '3',
      shopName: 'StayAwayHouse',
      shopLogo: require('../../../assets/images/iconcafe4.png'),
      streamTitle: 'Lorem ipsum is simply dummy text',
      thumbnail: require('../../../assets/images/live3.png'),
      isLive: true,
      viewerCount: 80
    },
    {
      id: '4',
      shopName: 'QUESTO CAFÉ',
      shopLogo: require('../../../assets/images/iconcafe5.png'),
      streamTitle: 'Lorem ipsum is simply dummy text',
      thumbnail: require('../../../assets/images/live4.png'),
      isLive: true,
      viewerCount: 75
    },
  ];

  // Categories for streams
  const categories = [
    { id: '1', name: 'Popular', icon: '🔥' },
    { id: '2', name: 'Acoustic', icon: '🎸' },
    { id: '3', name: 'Bartending', icon: '🍹' },
    { id: '4', name: 'Coffee Art', icon: '☕' },
  ];

  // The currently selected category
  const [selectedCategory, setSelectedCategory] = useState('1');

  const renderLiveStreamItem = ({ item }: { item: LiveStream }) => (
    <TouchableOpacity 
      style={styles.streamCard}
      onPress={() => router.push({
        pathname: '/pages/stream/livestream-view',
        params: { streamId: item.id }
      })}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={item.thumbnail} style={styles.thumbnail} />
        <View style={styles.liveIndicator}>
          <Text style={styles.liveText}>Live</Text>
        </View>
        <View style={styles.viewerCountContainer}>
          <Ionicons name="eye" size={16} color="#FFFFFF" />
          <Text style={styles.viewerCount}>{item.viewerCount}</Text>
        </View>
      </View>
      <Text style={styles.streamTitle}>{item.streamTitle}</Text>
      <View style={styles.shopContainer}>
        <Image source={item.shopLogo} style={styles.shopLogo} />
        <Text style={styles.shopName}>{item.shopName}</Text>
        <TouchableOpacity style={styles.optionsButton}>
          <MaterialIcons name="more-vert" size={20} color="#6E543C" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/images/Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>BrewLive</Text>
      </View>

      {/* Cafe Icons Scroll */}
      <View style={styles.cafeIconsContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cafeIconsScroll}
        >
          <TouchableOpacity 
            style={styles.cafeIconItem}
            onPress={() => router.push({
              pathname: '/pages/stream/livestream-view',
              params: { streamId: '1' }
            })}
          >
            <View style={styles.cafeIconCircle}>
              <Image source={require('../../../assets/images/iconcafe2.png')} style={styles.cafeIcon} />
              <View style={styles.liveCircleIndicator}>
                <Text style={styles.liveCircleText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.cafeIconText}>COFFEE SHOP 1</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cafeIconItem}
            onPress={() => router.push({
              pathname: '/pages/stream/livestream-view',
              params: { streamId: '2' }
            })}
          >
            <View style={styles.cafeIconCircle}>
              <Image source={require('../../../assets/images/iconcafe3.png')} style={styles.cafeIcon} />
              <View style={styles.liveCircleIndicator}>
                <Text style={styles.liveCircleText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.cafeIconText}>COFFEE 22</Text>
          </TouchableOpacity>
          <View style={styles.cafeIconItem}>
            <View style={styles.cafeIconCircle}>
              <Image source={require('../../../assets/images/iconcafe4.png')} style={styles.cafeIcon} />
            </View>
            <Text style={styles.cafeIconText}>StayAwayHouse</Text>
          </View>
          <TouchableOpacity 
            style={styles.cafeIconItem}
            onPress={() => router.push({
              pathname: '/pages/stream/livestream-view',
              params: { streamId: '4' }
            })}
          >
            <View style={styles.cafeIconCircle}>
              <Image source={require('../../../assets/images/iconcafe5.png')} style={styles.cafeIcon} />
              <View style={styles.liveCircleIndicator}>
                <Text style={styles.liveCircleText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.cafeIconText}>QUESTO café</Text>
          </TouchableOpacity>
          <View style={styles.cafeIconItem}>
            <View style={styles.cafeIconCircle}>
              <Image source={require('../../../assets/images/iconcafe6.png')} style={styles.cafeIcon} />
            </View>
            <Text style={styles.cafeIconText}>Fradel Bakery café</Text>
          </View>
          <View style={styles.cafeIconItem}>
            <View style={styles.cafeIconCircle}>
              <Image source={require('../../../assets/images/iconcafe5.png')} style={styles.cafeIcon} />
            </View>
            <Text style={styles.cafeIconText}>1987 CoffeeShop</Text>
          </View>
          <View style={styles.cafeIconItem}>
            <View style={styles.cafeIconCircle}>
              <Image source={require('../../../assets/images/iconcafe6.png')} style={styles.cafeIcon} />
            </View>
            <Text style={styles.cafeIconText}>Hidden Garden</Text>
          </View>
        </ScrollView>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>ALL LIVE NOW</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Live Streams */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.streamsGrid}>
          {liveStreams.map((stream) => (
            <View key={stream.id} style={styles.streamCardWrapper}>
              {renderLiveStreamItem({ item: stream })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Go Live Button - Only shown for admin users */}
      {isAdmin && (
        <TouchableOpacity 
          style={styles.goLiveButton}
          onPress={() => setShowStartModal(true)}
        >
          <MaterialIcons name="videocam" size={24} color="#FFFFFF" />
          <Text style={styles.goLiveText}>Go Live</Text>
        </TouchableOpacity>
      )}

      {/* Start Stream Modal */}
      <Modal
        visible={showStartModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start Streaming</Text>
              <TouchableOpacity onPress={() => setShowStartModal(false)}>
                <MaterialIcons name="close" size={24} color="#6E543C" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Stream Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a title for your stream"
                placeholderTextColor="#999"
                value={streamTitle}
                onChangeText={setStreamTitle}
              />
              
              <View style={styles.cameraPreview}>
                <MaterialIcons name="videocam" size={48} color="#6E543C" />
                <Text style={styles.previewText}>Camera Preview</Text>
              </View>
              
              <TouchableOpacity style={styles.startStreamButton}>
                <Text style={styles.startStreamText}>Start Broadcasting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Bar */}
      <BottomBar />
    </SafeAreaView>
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
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  logo: {
    width: horizontalScale(32),
    height: verticalScale(32),
  },
  headerTitle: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#6E543C',
    marginLeft: horizontalScale(8),
    flex: 1,
  },
  cafeIconsContainer: {
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cafeIconsScroll: {
    paddingHorizontal: horizontalScale(16),
    gap: horizontalScale(20),
  },
  cafeIconItem: {
    alignItems: 'center',
    width: horizontalScale(80),
  },
  cafeIconCircle: {
    width: horizontalScale(60),
    height: verticalScale(60),
    borderRadius: moderateScale(30),
    borderWidth: 3,
    borderColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: verticalScale(4),
  },
  cafeIcon: {
    width: horizontalScale(40),
    height: verticalScale(40),
    resizeMode: 'contain',
  },
  liveCircleIndicator: {
    position: 'absolute',
    top: verticalScale(-8),
    right: horizontalScale(-10),
    backgroundColor: '#FF0000',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  liveCircleText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '700',
  },
  cafeIconText: {
    fontSize: fontScale(12),
    color: '#000000',
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  categoriesTitle: {
    fontSize: fontScale(22),
    fontWeight: '600',
    color: '#6E543C',
  },
  viewAllText: {
    fontSize: fontScale(14),
    color: '#6E543C',
  },
  categoriesScroll: {
    gap: horizontalScale(12),
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(30),
  },
  categoryButtonActive: {
    backgroundColor: '#6E543C',
  },
  categoryIcon: {
    fontSize: fontScale(16),
    marginRight: horizontalScale(8),
  },
  categoryText: {
    fontSize: fontScale(14),
    color: '#6E543C',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
  },
  streamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(16),
  },
  streamCardWrapper: {
    width: '48%', 
    marginBottom: verticalScale(20),
  },
  streamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16/12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveIndicator: {
    position: 'absolute',
    top: verticalScale(8),
    right: horizontalScale(8),
    backgroundColor: '#FF0000',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  viewerCountContainer: {
    position: 'absolute',
    top: verticalScale(8),
    left: horizontalScale(8),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerCount: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    marginLeft: horizontalScale(4),
  },
  streamTitle: {
    fontSize: fontScale(12),
    color: '#000000',
    padding: moderateScale(10),
  },
  shopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(10),
    paddingBottom: verticalScale(10),
  },
  shopLogo: {
    width: horizontalScale(24),
    height: verticalScale(24),
    borderRadius: moderateScale(12),
  },
  shopName: {
    fontSize: fontScale(12),
    color: '#6E543C',
    fontWeight: '500',
    marginLeft: horizontalScale(8),
    flex: 1,
  },
  optionsButton: {
    padding: moderateScale(4),
  },
  goLiveButton: {
    position: 'absolute',
    bottom: verticalScale(80),
    right: horizontalScale(20),
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
    elevation: 5,
  },
  goLiveText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
    marginLeft: horizontalScale(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(20),
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  modalBody: {
    flex: 1,
  },
  inputLabel: {
    fontSize: fontScale(14),
    color: '#666666',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    fontSize: fontScale(16),
    marginBottom: verticalScale(20),
  },
  cameraPreview: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(10),
    aspectRatio: 16/9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  previewText: {
    fontSize: fontScale(16),
    color: '#666666',
    marginTop: verticalScale(8),
  },
  startStreamButton: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(10),
    padding: moderateScale(16),
    alignItems: 'center',
  },
  startStreamText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
}); 