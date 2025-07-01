import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, BackHandler, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withAuth } from '../../components/withAuth';
import { PRIMARY_BROWN } from '../../config/constants';

function Profile() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [accStatus, setAccStatus] = useState('');

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await UserRoleHelper.getCurrentRole();
        setIsAdmin(role === UserRole.ADMIN);
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || '');
          setAccStatus(user.AccStatus || '');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear all user data
      await AsyncStorage.multiRemove(['token', 'user_data']);
      
      // Show logout message
      Alert.alert(
        "Đăng xuất thành công",
        "Vui lòng đăng nhập lại để tiếp tục",
        [
          {
            text: "Đăng nhập",
            onPress: () => router.replace('/pages/roles/role')
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert(
        "Lỗi",
        "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
        [
          {
            text: "Đăng nhập lại",
            onPress: () => router.replace('/pages/roles/role')
          }
        ]
      );
    }
  };

  const userMenuItems = [
    {
      id: '1',
      title: 'Chi tiết tài khoản',
      icon: 'person-outline',
      onPress: () => console.log('Account Details')
    },
    {
      id: '2',
      title: 'Chi tiết thanh toán',
      icon: 'credit-card',
      onPress: () => console.log('Payment Details')
    },
    {
      id: '3',
      title: 'Đổi phần thưởng',
      icon: 'card-giftcard',
      onPress: () => console.log('Redeem Rewards')
    },
    {
      id: '4',
      title: 'Chi tiết thông báo',
      icon: 'notifications-none',
      onPress: () => console.log('Notification Details')
    }
  ];

  const adminMenuItems = [
    {
      id: '1',
      title: 'Quản lý cửa hàng',
      icon: 'store',
      onPress: () => console.log('Shop Management')
    },
    {
      id: '2',
      title: 'Menu sản phẩm',
      icon: 'restaurant-menu',
      onPress: () => console.log('Product Menu')
    },
    {
      id: '3',
      title: 'Phản hồi khách hàng',
      icon: 'feedback',
      onPress: () => console.log('Customer Feedback')
    },
    {
      id: '4',
      title: 'Quản lý sự kiện',
      icon: 'event',
      onPress: () => console.log('Event Management')
    },
    {
      id: '5',
      title: 'Cài đặt tài khoản',
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

  // Don't render content if not authenticated
  if (!isAdmin && !userName) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6E543C', '#B69B80']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image 
              source={require('../../../assets/images/profile1.png')} 
              style={[styles.profileImage, accStatus === 'Premium' ? styles.premiumAvatar : null]} 
            />
            <View style={styles.profileInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.profileName}>{userName}</Text>
                {accStatus === 'Premium' && (
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="diamond" size={16} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.premiumBadgeText}>Premium</Text>
                  </View>
                )}
                {accStatus === 'VIP' && (
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="diamond" size={16} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.premiumBadgeText}>VIP</Text>
                  </View>
                )}
              </View>
              <View style={styles.statusContainer}>
                {(accStatus !== 'VIP' && accStatus !== 'Premium') ? (
                  <View style={[styles.statusBadge, isAdmin ? styles.adminBadge : styles.userBadge]}>
                    <Text style={styles.statusText}>{isAdmin ? 'Tài khoản doanh nghiệp' : 'Người dùng giới hạn'}</Text>
                  </View>
                ) : null}
                {isAdmin ? (
                  <TouchableOpacity 
                    style={styles.bookingAdsButton}
                    onPress={() => router.push('/pages/booking-ads/booking-ads')}
                  >
                    <Text style={styles.bookingAdsText}>Đặt quảng cáo</Text>
                  </TouchableOpacity>
                ) : (
                  accStatus !== 'Premium' && accStatus !== 'VIP' && (
                    <TouchableOpacity 
                      style={styles.premiumButton}
                      onPress={() => router.push('/pages/premium/premium')}
                    >
                      <Text style={styles.premiumButtonText}>Mua Premium ?</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Menu Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{isAdmin ? 'Quản lý doanh nghiệp' : 'Tài khoản'}</Text>
              <View style={styles.menuContainer}>
                {(isAdmin ? adminMenuItems : userMenuItems).map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <MaterialIcons name={item.icon as any} size={24} color={PRIMARY_BROWN} />
                    <Text style={styles.menuText}>{item.title}</Text>
                    <MaterialIcons name="chevron-right" size={24} color={PRIMARY_BROWN} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Chat Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trò chuyện</Text>
              <View style={styles.menuContainer}>
                {chatItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <MaterialIcons name="chat-bubble-outline" size={24} color={PRIMARY_BROWN} />
                    <Text style={styles.menuText}>{item.title}</Text>
                    <MaterialIcons name="chevron-right" size={24} color={PRIMARY_BROWN} />
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
              <Text style={styles.logoutText}>Đăng xuất</Text>
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
    backgroundColor: PRIMARY_BROWN,
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
    color: PRIMARY_BROWN,
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
  bookingAdsButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  bookingAdsText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    fontWeight: '500',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 10,
    height: 24,
    minWidth: 70,
    justifyContent: 'center',
  },
  premiumBadgeText: {
    color: '#000',
    fontWeight: '600',
    fontSize: fontScale(13),
  },
  premiumAvatar: {
    borderColor: '#FFD700',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  premiumButtonText: {
    color: '#000000',
    fontSize: fontScale(12),
    fontWeight: '500',
  },
});

export default withAuth(Profile); 