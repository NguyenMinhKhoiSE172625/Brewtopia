import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import { useState, useEffect } from 'react';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await UserRoleHelper.getCurrentRole();
        setIsAdmin(role === UserRole.ADMIN);
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || '');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, []);

  const userMenuItems = [
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

  const adminMenuItems = [
    {
      id: '1',
      title: 'Shop Management',
      icon: 'store',
      onPress: () => console.log('Shop Management')
    },
    {
      id: '2',
      title: 'Product Menu',
      icon: 'restaurant-menu',
      onPress: () => console.log('Product Menu')
    },
    {
      id: '3',
      title: 'Customer Feedback',
      icon: 'feedback',
      onPress: () => console.log('Customer Feedback')
    },
    {
      id: '4',
      title: 'Event Management',
      icon: 'event',
      onPress: () => console.log('Event Management')
    },
    {
      id: '5',
      title: 'Account Settings',
      icon: 'settings',
      onPress: () => console.log('Account Settings')
    }
  ];

  const chatItems = [
    {
      id: '1',
      title: 'Group đi cà phê đê',
      onPress: () => router.push({
        pathname: '/pages/chat/chat',
        params: { chatId: '1', chatName: 'Group đi cà phê đê', isGroup: 'true' }
      })
    },
    {
      id: '2',
      title: 'John Weed',
      onPress: () => router.push({
        pathname: '/pages/chat/chat',
        params: { chatId: '2', chatName: 'John Weed', isGroup: 'false' }
      })
    }
  ];

  const handleLogout = () => {
    router.replace('/pages/roles/role');
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
              <Text style={styles.profileName}>{userName}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, isAdmin ? styles.adminBadge : styles.userBadge]}>
                  <Text style={styles.statusText}>{isAdmin ? 'Business Account' : 'Limited User'}</Text>
                </View>
                {!isAdmin && (
                  <TouchableOpacity 
                    style={styles.buyPremiumButton}
                    onPress={() => router.push('/pages/premium/premium')}
                  >
                    <Text style={styles.buyPremiumText}>Buy Premium ?</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.mainContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{isAdmin ? 'Business Management' : 'Account'}</Text>
              <View style={styles.menuContainer}>
                {(isAdmin ? adminMenuItems : userMenuItems).map((item) => (
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
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  userBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  adminBadge: {
    backgroundColor: '#FFD700',
  },
  statusText: {
    color: '#000000',
    fontSize: fontScale(12),
    fontWeight: '500',
  },
  buyPremiumButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  buyPremiumText: {
    color: '#000000',
    fontSize: fontScale(12),
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    padding: moderateScale(16),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(16),
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuText: {
    flex: 1,
    marginLeft: horizontalScale(16),
    fontSize: fontScale(16),
    color: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(24),
  },
  logoutText: {
    marginLeft: horizontalScale(8),
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FF0000',
  },
}); 