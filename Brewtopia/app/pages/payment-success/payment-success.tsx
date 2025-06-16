import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { withAuth } from '../../components/withAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';

function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const updatePremiumStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const userDataStr = await AsyncStorage.getItem('user_data');
        let accStatus = 'Premium';
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData.role === 'admin') accStatus = 'VIP';
        }
        if (userId) {
          await ApiService.user.updateUser(userId, { AccStatus: accStatus });
          // Cập nhật lại user_data trong AsyncStorage nếu muốn
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            userData.AccStatus = accStatus;
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Cập nhật AccStatus thất bại:', error);
      }
    };
    updatePremiumStatus();
  }, []);

  const handleContinue = () => {
    router.replace('/pages/home/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="check-circle" size={80} color="#6E543C" />
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.message}>
          Thank you for your payment. Your transaction has been completed successfully.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: moderateScale(24),
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#6E543C',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
  },
  message: {
    fontSize: fontScale(16),
    color: '#666666',
    textAlign: 'center',
    marginBottom: verticalScale(32),
    lineHeight: verticalScale(24),
  },
  button: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(32),
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default withAuth(PaymentSuccess); 