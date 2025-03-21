import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Home() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);
  const [currentImage, setCurrentImage] = useState(0);
  const [showBotMessage, setShowBotMessage] = useState(false);

  // Auto slide for special offers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Show bot message after 5 seconds
  useEffect(() => {
    const messageTimer = setTimeout(() => {
      setShowBotMessage(true);
    }, 5000);
    return () => clearInterval(messageTimer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
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

      <ScrollView style={styles.scrollView}>
        {/* Special Offers */}
        <View style={styles.specialOffers}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.offersCarousel}
          >
            <Image 
              source={require('../../../assets/images/special1.png')}
              style={styles.offerImage}
              resizeMode="cover"
            />
            <Image 
              source={require('../../../assets/images/special2.png')}
              style={styles.offerImage}
              resizeMode="cover"
            />
          </ScrollView>
          <View style={styles.dots}>
            <View style={[styles.dot, currentImage === 0 && styles.activeDot]} />
            <View style={[styles.dot, currentImage === 1 && styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Did you know section */}
        <View style={styles.didYouKnow}>
          <Text style={styles.sectionTitle}>Did you know ...</Text>
          <Image 
            source={require('../../../assets/images/didyouknow.png')}
            style={styles.didYouKnowImage}
            resizeMode="cover"
          />
        </View>

        {/* Add spacing for chatbot */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* AI Chat Bot */}
      <View style={styles.chatBotContainer}>
        {showBotMessage && (
          <View style={styles.chatBubble}>
            <Text style={styles.botText}>How can i help you...</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.chatBot}
          onPress={() => router.push("/pages/chat/chat")}
        >
          <Image 
            source={require('../../../assets/images/bot1.png')}
            style={styles.botImage}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="location-on" size={24} color="#6E543C" />
          <Text style={styles.navText}>Nearby</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="article" size={24} color="#6E543C" />
          <Text style={styles.navText}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <MaterialIcons name="home" size={24} color="#6E543C" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="videocam" size={24} color="#6E543C" />
          <Text style={styles.navText}>Stream</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="person" size={24} color="#6E543C" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#6E543C',
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#FFFFFF',
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    padding: 12,
    borderRadius: 10,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    color: '#999',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  paymentContent: {
    alignItems: 'flex-start',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#000000',
    marginTop: 2,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  rewardsPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rewardsPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 4,
  },
  rewardsIcon: {
    width: 24,
    height: 24,
    marginLeft: 4,
  },
  specialOffers: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6E543C',
  },
  seeAllText: {
    color: '#6E543C',
  },
  offersCarousel: {
    flexDirection: 'row',
  },
  offerImage: {
    width: 300,
    height: 180,
    borderRadius: 10,
    marginRight: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    opacity: 0.5,
  },
  activeDot: {
    opacity: 1,
  },
  didYouKnow: {
    padding: 16,
  },
  didYouKnowImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 16,
  },
  chatBotContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  chatBot: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botImage: {
    width: 60,
    height: 60,
  },
  chatBubble: {
    backgroundColor: '#D9D9D9',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 8,
  },
  botText: {
    color: '#6E543C',
    fontSize: 18,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  activeNavItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#6E543C',
  },
  activeNavText: {
    fontWeight: '600',
  },
}); 