import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function Congrats() {
  const router = useRouter();

  const handleCollect = () => {
    router.push('/pages/rewards/rewards');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../../assets/images/coinbackground.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Thank you for your purchase</Text>
        
        <View style={styles.rewardBox}>
          <MaterialIcons name="stars" size={30} color="#FFD700" />
          <Text style={styles.rewardText}>+50 Points Added!</Text>
        </View>

        <TouchableOpacity 
          style={styles.collectButton}
          onPress={handleCollect}
        >
          <Text style={styles.collectButtonText}>Collect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  title: {
    fontSize: fontScale(28),
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: verticalScale(20),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontScale(18),
    color: '#666666',
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(30),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardText: {
    fontSize: fontScale(20),
    fontWeight: '600',
    color: '#6E543C',
    marginLeft: horizontalScale(10),
  },
  collectButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(40),
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(40),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectButtonText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 