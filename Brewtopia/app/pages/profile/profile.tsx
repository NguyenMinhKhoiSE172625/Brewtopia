import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, BackHandler, Alert, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withAuth } from '../../components/withAuth';
import { PRIMARY_BROWN } from '../../config/constants';
import ApiService from '../../utils/ApiService';
import UserAvatar from '../../components/UserAvatar';

function Profile() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [accStatus, setAccStatus] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [userAvatarUri, setUserAvatarUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const role = await UserRoleHelper.getCurrentRole();
        setIsAdmin(role === UserRole.ADMIN);
        
        // Load từ AsyncStorage trước
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || 'Người dùng');
          setUserEmail(user.email || '');
          setAccStatus(user.AccStatus || '');
          
          // Load user avatar từ AsyncStorage trước
          if (user.avatar) {
            setUserAvatarUri(user.avatar);
          }

          // Sau đó fetch từ server để có thông tin mới nhất
          try {
            const userId = user.id || user._id;
            if (userId) {
              const serverUserData = await ApiService.user.getProfile(userId);
              if (serverUserData) {
                // Update với data từ server
                setUserName(serverUserData.name || user.name || 'Người dùng');
                setUserEmail(serverUserData.email || user.email || '');
                setAccStatus(serverUserData.AccStatus || user.AccStatus || '');
                
                // Update avatar từ server nếu có
                if (serverUserData.avatar) {
                  setUserAvatarUri(serverUserData.avatar);
                }

                // Update AsyncStorage với data mới
                const updatedUserData = {
                  ...user,
                  ...serverUserData
                };
                await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData));
              }
            }
          } catch (serverError) {
            // Ignore server errors, sử dụng data từ AsyncStorage
            console.warn('Unable to fetch updated profile from server:', serverError);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleLogout = async () => {
      Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
        [
        { text: "Hủy", style: "cancel" },
          {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['token', 'user_data']);
              router.replace('/pages/roles/role');
    } catch (error) {
      console.error('Error during logout:', error);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng xuất.");
            }
          }
          }
        ]
      );
  };

  const showComingSoonAlert = () => {
    Alert.alert(
      "Thông báo",
      "Tính năng sẽ có sớm!",
      [{ text: "OK" }]
    );
  };

  const userMenuItems = [
    {
      id: '1',
      title: 'Thông tin tài khoản',
      icon: 'person-outline',
      onPress: () => showComingSoonAlert()
    },
    {
      id: '2',
      title: 'Lịch sử đơn hàng',
      icon: 'receipt-long',
      onPress: () => showComingSoonAlert()
    },
    {
      id: '3',
      title: 'Điểm thưởng',
      icon: 'card-giftcard',
      onPress: () => router.push('/pages/rewards/rewards')
    },
    {
      id: '4',
      title: 'Cài đặt thông báo',
      icon: 'notifications-none',
      onPress: () => router.push('/pages/notifications/notifications')
    },
    {
      id: '5',
      title: 'Quán yêu thích',
      icon: 'favorite',
      onPress: () => showComingSoonAlert()
    }
  ];

  const adminMenuItems = [
    {
      id: '1',
      title: 'Quản lý cửa hàng',
      icon: 'store',
      onPress: () => showComingSoonAlert()
    },
    {
      id: '2',
      title: 'Menu sản phẩm',
      icon: 'restaurant-menu',
      onPress: () => showComingSoonAlert()
    },
    {
      id: '3',
      title: 'Quản lý đơn hàng',
      icon: 'assignment',
      onPress: () => showComingSoonAlert()
    },
    {
      id: '4',
      title: 'Thống kê bán hàng',
      icon: 'analytics',
      onPress: () => showComingSoonAlert()
    },
    {
      id: '5',
      title: 'Quản lý sự kiện',
      icon: 'event',
      onPress: () => showComingSoonAlert()
    },
    {
      id: '6',
      title: 'Cài đặt tài khoản',
      icon: 'settings',
      onPress: () => showComingSoonAlert()
    }
  ];

  const quickActions = [
    {
      id: '1',
      title: 'Chat',
      icon: 'chat',
      color: '#4CAF50',
      onPress: () => router.push('/pages/chat/users')
    },
    {
      id: '2',
      title: 'Tìm quán',
      icon: 'search',
      color: '#2196F3',
      onPress: () => router.push('/pages/search/search')
    },
    {
      id: '3',
      title: 'Đặt bàn',
      icon: 'table-restaurant',
      color: '#FF9800',
      onPress: () => router.push('/pages/order/table-booking')
    },
    {
      id: '4',
      title: 'Quét QR',
      icon: 'qr-code-scanner',
      color: '#9C27B0',
      onPress: () => console.log('QR Scanner')
    }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_BROWN} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#D4BDAA', '#C4A484']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <UserAvatar
              name={userName || 'User'}
              size={80}
              imageUri={userAvatarUri}
              showBorder={accStatus === 'Premium' || accStatus === 'VIP'}
              borderColor={accStatus === 'VIP' ? '#9C27B0' : '#FFD700'}
              borderWidth={3}
            />
            <View style={styles.profileInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: horizontalScale(8) }}>
                <Text style={styles.profileName} numberOfLines={2} ellipsizeMode="tail">{userName}</Text>
                {accStatus === 'Premium' && (
                  <View style={[styles.statusBadge, styles.premiumBadge]}>
                    <MaterialIcons name="diamond" size={14} color="#FFF" />
                    <Text style={styles.badgeText}>Premium</Text>
                  </View>
                )}
                {accStatus === 'VIP' && (
                  <View style={[styles.statusBadge, styles.vipBadge]}>
                    <MaterialIcons name="workspace-premium" size={14} color="#FFF" />
                    <Text style={styles.badgeText}>VIP</Text>
                  </View>
                )}
              </View>
              <Text style={styles.profileEmail}>{userEmail}</Text>
              <View style={styles.statusContainer}>
                {(accStatus !== 'VIP' && accStatus !== 'Premium') ? (
                  <View style={[styles.statusBadge, isAdmin ? styles.adminBadge : styles.userBadge]}>
                    <Text style={styles.statusText}>
                      {isAdmin ? 'Tài khoản doanh nghiệp' : 'Tài khoản cơ bản'}
                    </Text>
                  </View>
                ) : null}
                {isAdmin ? (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => router.push('/pages/booking-ads/booking-ads')}
                  >
                    <Text style={styles.actionButtonText}>Đặt quảng cáo</Text>
                  </TouchableOpacity>
                ) : (
                  accStatus !== 'Premium' && accStatus !== 'VIP' && (
                    <TouchableOpacity 
                      style={styles.premiumButton}
                      onPress={() => router.push('/pages/premium/premium')}
                    >
                      <MaterialIcons name="diamond" size={16} color="#000" />
                      <Text style={styles.premiumButtonText}>Nâng cấp Premium</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
              <View style={styles.quickActionsContainer}>
                {quickActions.map((action) => (
                  <TouchableOpacity 
                    key={action.id} 
                    style={styles.quickActionItem}
                    onPress={action.onPress}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                      <MaterialIcons name={action.icon as any} size={24} color="#FFF" />
                    </View>
                    <Text style={styles.quickActionText}>{action.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Menu Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isAdmin ? 'Quản lý doanh nghiệp' : 'Tài khoản'}
              </Text>
              <View style={styles.menuContainer}>
                {(isAdmin ? adminMenuItems : userMenuItems).map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[
                      styles.menuItem,
                      index === (isAdmin ? adminMenuItems : userMenuItems).length - 1 && styles.lastMenuItem
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuIconContainer}>
                      <MaterialIcons name={item.icon as any} size={24} color={PRIMARY_BROWN} />
                    </View>
                    <Text style={styles.menuText}>{item.title}</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color="#FF4444" />
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
    alignItems: 'flex-start',
    gap: horizontalScale(16),
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: fontScale(22),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
    flexShrink: 1,
  },
  profileEmail: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    marginBottom: verticalScale(8),
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: verticalScale(8),
    marginTop: verticalScale(4),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    alignSelf: 'flex-start',
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
    flexShrink: 1,
  },
  actionButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    fontWeight: '600',
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
    color: '#FF4444',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
  },
  vipBadge: {
    backgroundColor: '#9C27B0',
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: fontScale(10),
    marginLeft: horizontalScale(4),
  },

  premiumButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#000000',
    fontSize: fontScale(12),
    fontWeight: '600',
    marginLeft: horizontalScale(4),
  },

  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(8),
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: horizontalScale(4),
  },
  quickActionIcon: {
    width: horizontalScale(48),
    height: horizontalScale(48),
    borderRadius: horizontalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionText: {
    marginTop: verticalScale(8),
    fontSize: fontScale(12),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  menuIconContainer: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: horizontalScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
    marginTop: verticalScale(16),
  },
});

export default withAuth(Profile); 