import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function MissionComplete() {
  const router = useRouter();
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/coinbackground.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <Animated.View 
        style={[
          styles.content,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Image 
          source={require('../../../assets/images/trophy.png')}
          style={styles.trophyImage}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>You've reached 350 points!</Text>
        
        <View style={styles.rewardBox}>
          <MaterialIcons name="stars" size={30} color="#FFD700" />
          <Text style={styles.rewardText}>Silver Member Achieved!</Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Your New Benefits:</Text>
          <View style={styles.benefitItem}>
            <MaterialIcons name="local-offer" size={24} color="#6E543C" />
            <Text style={styles.benefitText}>10% discount on all orders</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="card-giftcard" size={24} color="#6E543C" />
            <Text style={styles.benefitText}>Free drink on your birthday</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="loyalty" size={24} color="#6E543C" />
            <Text style={styles.benefitText}>2x points on weekend orders</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  trophyImage: {
    width: horizontalScale(200),
    height: verticalScale(200),
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: fontScale(32),
    fontWeight: '700',
    color: '#6E543C',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontScale(20),
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
  benefitsContainer: {
    width: '100%',
    marginTop: verticalScale(30),
    padding: moderateScale(20),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitsTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#333333',
    marginBottom: verticalScale(15),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  benefitText: {
    fontSize: fontScale(16),
    color: '#666666',
    marginLeft: horizontalScale(10),
  },
  continueButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(40),
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(40),
  },
  continueButtonText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 