import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';

export default function Rewards() {
  const router = useRouter();

  const missions = [
    {
      id: '1',
      title: 'First Purchase',
      points: 50,
      completed: true,
      icon: 'shopping-cart',
    },
    {
      id: '2',
      title: 'Share on Social Media',
      points: 100,
      completed: false,
      icon: 'share',
    },
    {
      id: '3',
      title: 'Visit 5 Different Cafes',
      points: 200,
      completed: false,
      icon: 'place',
    },
    {
      id: '4',
      title: 'Write 3 Reviews',
      points: 150,
      completed: false,
      icon: 'rate-review',
    },
  ];

  const handleRedeemPoints = () => {
    router.push('/pages/mission-complete/mission-complete');
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
          <Text style={styles.pointsValue}>350</Text>
          <TouchableOpacity 
            style={styles.redeemButton}
            onPress={handleRedeemPoints}
          >
            <Text style={styles.redeemButtonText}>Redeem Points</Text>
          </TouchableOpacity>
        </View>

        {/* Missions */}
        <View style={styles.missionsSection}>
          <Text style={styles.sectionTitle}>Available Missions</Text>
          {missions.map(mission => (
            <View key={mission.id} style={styles.missionCard}>
              <View style={styles.missionIcon}>
                <MaterialIcons 
                  name={mission.icon} 
                  size={24} 
                  color={mission.completed ? '#4CAF50' : '#6E543C'} 
                />
              </View>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionPoints}>+{mission.points} points</Text>
              </View>
              <View style={[
                styles.missionStatus,
                mission.completed && styles.missionCompleted
              ]}>
                <MaterialIcons 
                  name={mission.completed ? 'check-circle' : 'radio-button-unchecked'} 
                  size={24} 
                  color={mission.completed ? '#4CAF50' : '#999999'} 
                />
              </View>
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
  redeemButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
  },
  redeemButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#6E543C',
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
  missionCompleted: {
    opacity: 0.5,
  },
}); 