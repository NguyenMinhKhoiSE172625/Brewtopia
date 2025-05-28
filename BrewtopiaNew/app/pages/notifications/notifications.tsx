import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Notifications() {
  const notifications = [
    { id: 1, title: 'ĐÂY LÀ QUÁN CAFE 1', time: '1m ago' },
    { id: 2, title: 'ĐÂY LÀ QUÁN CAFE 2', time: '1m ago' },
    { id: 3, title: 'ĐÂY LÀ QUÁN CAFE 1', time: '1m ago' },
    { id: 4, title: 'ĐÂY LÀ QUÁN CAFE 1', time: '1m ago' },
    { id: 5, title: 'ĐÂY LÀ QUÁN CAFE 1', time: '1m ago' },
    { id: 6, title: 'ĐÂY LÀ QUÁN CAFE 1', time: '1m ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      
      <ScrollView style={styles.notificationList}>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationItem}>
            <Image 
              source={require('../../../assets/images/iconcafe.png')}
              style={styles.logo}
            />
            <View style={styles.notificationContent}>
              <View style={styles.brandContainer}>
                <Text style={styles.brandName}>BREWTOPIA</Text>
                <Text style={styles.timeText}>{notification.time}</Text>
              </View>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <MaterialIcons name="location-on" size={24} color="#6E543C" />
          <Text style={styles.navText}>Nearby</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="article" size={24} color="#6E543C" />
          <Text style={styles.navText}>News</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="home" size={24} color="#6E543C" />
          <Text style={[styles.navText, styles.navTextBold]}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="videocam" size={24} color="#6E543C" />
          <Text style={styles.navText}>Stream</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="person" size={24} color="#6E543C" />
          <Text style={styles.navText}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#6E543C',
    padding: 16,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,  // To offset the back button width and keep title centered
  },
  notificationList: {
    flex: 1,
    backgroundColor: '#FFF5EA',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#E6D5C3',
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#6E543C',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  brandName: {
    fontSize: 14,
    color: '#6E543C',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#6E543C',
    opacity: 0.8,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#000000',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 22,
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
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#6E543C',
  },
  navTextBold: {
    fontWeight: 'bold',
  },
}); 