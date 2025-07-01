import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import { getBonusList, claimDailyBonus, claimTaskBonus, claimEventBonus, claimReferralBonus } from '../../services/pointService';

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
  const [dailyCountdown, setDailyCountdown] = useState<string>('');
  const [lastKnownLevel, setLastKnownLevel] = useState<string>('');
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

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
      acc[m.id] = bonusList.some(b => b.type === 'daily' && b.status === 'active' && new Date().toDateString() === new Date(b.createdAt).toDateString());
    } else {
      acc[m.id] = bonusList.some(b => b.type === m.id && b.status === 'active');
    }
    return acc;
  }, {} as Record<string, boolean>);

  // Tính thời gian còn lại cho daily
  useEffect(() => {
    const dailyBonus = bonusList.find(b => b.type === 'daily' && b.status === 'active' && new Date().toDateString() === new Date(b.createdAt).toDateString());
    if (dailyBonus) {
      const now = new Date();
      const claimedAt = new Date(dailyBonus.createdAt);
      const nextClaim = new Date(claimedAt.getTime() + 24 * 60 * 60 * 1000);
      const updateCountdown = () => {
        const diff = nextClaim.getTime() - Date.now();
        if (diff <= 0) {
          setDailyCountdown('');
          if (countdownInterval.current) clearInterval(countdownInterval.current);
        } else {
          const minutes = Math.floor(diff / 60000) % 60;
          const hours = Math.floor(diff / (60 * 60000));
          setDailyCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        }
      };
      updateCountdown();
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      countdownInterval.current = setInterval(updateCountdown, 1000 * 30); // cập nhật mỗi 30s
      return () => { if (countdownInterval.current) clearInterval(countdownInterval.current); };
    } else {
      setDailyCountdown('');
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    }
  }, [bonusList]);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await getBonusList();
        if (Array.isArray(res)) {
          setBonusList(res);
          const total = res.filter((b: any) => b.status === 'active').reduce((sum: number, b: any) => sum + (b.points || 0), 0);
          
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
        }
      } catch {}
    };
    fetchPoints();
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
      // Reload bonus list và điểm
      const bonusRes = await getBonusList();
      if (Array.isArray(bonusRes)) {
        setBonusList(bonusRes);
        const total = bonusRes.filter((b: any) => b.status === 'active').reduce((sum: number, b: any) => sum + (b.points || 0), 0);
        setRewardPoints(total);
      }
    } catch (err: any) {
      if (mission.id === 'daily' && err?.message?.includes('24 giờ')) {
        Alert.alert('Thông báo', 'Bạn cần đợi 24 giờ mới có thể nhận lại điểm danh hằng ngày!');
      } else {
        Alert.alert('Lỗi', err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
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
        <Text style={styles.headerTitle}>My Rewards</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Points Summary */}
        <View style={styles.pointsCard}>
          <Image 
            source={require('../../../assets/images/coinbackground.png')}
            style={styles.pointsBackground}
            resizeMode="cover"
          />
          <Text style={styles.pointsTitle}>Total Points</Text>
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
              <Text style={styles.membershipTitle}>Membership Level</Text>
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
          <Text style={styles.sectionTitle}>Available Missions</Text>
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
                {/* Nếu là daily và đã claim thì hiển thị countdown */}
                {mission.id === 'daily' && claimedMissions['daily'] && dailyCountdown && (
                  <Text style={{color:'#888',fontSize:13,marginTop:2}}>Có thể nhận lại sau: {dailyCountdown}</Text>
                )}
              </View>
              <View style={styles.missionStatus}>
                {claimedMissions[mission.id] ? (
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                ) : (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => handleClaim(mission)}
                    disabled={claiming === mission.id}
                  >
                    <Text style={styles.claimButtonText}>{claiming === mission.id ? 'Đang nhận...' : 'Claim'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Danh sách điểm thưởng */}
        <View style={{marginTop: 24}}>
          <Text style={styles.sectionTitle}>Lịch sử điểm thưởng</Text>
          {bonusList.length === 0 && <Text style={{color:'#888'}}>Chưa có điểm thưởng nào</Text>}
          {bonusList.map((bonus, idx) => (
            <View key={idx} style={{backgroundColor:'#fff',borderRadius:8,padding:12,marginBottom:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
              <View>
                <Text style={{fontWeight:'bold',color:'#6E543C'}}>{bonus.type === 'daily' ? 'Điểm danh' : bonus.type === 'event' ? 'Sự kiện' : bonus.type === 'referral' ? 'Mời bạn bè' : bonus.type === 'admin' ? 'Admin' : 'Nhiệm vụ'}</Text>
                <Text style={{color:'#888',fontSize:12}}>{bonus.note}</Text>
                <Text style={{color:'#aaa',fontSize:11}}>{new Date(bonus.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={{fontWeight:'bold',color:'#FFD700',fontSize:18}}>+{bonus.points}</Text>
            </View>
          ))}
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
  progressPercentage: {
    fontSize: fontScale(12),
    color: '#666666',
    marginTop: verticalScale(4),
  },
}); 