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

  // Auto slide for special offers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={24} color="#6E543C" />
            <Text style={styles.locationText}>Ho Chi Minh, Viet Nam</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push("/pages/notifications/notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color="#6E543C" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => router.push("/pages/search/search")}
        >
          <Ionicons name="search" size={20} color="#999" />
          <Text style={styles.searchText}>Search your coffee...</Text>
          <MaterialIcons name="filter-list" size={20} color="#999" />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.paymentCard}
            onPress={() => router.push("/pages/payment/payment")}
          >
            <MaterialIcons name="payment" size={24} color="#6E543C" />
            <Text style={styles.actionText}>Payment{'\n'}Add card</Text>
          </TouchableOpacity>
          <View style={styles.rewardsCard}>
            <Text style={styles.rewardsTitle}>Brewtopia Rewards</Text>
            <Text style={styles.rewardsPoints}>100</Text>
          </View>
        </View>

        {/* Special Offers */}
        <View style={styles.specialOffers}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.offersCarousel}>
            <Image 
              source={currentImage === 0 ? 
                require('../../../assets/images/special1.png') :
                require('../../../assets/images/special2.png')
              }
              style={styles.offerImage}
              resizeMode="cover"
            />
            <View style={styles.dots}>
              <View style={[styles.dot, currentImage === 0 && styles.activeDot]} />
              <View style={[styles.dot, currentImage === 1 && styles.activeDot]} />
            </View>
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

        {/* AI Chat Bot */}
        <TouchableOpacity 
          style={styles.chatBot}
          onPress={() => router.push("/pages/chat/chat")}
        >
          <Image 
            source={require('../../../assets/images/bot1.png')}
            style={styles.botImage}
          />
          <Text style={styles.botText}>How can I help you...</Text>
        </TouchableOpacity>
      </ScrollView>

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
  scrollView: {
    flex: 1,
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
    color: '#6E543C',
  },
  notificationButton: {
    padding: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    margin: 16,
    padding: 12,
    borderRadius: 10,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    color: '#999',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  rewardsCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6E543C',
  },
  rewardsTitle: {
    color: '#6E543C',
    marginBottom: 4,
  },
  rewardsPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6E543C',
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
    color: '#B68D5F',
  },
  offersCarousel: {
    alignItems: 'center',
  },
  offerImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6E543C',
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
  chatBot: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  botImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  botText: {
    marginLeft: 8,
    color: '#6E543C',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  activeNavItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
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