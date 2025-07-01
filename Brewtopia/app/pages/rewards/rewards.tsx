import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import { getBonusList, getBonusListWithPagination, claimDailyBonus, claimTaskBonus, claimEventBonus, claimReferralBonus } from '../../services/pointService';

// Định nghĩa hệ thống cấp độ thành viên
const membershipLevels = [
  { name: 'Bronze Member', minPoints: 0, maxPoints: 199, color: '#CD7F32', benefits: ['Tích điểm cơ bản', 'Nhận thông báo ưu đãi'] },
  { name: 'Silver Member', minPoints: 200, maxPoints: 499, color: '#C0C0C0', benefits: ['10% giảm giá tất cả đơn hàng', 'Đồ uống miễn phí sinh nhật', '2x điểm cuối tuần'] },
  { name: 'Gold Member', minPoints: 500, maxPoints: 999, color: '#FFD700', benefits: ['15% giảm giá tất cả đơn hàng', 'Ưu tiên đặt bàn', '3x điểm cuối tuần', 'Quà tặng sinh nhật đặc biệt'] },
  { name: 'Platinum Member', minPoints: 1000, maxPoints: 1999, color: '#E5E4E2', benefits: ['20% giảm giá tất cả đơn hàng', 'Phục vụ VIP', '4x điểm cuối tuần', 'Sự kiện độc quyền'] },
  { name: 'Diamond Member', minPoints: 2000, maxPoints: Infinity, color: '#B9F2FF', benefits: ['25% giảm giá tất cả đơn hàng', 'Concierge cá nhân', '5x điểm cuối tuần', 'Trải nghiệm tuyệt vời nhất'] }
];

const getCurrentMembershipLevel = (points: number) => {
  return membershipLevels.find(level => points >= level.minPoints && points <= level.maxPoints) || membershipLevels[0];
};

const getNextMembershipLevel = (points: number) => {
  const currentLevel = getCurrentMembershipLevel(points);
  const currentIndex = membershipLevels.findIndex(level => level.name === currentLevel.name);
  return currentIndex < membershipLevels.length - 1 ? membershipLevels[currentIndex + 1] : null;
};

const getLevelIcon = (levelName: string) => {
  if (levelName.includes('Bronze')) return 'military-tech';
  if (levelName.includes('Silver')) return 'stars';
  if (levelName.includes('Gold')) return 'emoji-events';
  if (levelName.includes('Platinum')) return 'workspace-premium';
  if (levelName.includes('Diamond')) return 'diamond';
  return 'stars';
};

const getLevelColor = (levelName: string) => {
  if (levelName.includes('Bronze')) return '#CD7F32';
  if (levelName.includes('Silver')) return '#8E9AAF';
  if (levelName.includes('Gold')) return '#FFD700';
  if (levelName.includes('Platinum')) return '#9370DB';
  if (levelName.includes('Diamond')) return '#40E0D0';
  return '#FFD700';
};

