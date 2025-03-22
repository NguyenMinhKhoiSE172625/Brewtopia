import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions, ScrollView, FlatList, Modal, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';

export default function Home() {
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
  const scaleAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

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

  const renderSpecialOffer = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedImage(item);
        setShowImageModal(true);
      }}
    >
      <Image
        source={item}
        style={styles.specialOfferImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {text: newMessage, isUser: true}]);
      setNewMessage("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              onPress={() => router.push('pages/search/search' as any)}
            >
              <Ionicons name="search" size={20} color="#999" />
              <Text style={styles.searchText}>Search your coffee...</Text>
              <TouchableOpacity style={styles.filterButton}>
                <MaterialIcons name="filter-list" size={20} color="#000" />
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
            <View style={styles.rewardsCard}>
              <Text style={styles.rewardsTitle}>Brewtopia Rewards</Text>
              <View style={styles.rewardsPointsContainer}>
                <Text style={styles.rewardsPoints}>100</Text>
                <Image 
                  source={require('../../../assets/images/icondongtien.png')}
                  style={styles.rewardsIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
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
            keyExtractor={(_, index) => index.toString()}
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
            source={require('../../../assets/images/bot1.png')}
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
                  source={require('../../../assets/images/bot1.png')}
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
            <ScrollView style={styles.chatMessages}>
              {messages.map((message, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.messageContainer,
                    message.isUser ? styles.userMessage : styles.botMessage
                  ]}
                >
                  {!message.isUser && (
                    <Image 
                      source={require('../../../assets/images/bot1.png')}
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
              ))}
            </ScrollView>

            {/* Chat Input */}
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Write a message"
                value={newMessage}
                onChangeText={setNewMessage}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={handleSendMessage}>
                <MaterialIcons name="send" size={24} color="#6E543C" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  searchText: {
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
}); 