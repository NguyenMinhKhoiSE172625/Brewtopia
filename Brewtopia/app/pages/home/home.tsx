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
    {text: "Hello User", isUser: false},
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
    require('../../../assets/images/special1.png'),
  ];

  const flatListRef = useRef<FlatList | null>(null);
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

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex < specialOffers.length - 1 ? prevIndex + 1 : 0;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [specialOffers.length]);

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
        Alert.alert('Permission Required', 'Camera permission is required to use this feature');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Welcome Popup */}
      {showWelcomePopup && (
        <Animated.View 
          style={[
            styles.welcomePopup,
            {
              opacity: welcomePopupOpacity,
              transform: [{ translateY: welcomePopupTranslateY }],
            }
          ]}
        >
          <Text style={styles.welcomePopupText}>
            Welcome, {userName || 'User'} ({UserRoleHelper.getDisplayName(userRole)})
          </Text>
        </Animated.View>
      )}
      
      <ScrollView style={styles.content}>
        <View style={styles.topSection}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={24} color="#FFFFFF" />
              <Text style={styles.locationText}>Ho Chi Minh, Viet Nam</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push("/pages/notifications/notifications")}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TouchableOpacity 
              style={styles.searchBar}
              onPress={() => router.push("/pages/search/search")}
            >
              <MaterialIcons name="search" size={24} color="#6E543C" />
              <Text style={styles.searchInput}>Search for drinks...</Text>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={handleCameraPress}
              >
                <MaterialIcons name="camera-alt" size={24} color="#6E543C" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.paymentCard}
              onPress={() => router.push("/pages/payment/payment")}
            >
              <View style={styles.paymentContent}>
                <Text style={styles.paymentTitle}>Payment</Text>
                <Text style={styles.paymentSubtitle}>Add card</Text>
                <MaterialIcons name="credit-card" size={24} color="#000000" style={styles.paymentIcon} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.rewardsCard}
              onPress={() => router.push("/pages/rewards/rewards")}
            >
              <Text style={styles.rewardsTitle}>Brewtopia Rewards</Text>
              <View style={styles.rewardsPointsContainer}>
                <Text style={styles.rewardsPoints}>100</Text>
                <Image 
                  source={require('../../../assets/images/icondongtien.png')}
                  style={styles.rewardsIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Offers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatListRef}
            data={specialOffers}
            renderItem={renderSpecialOffer}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={Dimensions.get('window').width - horizontalScale(16)}
            decelerationRate="fast"
            keyExtractor={keyExtractor}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
            getItemLayout={getItemLayout}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / (Dimensions.get('window').width - horizontalScale(32))
              );
              setCurrentIndex(newIndex);
            }}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
          />
        </View>

        {/* Did you know section */}
        <View style={styles.didYouKnow}>
          <Text style={styles.sectionTitle}>Did you know ...</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(require('../../../assets/images/didyouknow.png'));
              setShowImageModal(true);
            }}
          >
            <Image 
              source={require('../../../assets/images/didyouknow.png')}
              style={styles.didYouKnowImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* Add spacing for chatbot */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* AI Chat Bot */}
      <View style={styles.chatBotContainer}>
        {showBotMessage && (
          <Animated.View style={[
            styles.chatBubble,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
              ],
            }
          ]}>
            <Text style={styles.chatBubbleText}>How can i help you...</Text>
          </Animated.View>
        )}
        <TouchableOpacity 
          style={styles.chatBot}
          onPress={() => setShowChatModal(true)}
        >
          <Image 
            source={userRole === 'admin' ? require('../../../assets/images/bot2.png') : require('../../../assets/images/bot1.png')}
            style={styles.botImage}
          />
        </TouchableOpacity>
      </View>

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
                <MaterialIcons name="close" size={24} color="#6E543C" />
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
                  color={isLoading ? "#999" : "#6E543C"} 
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  topSection: {
    backgroundColor: '#6E543C',
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    marginLeft: horizontalScale(8),
    color: '#FFFFFF',
  },
  notificationButton: {
    padding: moderateScale(8),
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(8),
    fontSize: fontScale(14),
    color: '#999',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(8),
    borderRadius: moderateScale(8),
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    padding: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(3),
    elevation: 3,
  },
  paymentContent: {
    alignItems: 'flex-start',
  },
  paymentTitle: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#000000',
  },
  paymentSubtitle: {
    fontSize: fontScale(14),
    color: '#000000',
    marginTop: verticalScale(2),
  },
  paymentIcon: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -12,
  },
  rewardsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  rewardsTitle: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#000000',
  },
  rewardsPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rewardsPoints: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    color: '#000000',
    marginRight: horizontalScale(4),
  },
  rewardsIcon: {
    width: horizontalScale(24),
    height: verticalScale(24),
    marginLeft: horizontalScale(4),
  },
  section: {
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  seeAllText: {
    fontSize: fontScale(14),
    color: '#6E543C',
  },
  didYouKnow: {
    padding: 16,
  },
  didYouKnowImage: {
    width: '100%',
    height: verticalScale(150),
    borderRadius: moderateScale(20),
  },
  chatBotContainer: {
    position: 'absolute',
    bottom: verticalScale(80),
    right: horizontalScale(16),
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  chatBot: {
    width: horizontalScale(60),
    height: verticalScale(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  botImage: {
    width: horizontalScale(60),
    height: verticalScale(60),
  },
  chatBubble: {
    backgroundColor: '#D9D9D9',
    padding: moderateScale(12),
    borderRadius: moderateScale(30),
    marginBottom: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatBubbleText: {
    color: '#6E543C',
    fontSize: fontScale(18),
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  navItem: {
    alignItems: 'center',
  },
  activeNavItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(16),
  },
  navText: {
    marginTop: verticalScale(4),
    fontSize: fontScale(12),
    color: '#999',
  },
  activeNavText: {
    color: '#6E543C',
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
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(20),
    padding: moderateScale(8),
    zIndex: 1000,
    elevation: 5,
  },
  specialOfferImage: {
    width: Dimensions.get('window').width - horizontalScale(32),
    height: verticalScale(180),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(16),
  },
  specialOfferContainer: {
    marginBottom: verticalScale(20),
  },
  specialOfferHeader: {
    marginBottom: verticalScale(10),
  },
  chatModalOverlay: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chatModalContent: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
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
    color: '#6E543C',
    fontWeight: '500',
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
    backgroundColor: '#6E543C',
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: fontScale(16),
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#000000',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  chatInput: {
    flex: 1,
    height: verticalScale(40),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(16),
    marginRight: horizontalScale(12),
    fontSize: fontScale(16),
  },
  welcomePopup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#6E543C',
    padding: verticalScale(15),
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(20),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 