import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';

export default function BookingAds() {
  const router = useRouter();
  const [isVIP, setIsVIP] = useState(false);

  useEffect(() => {
    const checkVIPStatus = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setIsVIP(user.AccStatus === 'VIP');
      }
    };
    checkVIPStatus();
  }, []);

  const handleUpgradeToVIP = async () => {
    try {
      const checkoutUrl = await ApiService.payment.createPayosPayment(
        2000, // Giá nâng cấp VIP
        'Upgrade to VIP',
        'UpgradeVIP' // targetModel cho doanh nghiệp
      );
      router.push({
        pathname: '/pages/payment/payment',
        params: { url: checkoutUrl }
      });
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  };

  const packages = [
    {
      id: 1,
      name: 'Gói hiển thị',
      price: '390.000',
      description: 'Cam kết tối thiểu 15.000 lượt hiển thị/tháng, báo cáo hàng tuần về lượt hiển thị, lượt nhấp và thời gian tương tác.',
      features: [
        'Banner (tĩnh hoặc động) xuất hiện ở vị trí ưu tiên: mục "Ưu đãi & Khám phá" và trang giới thiệu đối tác.',
        'Nút CTA tích hợp dẫn khách đến trang đích cá nhân hóa.'
      ]
    },
    {
      id: 2,
      name: 'Gói tương tác',
      price: '780.000',
      description: 'Cam kết 1.500 lượt nhấp/tháng, báo cáo chi tiết hàng tuần về lượt nhấp và hành vi sau nhấp.',
      features: [
        'Quảng cáo xuất hiện trên trang chủ, bản đồ, trang đặt bàn/sản phẩm.',
        'Vị trí "Đề xuất nổi bật" khi khách tìm kiếm theo khu vực.'
      ]
    },
    {
      id: 3,
      name: 'Gói chuyển đổi',
      price: '1.560.000',
      description: 'Tính phí theo hành động với cam kết tối đa 300 hành động/tháng (~4.200-4.300đ/hành động).',
      features: [
        'Quảng cáo xuất hiện trên trang chủ, trang đặt bàn, trang thanh toán và chi tiết sản phẩm/dịch vụ.',
        'Tích hợp mã giảm giá độc quyền và thông báo nhắc khách hoàn tất giao dịch.',
        'Báo cáo chi tiết theo loại hành động.'
      ]
    },
    {
      id: 4,
      name: 'Gói độc quyền',
      price: '3.500.000',
      description: 'Có 2 phiên bản: "Độc quyền Plus" cho ngành F&B và "Độc quyền Pro" cho doanh nghiệp ngoài F&B.',
      features: [
        'Vị trí ưu tiên trên trang chủ, bản đồ, trang tin tức và màn hình chờ khi khách đặt/thanh toán.',
        'Hỗ trợ linh hoạt CPM, CPC và CPA.',
        'Tích hợp thông báo đẩy và công cụ A/B testing cơ bản.',
        'Quảng cáo trên kênh mạng xã hội của Brewtopia (Facebook, Instagram, TikTok).'
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gói quảng cáo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Image 
          source={require('../../../assets/images/Logo2.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {isVIP ? (
          packages.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packagePrice}>{pkg.price} VNĐ</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push({
                  pathname: '/pages/booking-ads/package-details',
                  params: { packageId: pkg.id }
                })}
              >
                <Text style={styles.exploreButtonText}>Khám phá</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>Upgrade to VIP to book ads</Text>
            <Text style={styles.upgradePrice}>Chỉ 2.000đ/tháng</Text>
            <View style={styles.benefitList}>
              <Text style={styles.benefitItem}>• Được phép đặt quảng cáo trên hệ thống</Text>
              <Text style={styles.benefitItem}>• Ưu tiên hỗ trợ doanh nghiệp</Text>
              <Text style={styles.benefitItem}>• Nhận các quyền lợi VIP khác trong tương lai</Text>
            </View>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={handleUpgradeToVIP}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to VIP</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomBar />
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
    justifyContent: 'space-between',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  content: {
    flex: 1,
    padding: moderateScale(16),
  },
  logo: {
    width: '100%',
    height: verticalScale(100),
    marginBottom: verticalScale(20),
  },
  packageCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  packageName: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  packagePrice: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#6E543C',
  },
  exploreButton: {
    backgroundColor: '#FF0000',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
  },
  exploreButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upgradeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(16),
  },
  upgradePrice: {
    fontSize: fontScale(16),
    color: '#FF0000',
    fontWeight: '700',
    marginBottom: verticalScale(8),
  },
  benefitList: {
    marginBottom: verticalScale(16),
    alignSelf: 'flex-start',
  },
  benefitItem: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginBottom: 2,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
  },
  upgradeButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#000',
  },
}); 