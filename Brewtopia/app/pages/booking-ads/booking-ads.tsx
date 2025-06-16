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
      name: 'Display Package',
      price: '15.96',
      description: 'Minimum commitment of 15,000 impressions/month, weekly reports on impressions, clicks and engagement time.',
      features: [
        'Banners (static or animated) appear in priority positions: "Deals & Discover" category and partner introduction page.',
        'Integrated CTA button leads visitors to a personalized landing page.'
      ]
    },
    {
      id: 2,
      name: 'Interactive Package',
      price: '31.96',
      description: '1,500 clicks/month commitment, detailed weekly reports on clicks and post-click traffic.',
      features: [
        'Ads appear on the homepage, map, and table reservation/product details page.',
        '"Featured recommendations" position when customers search by area.'
      ]
    },
    {
      id: 3,
      name: 'Conversion Package',
      price: '63.96',
      description: 'Charge per action with a maximum commitment of 300 actions/month (about 4.200-4.300 VND/action).',
      features: [
        'Ads appear on the homepage, table reservation page, payment page and product/service detail page.',
        'Integrate exclusive discount codes and push notifications to automatically remind customers to complete transactions.',
        'Detailed reports by action type.'
      ]
    },
    {
      id: 4,
      name: 'Exclusive Package',
      price: '143.96',
      description: 'There are 2 versions: "Exclusive Plus" for F&B industry and "Exclusive Pro" for non-F&B businesses.',
      features: [
        'Priority position on the homepage, map, news page and waiting screen when customers book/pay.',
        'Flexible support for combining CPM, CPC and CPA.',
        'Integrated push notification and basic A/B testing tools.',
        'Integrated advertising on Brewtopia\'s social media channels (Facebook, Instagram, TikTok).'
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advertising package</Text>
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
                <Text style={styles.packagePrice}>{pkg.price}$</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push({
                  pathname: '/pages/booking-ads/package-details',
                  params: { packageId: pkg.id }
                })}
              >
                <Text style={styles.exploreButtonText}>EXPLORE</Text>
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