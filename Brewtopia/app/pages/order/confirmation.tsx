import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function OrderConfirmation() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { cafeId } = params;
  
  const handleSubmit = () => {
    // Navigate back to the nearby map
    router.push('pages/nearby' as any);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.successTitle}>Thanh toán thành công!</Text>
        <Text style={styles.successMessage}>Đơn hàng của bạn đã được ghi nhận.</Text>
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Mã đơn: #12345</Text>
          <Text style={styles.orderDate}>26/03/2023 | 10:30</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.announcementContainer}>
          <View style={styles.announcementHeader}>
            <MaterialIcons name="warning" size={24} color="#F57C00" />
            <Text style={styles.announcementTitle}>Lưu ý quan trọng</Text>
          </View>
          
          <Text style={styles.announcementText}>
            Nếu bạn đến muộn hơn 5 phút so với giờ hẹn, đồ uống vẫn sẽ được giữ đến hết ca, nhưng chất lượng có thể không đảm bảo như mong đợi. Bạn sẽ tự chịu trách nhiệm với các vấn đề phát sinh.
          </Text>
        </View>
        
        <View style={styles.cafeInfoContainer}>
          <Image 
            source={require('../../../assets/images/iconcafe.png')}
            style={styles.cafeIcon}
            resizeMode="contain"
          />
          <View style={styles.cafeInfo}>
            <Text style={styles.cafeName}>COFFEE SHOP 1</Text>
            <Text style={styles.cafeAddress}>ABC St, WCD District, City A</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Tôi đã hiểu</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: moderateScale(24),
    alignItems: 'center',
  },
  successIconContainer: {
    marginTop: verticalScale(32),
    marginBottom: verticalScale(16),
  },
  successTitle: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#333333',
    marginBottom: verticalScale(8),
  },
  successMessage: {
    fontSize: fontScale(16),
    color: '#666666',
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  orderNumber: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(4),
  },
  orderDate: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: verticalScale(24),
  },
  announcementContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: verticalScale(24),
    width: '100%',
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  announcementTitle: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: horizontalScale(8),
  },
  announcementText: {
    fontSize: fontScale(14),
    color: '#333333',
    lineHeight: verticalScale(20),
  },
  cafeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    width: '100%',
    marginBottom: verticalScale(32),
  },
  cafeIcon: {
    width: horizontalScale(40),
    height: verticalScale(40),
    marginRight: horizontalScale(16),
  },
  cafeInfo: {
    flex: 1,
  },
  cafeName: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#333333',
    marginBottom: verticalScale(4),
  },
  cafeAddress: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  submitButton: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(32),
    alignItems: 'center',
    marginTop: 'auto',
    width: '100%',
  },
  submitButtonText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 