export default function Rewards() {
  const router = useRouter();
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [bonusList, setBonusList] = useState<any[]>([]);
  const [allBonusList, setAllBonusList] = useState<any[]>([]);
  const [dailyCountdown, setDailyCountdown] = useState<string>('');
  const [lastKnownLevel, setLastKnownLevel] = useState<string>('');
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Cleanup interval khi component unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  const missionConfigs = [
    {
      id: 'daily',
      title: 'Điểm danh hằng ngày',
      points: 10,
      icon: 'calendar-today',
      claim: claimDailyBonus,
    },
    {
      id: 'task',
      title: 'Hoàn thành nhiệm vụ',
      points: 20,
      icon: 'assignment-turned-in',
      claim: claimTaskBonus,
    },
    {
      id: 'event',
      title: 'Tham gia sự kiện',
      points: 50,
      icon: 'event',
      claim: claimEventBonus,
    },
    {
      id: 'referral',
      title: 'Mời bạn bè',
      points: 30,
      icon: 'person-add',
      claim: claimReferralBonus,
    },
    // Bỏ admin vì chỉ admin mới có thể tặng điểm này, không phải user tự claim
  ];

  const [claiming, setClaiming] = useState<string | null>(null);

  // Xác định nhiệm vụ đã nhận dựa vào bonusList
  const claimedMissions = missionConfigs.reduce((acc, m) => {
    if (m.id === 'daily') {
      // Tìm daily bonus gần nhất
      const latestDaily = bonusList
        .filter(b => b.type === 'daily' && b.status === 'active')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      if (latestDaily) {
        // Kiểm tra xem đã đủ 24 giờ từ lần claim cuối chưa
        const claimedAt = new Date(latestDaily.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - claimedAt.getTime()) / (1000 * 60 * 60);
        acc[m.id] = Boolean(hoursDiff < 24); // Đã claim nếu chưa đủ 24 giờ
      } else {
        acc[m.id] = false; // Chưa claim lần nào
      }
    } else {
      acc[m.id] = Boolean(bonusList.some(b => b.type === m.id && b.status === 'active'));
    }
    return acc;
  }, {} as Record<string, boolean>);

  // Tính thời gian còn lại cho daily
  useEffect(() => {
    // Tìm daily bonus gần nhất
    const latestDaily = bonusList
      .filter(b => b.type === 'daily' && b.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (latestDaily) {
      const claimedAt = new Date(latestDaily.createdAt);
      const nextClaim = new Date(claimedAt.getTime() + 24 * 60 * 60 * 1000);
      
      const updateCountdown = () => {
        const diff = nextClaim.getTime() - Date.now();
        if (diff <= 0) {
          setDailyCountdown('');
          if (countdownInterval.current) clearInterval(countdownInterval.current);
          // Reload bonusList để update trạng thái có thể claim lại
          setCurrentPage(1);
          fetchBonusListPaginated(1);
        } else {
          const seconds = Math.floor((diff / 1000) % 60);
          const minutes = Math.floor((diff / 60000) % 60);
          const hours = Math.floor(diff / (60 * 60000));
          setDailyCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      };
      
      updateCountdown();
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      countdownInterval.current = setInterval(updateCountdown, 1000);
      
      return () => { 
        if (countdownInterval.current) clearInterval(countdownInterval.current); 
      };
    } else {
      setDailyCountdown('');
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    }
  }, [bonusList]);

  // Function để fetch bonus list với pagination
  const fetchBonusListPaginated = async (page: number = 1) => {
    try {
      setLoading(true);
      
      const res = await getBonusListWithPagination(page, 10);
      
      if (res && Array.isArray(res.data)) {
        const newBonuses = res.data;
        
        // Chỉ hiển thị data của trang hiện tại
        setAllBonusList(newBonuses);
        
        setCurrentPage(res.currentPage || page);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.totalItems || res.total || newBonuses.length);
        
        // Set bonusList với toàn bộ data để tính điểm và logic missions
        if (res.allData && Array.isArray(res.allData)) {
          setBonusList(res.allData);
          const total = res.allData.filter((b: any) => b.status === 'active').reduce((sum: number, b: any) => sum + (b.points || 0), 0);
          
          // Kiểm tra xem có nâng cấp không
          const currentLevel = getCurrentMembershipLevel(total);
          const storedLevel = await AsyncStorage.getItem('lastMembershipLevel');
          
          if (storedLevel && storedLevel !== currentLevel.name) {
            // Có nâng cấp, lưu thông tin để hiển thị màn hình chúc mừng
            await AsyncStorage.setItem('newMembershipAchieved', JSON.stringify({
              level: currentLevel.name,
              points: total,
              benefits: currentLevel.benefits
            }));
          }
          
          await AsyncStorage.setItem('lastMembershipLevel', currentLevel.name);
          setLastKnownLevel(currentLevel.name);
          setRewardPoints(total);
        } else {
          setBonusList(newBonuses);
        }
      } else {
        // Fallback to old API if pagination not supported
        const fallbackRes = await getBonusList();
        if (Array.isArray(fallbackRes)) {
          setBonusList(fallbackRes);
          // Calculate pagination for current page
          const startIndex = (page - 1) * 10;
          const endIndex = startIndex + 10;
          setAllBonusList(fallbackRes.slice(startIndex, endIndex));
          setTotalPages(Math.ceil(fallbackRes.length / 10));
          setTotalItems(fallbackRes.length);
          setCurrentPage(page);
          const total = fallbackRes.filter((b: any) => b.status === 'active').reduce((sum: number, b: any) => sum + (b.points || 0), 0);
          setRewardPoints(total);
        }
      }
    } catch (error) {
      console.log('Error fetching bonus list:', error);
      // Fallback to old API
      try {
        const fallbackRes = await getBonusList();
        if (Array.isArray(fallbackRes)) {
          setBonusList(fallbackRes);
          // Calculate pagination for current page
          const startIndex = (page - 1) * 10;
          const endIndex = startIndex + 10;
          setAllBonusList(fallbackRes.slice(startIndex, endIndex));
          setTotalPages(Math.ceil(fallbackRes.length / 10));
          setTotalItems(fallbackRes.length);
          setCurrentPage(page);
          const total = fallbackRes.filter((b: any) => b.status === 'active').reduce((sum: number, b: any) => sum + (b.points || 0), 0);
          setRewardPoints(total);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // Function để chuyển trang
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      fetchBonusListPaginated(page);
    }
  };

  useEffect(() => {
    fetchBonusListPaginated(1);
  }, []);

  const handleRedeemPoints = async () => {
    const currentLevel = getCurrentMembershipLevel(rewardPoints);
    const nextLevel = getNextMembershipLevel(rewardPoints);
    
    // Kiểm tra xem có thành tích mới không
    const newAchievement = await AsyncStorage.getItem('newMembershipAchieved');
    if (newAchievement) {
      // Có thành tích mới, hiển thị màn hình chúc mừng
      await AsyncStorage.removeItem('newMembershipAchieved'); // Xóa sau khi hiển thị
      router.push('/pages/mission-complete/mission-complete');
    } else if (nextLevel) {
      // Chưa đủ điểm lên cấp tiếp theo
      const pointsNeeded = nextLevel.minPoints - rewardPoints;
      Alert.alert(
        `Cấp độ hiện tại: ${currentLevel.name}`,
        `Bạn cần thêm ${pointsNeeded} điểm để lên ${nextLevel.name}\n\nQuyền lợi hiện tại:\n${currentLevel.benefits.map(b => `• ${b}`).join('\n')}`,
        [{ text: 'OK' }]
      );
    } else {
      // Đã đạt cấp cao nhất
      Alert.alert(
        `Chúc mừng! ${currentLevel.name}`,
        `Bạn đã đạt cấp độ cao nhất với ${rewardPoints} điểm!\n\nQuyền lợi của bạn:\n${currentLevel.benefits.map(b => `• ${b}`).join('\n')}`,
        [{ text: 'Tuyệt vời!' }]
      );
    }
  };

  const handleClaim = async (mission: any) => {
    setClaiming(mission.id);
    try {
      await mission.claim();
      Alert.alert('Thành công', `Bạn đã nhận được +${mission.points} điểm!`);
      // Reload bonus list và điểm - quay về trang 1
      setCurrentPage(1);
      await fetchBonusListPaginated(1);
    } catch (err: any) {
      console.log('Error claiming mission:', err);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại.';
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (typeof err?.data === 'string') {
        errorMessage = err.data;
      }
      
      // Xử lý đặc biệt cho daily bonus
      if (mission.id === 'daily' && (
        errorMessage.includes('24 giờ') || 
        errorMessage.includes('chưa đủ 24 giờ') ||
        errorMessage.includes('trong vòng 24 giờ') ||
        errorMessage.includes('đã nhận điểm daily')
      )) {
        // Tìm daily bonus gần nhất để tính toán thời gian còn lại
        const latestDaily = bonusList
          .filter(b => b.type === 'daily' && b.status === 'active')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (latestDaily) {
          const claimedAt = new Date(latestDaily.createdAt);
          const nextClaim = new Date(claimedAt.getTime() + 24 * 60 * 60 * 1000);
          const diff = nextClaim.getTime() - Date.now();
          
          if (diff > 0) {
            const hours = Math.floor(diff / (60 * 60000));
            const minutes = Math.floor((diff / 60000) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            Alert.alert(
              'Thông báo', 
              `Bạn đã nhận điểm danh rồi!\nCó thể nhận lại sau: ${hours}h ${minutes}m ${seconds}s`
            );
          } else {
            Alert.alert('Thông báo', 'Bạn có thể nhận điểm danh lại rồi! Hãy thử lại.');
            // Reload để cập nhật trạng thái
            setCurrentPage(1);
            fetchBonusListPaginated(1);
          }
        } else {
          Alert.alert('Thông báo', 'Bạn có thể nhận điểm danh rồi!');
        }
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setClaiming(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/pages/home/home')}
        >
          <MaterialIcons name="home" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phần thưởng của tôi</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Points Summary */}
        <View style={styles.pointsCard}>
          <Image 
            source={require('../../../assets/images/coinbackground.png')}
            style={styles.pointsBackground}
            resizeMode="cover"
          />
          <Text style={styles.pointsTitle}>Tổng điểm</Text>
          <Text style={styles.pointsValue}>{rewardPoints}</Text>
        </View>

        {/* Membership Level Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <MaterialIcons 
              name={getLevelIcon(getCurrentMembershipLevel(rewardPoints).name)} 
              size={32} 
              color={getLevelColor(getCurrentMembershipLevel(rewardPoints).name)} 
            />
            <View style={styles.membershipTitleContainer}>
              <Text style={styles.membershipTitle}>Cấp thành viên</Text>
              <Text style={[styles.membershipLevel, { color: getLevelColor(getCurrentMembershipLevel(rewardPoints).name) }]}>
                {getCurrentMembershipLevel(rewardPoints).name}
              </Text>
            </View>
          </View>
          
          {getNextMembershipLevel(rewardPoints) ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  Cần {getNextMembershipLevel(rewardPoints)!.minPoints - rewardPoints} điểm để lên{' '}
                  <Text style={[styles.nextLevelText, { color: getLevelColor(getNextMembershipLevel(rewardPoints)!.name) }]}>
                    {getNextMembershipLevel(rewardPoints)!.name}
                  </Text>
                </Text>
                <Text style={styles.progressPercentage}>
                  {Math.round((rewardPoints / getNextMembershipLevel(rewardPoints)!.minPoints) * 100)}% hoàn thành
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${Math.min(100, (rewardPoints / getNextMembershipLevel(rewardPoints)!.minPoints) * 100)}%`,
                      backgroundColor: getLevelColor(getCurrentMembershipLevel(rewardPoints).name)
                    }
                  ]} 
                />
              </View>
            </View>
          ) : (
            <View style={styles.maxLevelContainer}>
              <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
              <Text style={styles.maxLevelText}>Bạn đã đạt cấp độ cao nhất!</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.redeemButton, { backgroundColor: getLevelColor(getCurrentMembershipLevel(rewardPoints).name) }]}
            onPress={handleRedeemPoints}
          >
            <Text style={styles.redeemButtonText}>
              {getNextMembershipLevel(rewardPoints) ? 'Xem quyền lợi' : 'Quyền lợi đặc biệt'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Missions */}
        <View style={styles.missionsSection}>
          <Text style={styles.sectionTitle}>Nhiệm vụ có sẵn</Text>
          {missionConfigs.map(mission => (
            <View key={mission.id} style={styles.missionCard}>
              <View style={styles.missionIcon}>
                <MaterialIcons 
                  name={mission.icon} 
                  size={24} 
                  color={claimedMissions[mission.id] ? '#4CAF50' : '#6E543C'} 
                />
              </View>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionPoints}>+{mission.points} points</Text>
                                 {/* Hiển thị trạng thái cho daily mission */}
                 {mission.id === 'daily' && (
                   <>
                     {Boolean(claimedMissions['daily']) && Boolean(dailyCountdown) ? (
                       <Text style={styles.countdownText}>⏰ Nhận lại sau: {dailyCountdown}</Text>
                     ) : Boolean(claimedMissions['daily']) && !Boolean(dailyCountdown) ? (
                       <Text style={styles.readyText}>✅ Có thể nhận lại rồi!</Text>
                     ) : (
                       <Text style={styles.availableText}>🎯 Sẵn sàng nhận!</Text>
                     )}
                   </>
                 )}
              </View>
              <View style={styles.missionStatus}>
                {claimedMissions[mission.id] && (mission.id !== 'daily' || Boolean(dailyCountdown)) ? (
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.claimButton,
                      (claiming === mission.id || (mission.id === 'daily' && claimedMissions['daily'] && Boolean(dailyCountdown))) && styles.claimButtonDisabled
                    ]}
                    onPress={() => handleClaim(mission)}
                    disabled={Boolean(claiming === mission.id || (mission.id === 'daily' && claimedMissions['daily'] && Boolean(dailyCountdown)))}
                  >
                    <Text style={styles.claimButtonText}>
                      {claiming === mission.id ? 'Đang nhận...' : 'Nhận'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Danh sách điểm thưởng */}
        <View style={{marginTop: 24}}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Lịch sử điểm thưởng</Text>
            {totalItems > 0 && (
              <Text style={styles.pageInfo}>
                {totalPages > 1 ? `Trang ${currentPage}/${totalPages}` : `${totalItems} mục`}
              </Text>
            )}
          </View>
          
          {allBonusList.length === 0 && <Text style={{color:'#888', textAlign: 'center', marginVertical: 20}}>Chưa có điểm thưởng nào</Text>}
          
          {allBonusList.map((bonus, idx) => (
            <View key={`${bonus._id || bonus.id || idx}`} style={styles.bonusHistoryCard}>
              <View style={styles.bonusInfo}>
                <Text style={styles.bonusType}>
                  {bonus.type === 'daily' ? 'Điểm danh' : 
                   bonus.type === 'event' ? 'Sự kiện' : 
                   bonus.type === 'referral' ? 'Mời bạn bè' : 
                   bonus.type === 'admin' ? 'Admin' : 'Nhiệm vụ'}
                </Text>
                <Text style={styles.bonusNote}>{bonus.note || 'Không có ghi chú'}</Text>
                <Text style={styles.bonusDate}>{new Date(bonus.createdAt).toLocaleString('vi-VN')}</Text>
              </View>
              <View style={styles.bonusPoints}>
                <Text style={styles.bonusPointsText}>+{bonus.points}</Text>
                <Text style={styles.bonusStatus}>{bonus.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</Text>
              </View>
            </View>
          ))}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              {/* Previous Button */}
              <TouchableOpacity 
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <MaterialIcons name="chevron-left" size={20} color={currentPage === 1 ? "#CCCCCC" : "#6E543C"} />
                <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>Trước</Text>
              </TouchableOpacity>

              {/* Page Numbers */}
              <View style={styles.pageNumbersContainer}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }

                  return (
                    <TouchableOpacity
                      key={pageNumber}
                      style={[
                        styles.pageNumberButton,
                        currentPage === pageNumber && styles.pageNumberButtonActive
                      ]}
                      onPress={() => goToPage(pageNumber)}
                      disabled={loading}
                    >
                      <Text style={[
                        styles.pageNumberText,
                        currentPage === pageNumber && styles.pageNumberTextActive
                      ]}>
                        {pageNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Next Button */}
              <TouchableOpacity 
                style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>Sau</Text>
                <MaterialIcons name="chevron-right" size={20} color={currentPage === totalPages ? "#CCCCCC" : "#6E543C"} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingIndicator}>
              <MaterialIcons name="hourglass-empty" size={24} color="#6E543C" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          )}
          
          {/* Info Text */}
          {totalItems > 0 && (
            <Text style={styles.totalItemsText}>
              Hiển thị {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} của {totalItems} lịch sử
            </Text>
          )}
        </View>
      </ScrollView>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  homeButton: {
    marginRight: horizontalScale(16),
  },
  headerTitle: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#6E543C',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: moderateScale(16),
  },
  pointsCard: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    alignItems: 'center',
    overflow: 'hidden',
  },
  pointsBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  pointsTitle: {
    fontSize: fontScale(18),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
  },
  pointsValue: {
    fontSize: fontScale(48),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: verticalScale(16),
  },
  membershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginTop: verticalScale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  membershipTitleContainer: {
    flex: 1,
    marginLeft: horizontalScale(12),
  },
  membershipTitle: {
    fontSize: fontScale(14),
    color: '#666666',
    fontWeight: '500',
  },
  membershipLevel: {
    fontSize: fontScale(20),
    fontWeight: '700',
    marginTop: verticalScale(2),
  },
  progressContainer: {
    marginBottom: verticalScale(16),
  },
  progressInfo: {
    marginBottom: verticalScale(8),
  },
  progressText: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  nextLevelText: {
    fontWeight: '600',
  },
  progressBarContainer: {
    height: verticalScale(8),
    backgroundColor: '#F0F0F0',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: moderateScale(4),
  },
  maxLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(16),
  },
  maxLevelText: {
    fontSize: fontScale(14),
    color: '#6E543C',
    fontWeight: '600',
    marginLeft: horizontalScale(8),
  },
  redeemButton: {
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
  },
  redeemButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  missionsSection: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: fontScale(20),
    fontWeight: '600',
    color: '#333333',
    marginBottom: verticalScale(16),
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
  },
  missionIcon: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionInfo: {
    flex: 1,
    marginLeft: horizontalScale(12),
  },
  missionTitle: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#333333',
  },
  missionPoints: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginTop: verticalScale(4),
  },
  missionStatus: {
    marginLeft: horizontalScale(12),
  },
  claimButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
  },
  claimButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  claimButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#999999',
  },
  progressPercentage: {
    fontSize: fontScale(12),
    color: '#666666',
    marginTop: verticalScale(4),
  },
  countdownText: {
    color: '#FF6B6B',
    fontSize: fontScale(13),
    marginTop: verticalScale(2),
    fontWeight: '600',
  },
  readyText: {
    color: '#4CAF50',
    fontSize: fontScale(13),
    marginTop: verticalScale(2),
    fontWeight: '600',
  },
  availableText: {
    color: '#2196F3',
    fontSize: fontScale(13),
    marginTop: verticalScale(2),
    fontWeight: '600',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  pageInfo: {
    fontSize: fontScale(12),
    color: '#888888',
    fontWeight: '500',
  },
  bonusHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bonusInfo: {
    flex: 1,
    marginRight: horizontalScale(12),
  },
  bonusType: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: '#6E543C',
    marginBottom: verticalScale(4),
  },
  bonusNote: {
    fontSize: fontScale(13),
    color: '#888888',
    marginBottom: verticalScale(2),
  },
  bonusDate: {
    fontSize: fontScale(11),
    color: '#AAAAAA',
  },
  bonusPoints: {
    alignItems: 'flex-end',
  },
  bonusPointsText: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: verticalScale(2),
  },
  bonusStatus: {
    fontSize: fontScale(10),
    color: '#4CAF50',
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paginationButtonDisabled: {
    backgroundColor: '#F9F9F9',
    borderColor: '#F0F0F0',
  },
  paginationButtonText: {
    color: '#6E543C',
    fontSize: fontScale(14),
    fontWeight: '600',
    marginHorizontal: horizontalScale(4),
  },
  paginationButtonTextDisabled: {
    color: '#CCCCCC',
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumberButton: {
    width: horizontalScale(36),
    height: verticalScale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: horizontalScale(4),
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pageNumberButtonActive: {
    backgroundColor: '#6E543C',
    borderColor: '#6E543C',
  },
  pageNumberText: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#6E543C',
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
  },
  loadingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  loadingText: {
    color: '#6E543C',
    fontSize: fontScale(14),
    marginLeft: horizontalScale(8),
  },
  totalItemsText: {
    textAlign: 'center',
    color: '#888888',
    fontSize: fontScale(12),
    marginTop: verticalScale(12),
    fontStyle: 'italic',
  },
}); 