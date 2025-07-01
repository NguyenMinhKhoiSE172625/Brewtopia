import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions, ScrollView, FlatList, Modal, Animated, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserRoleHelper from '../../utils/UserRoleHelper';
import * as ImagePicker from 'expo-image-picker';
import { sendMessageToGemini } from '../../services/geminiService';
import { withAuth } from '../../components/withAuth';
import ApiService from '../../utils/ApiService';
import SocketService from '../../services/socketService';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_BROWN } from '../../config/constants';
import { getBonusList } from '../../services/pointService';

interface Message {
  text: string;
  isUser: boolean;
}

const SpecialOfferItem = memo(({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Image
      source={item}
      style={{
        width: Dimensions.get('window').width - horizontalScale(32),
        height: verticalScale(200),
        borderRadius: moderateScale(16),
      }}
      resizeMode="cover"
    />
  </TouchableOpacity>
));

const MessageItem = memo(({ message, userRole }: { message: Message; userRole: string | null }) => (
  <View 
    style={[
      styles.messageContainer,
      message.isUser ? styles.userMessage : styles.botMessage
    ]}
  >
    {!message.isUser && (
      <Image 
        source={userRole === 'admin' ? require('../../../assets/images/bot2.png') : require('../../../assets/images/bot1.png')}
        style={styles.messageBotIcon}
      />
    )}
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userBubble : styles.botBubble
    ]}>
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userMessageText : styles.botMessageText
      ]}>{message.text}</Text>
    </View>
  </View>
));

