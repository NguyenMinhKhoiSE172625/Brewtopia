import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';

export default function Profile() {
  const router = useRouter();

  const menuItems = [
    {
      id: '1',
      title: 'Account Details',
      icon: 'person-outline',
      onPress: () => console.log('Account Details')
    },
    {
      id: '2',
      title: 'Payment Details',
      icon: 'credit-card',
      onPress: () => console.log('Payment Details')
    },
    {
      id: '3',
      title: 'Redeem Rewards',
      icon: 'card-giftcard',
      onPress: () => console.log('Redeem Rewards')
    },
    {
      id: '4',
      title: 'Notification Details',
      icon: 'notifications-none',
      onPress: () => console.log('Notification Details')
    }
  ];

  const chatItems = [
    {
      id: '1',
      title: 'Group đi cà phê đê',
      onPress: () => console.log('Chat Group')
    },
    {
      id: '2',
      title: 'John Weed',
      onPress: () => console.log('Chat John')
    }
  ];

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6E543C', '#B69B80']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image 
              source={require('../../../assets/images/profile1.png')} 
              style={styles.profileImage} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Ngô Văn A</Text>
              <View style={styles.statusContainer}>
                <View style={styles.freeStatus}>
                  <Text style={styles.freeText}>Free</Text>
                </View>
                <TouchableOpacity 
                  style={styles.buyPremiumButton}
                  onPress={() => console.log('Buy Premium')}
                >
                  <Text style={styles.buyPremiumText}>Buy Premium ?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.mainContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.menuContainer}>
                {menuItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <MaterialIcons name={item.icon as any} size={24} color="#6E543C" />
                    <Text style={styles.menuText}>{item.title}</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#6E543C" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Chat Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chat</Text>
              <View style={styles.menuContainer}>
                {chatItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <MaterialIcons name="chat-bubble-outline" size={24} color="#6E543C" />
                    <Text style={styles.menuText}>{item.title}</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#6E543C" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color="#FF0000" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6E543C',
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: moderateScale(16),
  },
  headerTitle: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(16),
  },
  profileImage: {
    width: horizontalScale(80),
    height: horizontalScale(80),
    borderRadius: horizontalScale(40),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  freeStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  freeText: {
    fontSize: fontScale(14),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  buyPremiumButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  buyPremiumText: {
    fontSize: fontScale(14),
    color: '#FFD700',
    fontWeight: '500',
  },
  mainContent: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    flex: 1,
    paddingTop: verticalScale(20),
  },
  section: {
    padding: moderateScale(16),
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(16),
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuText: {
    flex: 1,
    fontSize: fontScale(16),
    color: '#000000',
    marginLeft: horizontalScale(16),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(16),
    marginHorizontal: horizontalScale(16),
    marginVertical: verticalScale(24),
    backgroundColor: '#FFE4E4',
    borderRadius: moderateScale(16),
  },
  logoutText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FF0000',
    marginLeft: horizontalScale(8),
  },
}); 