function Home() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);
  const [currentImage, setCurrentImage] = useState(0);
  const [showBotMessage, setShowBotMessage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
          {text: "Xin chào người dùng", isUser: false},
    {text: "My name is Brewbot", isUser: false},
    {text: "I'm here to help you, don't hesitate to ask me anything!!", isUser: false},
    {text: "Welcome", isUser: true},
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [searchText, setSearchText] = useState('');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for welcome popup
  const welcomePopupOpacity = useRef(new Animated.Value(0)).current;
  const welcomePopupTranslateY = useRef(new Animated.Value(-50)).current;

  const specialOffers = [
    require('../../../assets/images/special1.png'),
    require('../../../assets/images/special2.png'),
    require('../../../assets/images/special3.png'),
    require('../../../assets/images/special4.png'),
    require('../../../assets/images/special5.png'),
    require('../../../assets/images/special6.png'),
    require('../../../assets/images/special7.png'),
  ];


  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const keyExtractor = useCallback((item: any, index: number) => `special-offer-${index}`, []);
  const messageKeyExtractor = useCallback((item: Message, index: number) => `message-${index}`, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: Dimensions.get('window').width - horizontalScale(32),
    offset: (Dimensions.get('window').width - horizontalScale(32)) * index,
    index,
  }), []);

  const [selectedSpecialOffer, setSelectedSpecialOffer] = useState<any>(null);
  const [showSpecialOfferModal, setShowSpecialOfferModal] = useState(false);

  const renderSpecialOffer = useCallback(({ item }: { item: any }) => (
    <SpecialOfferItem 
      item={item} 
      onPress={() => {
        setSelectedSpecialOffer(item);
        setShowSpecialOfferModal(true);
      }}
    />
  ), []);

  const renderMessage = useCallback(({ item: message }: { item: Message }) => (
    <MessageItem message={message} userRole={userRole} />
  ), [userRole]);

  // Auto scroll có thể thêm sau nếu cần

  // Show bot message after 5 seconds with animation
  useEffect(() => {
    const messageTimer = setTimeout(() => {
      setShowBotMessage(true);
      Animated.sequence([
        // Pop up animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 5000);
    return () => clearTimeout(messageTimer);
  }, []);

  // Animation for welcome popup
  useEffect(() => {
    // Get user data when component mounts
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setUserRole(user.role || 'user');
          setUserName(user.name || '');
          
          // Show welcome popup animation
          setShowWelcomePopup(true);
          
          // Animation sequence
          Animated.sequence([
            // Slide in and fade in
            Animated.parallel([
              Animated.timing(welcomePopupOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.spring(welcomePopupTranslateY, {
                toValue: 0,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
              }),
            ]),
            // Wait for 3 seconds
            Animated.delay(3000),
            // Fade out and slide up
            Animated.parallel([
              Animated.timing(welcomePopupOpacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(welcomePopupTranslateY, {
                toValue: -50,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            // Hide popup completely after animation finishes
            setShowWelcomePopup(false);
          });
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };

    getUserData();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage = { text: newMessage, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Show loading state
    setIsLoading(true);

    try {
      // Get response from Gemini
      const response = await sendMessageToGemini(newMessage);
      
      // Add bot response
      const botMessage = { text: response.text, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      // Add error message
      const errorMessage = { text: "Sorry, I encountered an error. Please try again.", isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraPress = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Quyền truy cập cần thiết', 'Quyền camera cần thiết để sử dụng tính năng này');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Photo captured:', result.assets[0].uri);
        // Handle the captured photo here
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  // State cho event
  const [events, setEvents] = useState<any[]>([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Lấy danh sách event khi vào trang
  useEffect(() => {
    const fetchEvents = async () => {
      setEventLoading(true);
      try {
        const res = await ApiService.events.getEvents();
        setEvents(res);
      } catch (e) {
        setEvents([]);
      } finally {
        setEventLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Lấy userId từ AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('user_data').then(data => {
      if (data) {
        try {
          const user = JSON.parse(data);
          setUserId(user._id || user.id);
        } catch {}
      }
    });
  }, []);

  // Hàm follow/unfollow event
  const handleFollowToggle = (eventId: string, isFollowing: boolean) => {
    if (!userId) return;
    SocketService.emit('followOrUnfollow', { eventId, userId });
    // Cập nhật UI tạm thời
    setEvents(prev => prev.map(ev => {
      if (ev._id !== eventId) return ev;
      let newFollowers = isFollowing
        ? ev.followers.filter((id: string) => id !== userId)
        : [...ev.followers, userId];
      let newCount = isFollowing
        ? Math.max(0, ev.Countfollower - 1)
        : ev.Countfollower + 1;
      return {
        ...ev,
        followers: newFollowers,
        Countfollower: newCount
      };
    }));
  };

  // Lắng nghe socket cập nhật event (nếu có)
  useEffect(() => {
    const updateEvent = (data: any) => {
      setEvents(prev => prev.map(ev => (ev._id === data._id ? data : ev)));
    };
    SocketService.on('eventUpdated', updateEvent);
    return () => {
      SocketService.removeListener('eventUpdated');
    };
  }, []);

  const [showWelcomeToast, setShowWelcomeToast] = useState(false);

  useEffect(() => {
    // Kiểm tra đã hiện toast chưa
    const checkWelcomeToast = async () => {
      const shown = await AsyncStorage.getItem('welcome_toast_shown');
      if (!shown) {
        setShowWelcomeToast(true);
        await AsyncStorage.setItem('welcome_toast_shown', '1');
        setTimeout(() => setShowWelcomeToast(false), 2500);
      }
    };
    checkWelcomeToast();
  }, []);

  // Thêm tips cho phần Bạn có biết
  const coffeeTips = [
    {
      icon: 'cafe-outline',
      text: 'Cà phê là thức uống phổ biến thứ 2 trên thế giới, chỉ sau nước lọc!'
    },
    {
      icon: 'leaf-outline',
      text: 'Hạt cà phê thực chất là hạt của quả cà phê, không phải là hạt đậu.'
    },
    {
      icon: 'flame-outline',
      text: 'Cà phê rang càng đậm thì lượng caffeine càng ít.'
    },
    {
      icon: 'timer-outline',
      text: 'Một tách espresso chỉ mất khoảng 25-30 giây để pha.'
    },
  ];

  const [rewardPoints, setRewardPoints] = useState<number>(0);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await getBonusList();
        if (Array.isArray(res)) {
          const total = res.filter((b: any) => b.status === 'active').reduce((sum: number, b: any) => sum + (b.points || 0), 0);
          setRewardPoints(total);
        }
      } catch {}
    };
    fetchPoints();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FAF6F2'}}>
      <ScrollView style={styles.content} contentContainerStyle={{paddingBottom: 32}}>
        {/* Card lớn chứa search + quick actions */}
        <View style={styles.topCard}>
          {/* Search Bar + Camera + Chuông cùng hàng */}
          <View style={styles.searchRow}>
            <View style={styles.searchBarWrapShort}>
              <MaterialIcons name="search" size={20} color={PRIMARY_BROWN} style={{marginLeft: 8}} />
              <TouchableOpacity 
                style={styles.searchBar}
                onPress={() => router.push("/pages/search/search")}
              >
                <Text style={styles.searchInput} numberOfLines={1} ellipsizeMode="tail">
                  Tìm đồ uống, quán...
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleCameraPress}
            >
              <MaterialIcons name="camera-alt" size={20} color={PRIMARY_BROWN} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push("/pages/notifications/notifications")}
            >
              <Ionicons name="notifications-outline" size={22} color={PRIMARY_BROWN} />
            </TouchableOpacity>
          </View>

          {/* Rewards Section */}
          <TouchableOpacity 
            style={styles.rewardsActionCard}
            onPress={() => router.push("/pages/rewards/rewards")}
          >
            <View style={styles.rewardsCardContent}>
              <View style={styles.rewardsCardLeft}>
                <View style={styles.rewardsIconContainer}>
                  <FontAwesome5 name="coins" size={28} color="#FFD700" />
                </View>
                <View style={styles.rewardsTextContainer}>
                  <Text style={styles.rewardsCardTitle}>Phần thưởng</Text>
                  <Text style={styles.rewardsCardSubtitle}>Tích điểm và nhận ưu đãi</Text>
                </View>
              </View>
              <View style={styles.rewardsCardRight}>
                <View style={styles.rewardsPointsDisplay}>
                  <Text style={styles.rewardsPointsNumber}>{rewardPoints}</Text>
                  <Image 
                    source={require('../../../assets/images/icondongtien.png')}
                    style={styles.rewardsPointsIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.rewardsViewText}>Xem chi tiết →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sự kiện nổi bật */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="local-fire-department" size={22} color="#FF5722" style={{marginRight: 6}} />
              <Text style={styles.sectionTitle}>Sự kiện nổi bật</Text>
            </View>
            {eventLoading ? (
              <Text style={styles.sectionLoading}>Đang tải sự kiện...</Text>
            ) : (
              events.length === 0 ? (
                <View style={styles.emptyEventWrap}>
                  <Image source={require('../../../assets/images/didyouknow.png')} style={{width: 60, height: 60, marginBottom: 8}} />
                  <Text style={{color: '#888'}}>Chưa có sự kiện nào</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 8, marginHorizontal: -18}} contentContainerStyle={{paddingHorizontal: 18}}>
                  {events.map(event => {
                    const isFollowing = !!(userId && event.followers.includes(userId));
                    return (
                      <View key={event._id} style={styles.eventCard}>
                        <Image source={{uri: event.image}} style={styles.eventImage} resizeMode="cover" />
                        <View style={styles.eventInfo}>
                          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                          <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
                          <Text style={styles.eventFollower}>Người theo dõi: {event.Countfollower}</Text>
                          <TouchableOpacity
                            style={[styles.eventFollowBtn, isFollowing && styles.eventFollowedBtn]}
                            onPress={() => handleFollowToggle(event._id, isFollowing)}
                            disabled={!userId}
                          >
                            <Text style={styles.eventFollowText}>{isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )
            )}
          </View>
        </View>

        {/* Special Offers */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="gift" size={20} color="#E91E63" style={{marginRight: 6}} />
              <Text style={styles.sectionTitle}>Ưu đãi đặc biệt</Text>
            </View>
            <ScrollView 
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={Dimensions.get('window').width - 24 - 36 + 16} // width - margins - container padding + card margin
              snapToAlignment="start"
              contentInsetAdjustmentBehavior="never"
              style={{marginTop: 8, marginHorizontal: -18}}
              contentContainerStyle={{paddingLeft: 18, paddingRight: 18}}
              onMomentumScrollEnd={(event) => {
                const cardWidth = Dimensions.get('window').width - 24 - 36 + 16;
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
                setCurrentIndex(newIndex);
              }}
            >
              {specialOffers.map((item, index) => (
                <View key={index} style={styles.specialOfferCard}>
                  <Image
                    source={item}
                    style={styles.specialOfferImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
            {/* Indicator */}
            <View style={styles.offerIndicatorRow}>
              {specialOffers.map((_, idx) => (
                <View key={idx} style={[styles.offerIndicatorDot, idx === currentIndex && styles.offerIndicatorDotActive]} />
              ))}
            </View>
          </View>
        </View>

        {/* Bạn có biết */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="lightbulb-outline" size={20} color="#FFD700" style={{marginRight: 6}} />
              <Text style={styles.sectionTitle}>Bạn có biết?</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginHorizontal: -18}} contentContainerStyle={{paddingVertical: 4, paddingHorizontal: 18}}>
              {coffeeTips.map((tip, idx) => (
                <View key={idx} style={styles.tipCard}>
                  <Ionicons name={tip.icon as any} size={24} color={PRIMARY_BROWN} style={{marginRight: 10}} />
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Nút chat nổi ngoài cùng, không bị che tab bar */}
      <TouchableOpacity
        style={[styles.floatingButton, {bottom: 90, right: 18}]}
        onPress={() => router.push('/pages/chat/users')}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={32} color={PRIMARY_BROWN} />
      </TouchableOpacity>

      <BottomBar />

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={selectedImage}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowImageModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChatModal(false)}
      >
        <View style={styles.chatModalOverlay}>
          <View style={styles.chatModalContent}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <Image 
                  source={userRole === 'admin' ? require('../../../assets/images/bot2.png') : require('../../../assets/images/bot1.png')}
                  style={styles.chatHeaderIcon}
                />
                <Text style={styles.chatHeaderText}>BREWBOT</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowChatModal(false)}
                style={styles.chatCloseButton}
              >
                <MaterialIcons name="close" size={24} color={PRIMARY_BROWN} />
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <FlatList
              data={messages}
              keyExtractor={messageKeyExtractor}
              style={styles.chatMessages}
              renderItem={renderMessage}
              initialNumToRender={5}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={50}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10
              }}
            />

            {/* Chat Input */}
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                multiline={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={isLoading}
              >
                <MaterialIcons 
                  name={isLoading ? "hourglass-empty" : "send"} 
                  size={24} 
                  color={isLoading ? "#999" : PRIMARY_BROWN} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Special Offer Modal */}
      <Modal
        visible={showSpecialOfferModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSpecialOfferModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpecialOfferModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={selectedSpecialOffer}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSpecialOfferModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default withAuth(Home);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F2',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  topCard: {
    backgroundColor: '#FFF8F3',
    borderRadius: 24,
    marginHorizontal: 12,
    marginTop: 20,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 18,
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#F0E6D2',
    zIndex: 3,
    position: 'relative',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBarWrapShort: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E8DDD4',
    marginRight: 10,
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  searchInput: {
    color: '#8B5A2B',
    fontSize: fontScale(14),
    fontWeight: '500',
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  iconButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E8DDD4',
  },

  rewardsActionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 0,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: '#F0E6D2',
    height: 100,
  },
  rewardsCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rewardsIconContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 22,
    padding: 14,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#F4C430',
    shadowColor: '#F4C430',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardsTextContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  rewardsCardTitle: {
    fontSize: fontScale(16),
    fontWeight: '700',
    color: '#8B5A2B',
    marginBottom: 4,
  },
  rewardsCardSubtitle: {
    fontSize: fontScale(14),
    color: '#A0785A',
    fontWeight: '500',
  },
  rewardsCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rewardsPointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4C430',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6B800',
    shadowColor: '#F4C430',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardsPointsNumber: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 6,
  },
  rewardsPointsIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  rewardsViewText: {
    color: '#8B5A2B',
    fontWeight: '600',
    fontSize: fontScale(13),
    opacity: 0.9,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#F0E6D2',
  },
  section: {
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#8B5A2B',
  },
  sectionLoading: {
    color: '#A0785A',
    marginVertical: 12,
    textAlign: 'center',
  },
  seeAllText: {
    color: '#D2691E',
    fontWeight: '600',
    marginLeft: 'auto',
    fontSize: fontScale(13),
  },
  emptyEventWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: '#FFF8F3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E6D2',
  },
  eventCard: {
    width: 260,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#F0E6D2',
  },
  eventImage: {
    width: 260,
    height: 140,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  eventInfo: {
    padding: 14,
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#8B5A2B',
    marginBottom: 4,
  },
  eventDesc: {
    color: '#5D4037',
    marginVertical: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  eventFollower: {
    color: '#A0785A',
    fontSize: 12,
    marginBottom: 8,
  },
  eventFollowBtn: {
    marginTop: 8,
    backgroundColor: '#8B5A2B',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#6D4423',
    shadowColor: '#8B5A2B',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  eventFollowedBtn: {
    backgroundColor: '#D7CCC8',
    borderColor: '#BCAAA4',
  },
  eventFollowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  didYouKnowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  didYouKnowImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  didYouKnowText: {
    color: '#6E543C',
    fontSize: 14,
    fontWeight: '500',
  },
  fabChatBotWrap: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    zIndex: 100,
  },
  fabChatBot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  fabBotImage: {
    width: 40,
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(10),
    borderRadius: moderateScale(20),
    width: '100%',
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: verticalScale(400),
    borderRadius: moderateScale(20),
  },
  closeButton: {
    position: 'absolute',
    top: moderateScale(-20),
    right: moderateScale(-20),
    backgroundColor: '#8B5A2B',
    borderRadius: moderateScale(20),
    padding: moderateScale(8),
    zIndex: 1000,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFF8F3',
  },
  chatModalOverlay: {
    flex: 1,
    backgroundColor: '#FFF8F3',
  },
  chatModalContent: {
    flex: 1,
    backgroundColor: '#FFF8F3',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0E6D2',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderIcon: {
    width: horizontalScale(30),
    height: verticalScale(30),
    marginRight: horizontalScale(8),
  },
  chatHeaderText: {
    fontSize: fontScale(18),
    color: '#8B5A2B',
    fontWeight: '600',
  },
  chatCloseButton: {
    padding: moderateScale(4),
  },
  chatMessages: {
    flex: 1,
    padding: moderateScale(16),
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  messageBotIcon: {
    width: horizontalScale(24),
    height: verticalScale(24),
    marginRight: horizontalScale(8),
  },
  messageBubble: {
    maxWidth: '70%',
    padding: moderateScale(12),
    borderRadius: moderateScale(20),
  },
  userBubble: {
    backgroundColor: '#8B5A2B',
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D2',
  },
  messageText: {
    fontSize: fontScale(16),
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#5D4037',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#F0E6D2',
  },
  chatInput: {
    flex: 1,
    height: verticalScale(40),
    backgroundColor: '#FFF8F3',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(16),
    marginRight: horizontalScale(12),
    fontSize: fontScale(16),
    borderWidth: 1,
    borderColor: '#E8DDD4',
  },
  welcomePopup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#8B5A2B',
    padding: verticalScale(15),
    alignItems: 'center',
    shadowColor: "#8B4513",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  welcomePopupText: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    fontWeight: 'bold',
  },
  sendButton: {
    width: horizontalScale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: '#6D4423',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  welcomeToast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
    zIndex: 200,
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#6D4423',
  },
  welcomeToastText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  floatingButton: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 12,
    zIndex: 100,
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#F0E6D2',
  },
  specialOfferCard: {
    width: Dimensions.get('window').width - 24 - 36, // screen width - container margins - container padding
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginRight: 16,
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#F0E6D2',
  },
  specialOfferImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  offerIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  offerIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8DDD4',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  offerIndicatorDotActive: {
    backgroundColor: '#8B5A2B',
    borderColor: '#6D4423',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 14,
    shadowColor: '#8B4513',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 220,
    maxWidth: 260,
    borderWidth: 1.5,
    borderColor: '#F0E6D2',
  },
  tipText: {
    color: '#8B5A2B',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
}); 