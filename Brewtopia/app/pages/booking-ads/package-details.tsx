import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import ApiService from '../../utils/ApiService';

interface Upgrade {
  id: number;
  name: string;
  price: number;
}

interface SelectedUpgrades {
  impressions: Upgrade | null;
  format: Upgrade | null;
  reporting: Upgrade | null;
}

export default function PackageDetails() {
  const router = useRouter();
  const { packageId } = useLocalSearchParams();
  const [selectedUpgrades, setSelectedUpgrades] = useState<SelectedUpgrades>({
    impressions: null,
    format: null,
    reporting: null
  });
  const [total, setTotal] = useState(0);

  const packages = {
    1: {
      name: 'Gói hiển thị',
      basePrice: 390000,
      description: 'Cam kết tối thiểu 15.000 lượt hiển thị/tháng, báo cáo hàng tuần về lượt hiển thị, lượt nhấp và thời gian tương tác.',
      features: [
        'Banner (tĩnh hoặc động) xuất hiện ở vị trí ưu tiên: mục "Ưu đãi & Khám phá" và trang giới thiệu đối tác.',
        'Nút CTA tích hợp dẫn khách đến trang đích cá nhân hóa.'
      ],
      upgrades: {
        impressions: [
          { id: 1, name: '+5.000 lượt hiển thị', price: 100000 },
          { id: 2, name: '+8.000 lượt hiển thị', price: 180000 },
          { id: 3, name: '+15.000 lượt hiển thị', price: 400000 }
        ],
        format: [
          { id: 1, name: 'Banner video ngắn', price: 150000 },
          { id: 2, name: 'Banner động nâng cao', price: 250000 },
          { id: 3, name: 'Banner tương tác (ảnh & video)', price: 350000 }
        ],
        reporting: [
          { id: 1, name: 'Báo cáo heatmap & thời gian xem TB', price: 100000 },
          { id: 2, name: 'Phân tích hành vi khách hàng', price: 200000 },
          { id: 3, name: 'Dashboard realtime', price: 300000 }
        ]
      }
    },
    2: {
      name: 'Gói tương tác',
      basePrice: 780000,
      description: 'Cam kết 1.500 lượt nhấp/tháng, báo cáo chi tiết hàng tuần về lượt nhấp và hành vi sau nhấp.',
      features: [
        'Quảng cáo xuất hiện trên trang chủ, bản đồ, trang đặt bàn/sản phẩm.',
        'Vị trí "Đề xuất nổi bật" khi khách tìm kiếm theo khu vực.'
      ],
      upgrades: {
        impressions: [
          { id: 1, name: '+500 lượt nhấp', price: 200000 },
          { id: 2, name: '+750 lượt nhấp', price: 350000 },
          { id: 3, name: '+1.000 lượt nhấp', price: 500000 }
        ],
        format: [
          { id: 1, name: 'Hình ảnh tương tác cao', price: 150000 },
          { id: 2, name: 'Video ngắn', price: 250000 },
          { id: 3, name: 'Kết hợp ảnh & video', price: 350000 }
        ],
        reporting: [
          { id: 1, name: 'Báo cáo chuyển đổi chi tiết', price: 150000 },
          { id: 2, name: 'Phân tích hành vi sau nhấp', price: 250000 },
          { id: 3, name: 'Dashboard realtime', price: 350000 }
        ]
      }
    },
    3: {
      name: 'Gói chuyển đổi',
      basePrice: 1560000,
      description: 'Tính phí theo hành động với cam kết tối đa 300 hành động/tháng.',
      features: [
        'Quảng cáo xuất hiện trên trang chủ, trang đặt bàn, trang thanh toán và chi tiết sản phẩm/dịch vụ.',
        'Tích hợp mã giảm giá độc quyền và thông báo nhắc khách hoàn tất giao dịch.',
        'Báo cáo chi tiết theo loại hành động.'
      ],
      upgrades: {
        impressions: [
          { id: 1, name: '+100 hành động', price: 300000 },
          { id: 2, name: '+200 hành động', price: 500000 },
          { id: 3, name: '+300 hành động', price: 700000 }
        ],
        format: [
          { id: 1, name: 'Email remarketing', price: 200000 },
          { id: 2, name: 'SMS remarketing', price: 300000 },
          { id: 3, name: 'Email & SMS remarketing', price: 400000 }
        ],
        reporting: [
          { id: 1, name: 'Phân tích hành vi khách hàng', price: 200000 },
          { id: 2, name: 'Dashboard nâng cao', price: 300000 },
          { id: 3, name: 'Phân tích realtime', price: 400000 }
        ]
      }
    },
    4: {
      name: 'Gói độc quyền',
      basePrice: 3500000,
      description: 'Giải pháp cao cấp cho cả doanh nghiệp F&B và ngoài F&B.',
      features: [
        'Vị trí ưu tiên trên tất cả các trang chính.',
        'Hỗ trợ CPM, CPC, CPA linh hoạt.',
        'Thông báo đẩy và A/B testing.',
        'Tích hợp mạng xã hội.'
      ],
      upgrades: {
        impressions: [
          { id: 1, name: 'Kênh Google Ads', price: 1000000 },
          { id: 2, name: 'Kênh LinkedIn', price: 1500000 },
          { id: 3, name: 'Google Ads & LinkedIn', price: 2000000 }
        ],
        format: [
          { id: 1, name: 'Báo cáo CRM cơ bản', price: 700000 },
          { id: 2, name: 'Báo cáo CRM nâng cao', price: 1000000 },
          { id: 3, name: 'Dashboard realtime', price: 1300000 }
        ],
        reporting: [
          { id: 1, name: 'A/B testing cơ bản', price: 500000 },
          { id: 2, name: 'A/B testing nâng cao', price: 800000 },
          { id: 3, name: 'Tối ưu hóa bằng ML', price: 1200000 }
        ]
      }
    }
  };

  const selectedPackage = packages[packageId as keyof typeof packages];

  const handleUpgradeSelect = (category: keyof SelectedUpgrades, option: Upgrade) => {
    setSelectedUpgrades(prev => ({
      ...prev,
      [category]: prev[category]?.id === option.id ? null : option
    }));

    // Calculate new total
    const newTotal = selectedPackage.basePrice + 
      Object.values(selectedUpgrades).reduce((sum: number, upgrade: Upgrade | null) => {
        return sum + (upgrade?.price || 0);
      }, 0);
    
    setTotal(newTotal);
  };

  const handlePay = async () => {
    try {
      const checkoutUrl = await ApiService.payment.createPayosPayment(
        total,
        `${selectedPackage.name} - ${Object.values(selectedUpgrades)
          .filter((upgrade): upgrade is Upgrade => upgrade !== null)
          .map(upgrade => upgrade.name)
          .join(', ')}`
      );

      router.push({
        pathname: '/pages/payment/payment',
        params: { url: checkoutUrl }
      });
    } catch (error) {
      console.error('Payment creation failed:', error);
      // Handle error appropriately
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedPackage.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>BẢNG GIÁ</Text>
          
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>MÔ TẢ</Text>
            <Text style={styles.descriptionText}>{selectedPackage.description}</Text>
            {selectedPackage.features.map((feature, index) => (
              <Text key={index} style={styles.featureText}>• {feature}</Text>
            ))}
          </View>

          <View style={styles.upgradesSection}>
            <Text style={styles.upgradeTitle}>Nâng cấp lượt hiển thị</Text>
            {selectedPackage.upgrades.impressions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.upgradeOption,
                  selectedUpgrades.impressions?.id === option.id && styles.selectedUpgrade
                ]}
                onPress={() => handleUpgradeSelect('impressions', option)}
              >
                <MaterialIcons 
                  name={selectedUpgrades.impressions?.id === option.id ? "check-circle" : "add-circle-outline"} 
                  size={24} 
                  color="#6E543C" 
                />
                <Text style={styles.upgradeText}>{option.name} - {option.price.toLocaleString()} VNĐ/tháng</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.upgradeTitle}>Nâng cấp định dạng banner</Text>
            {selectedPackage.upgrades.format.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.upgradeOption,
                  selectedUpgrades.format?.id === option.id && styles.selectedUpgrade
                ]}
                onPress={() => handleUpgradeSelect('format', option)}
              >
                <MaterialIcons 
                  name={selectedUpgrades.format?.id === option.id ? "check-circle" : "add-circle-outline"} 
                  size={24} 
                  color="#6E543C" 
                />
                <Text style={styles.upgradeText}>{option.name} - {option.price.toLocaleString()} VNĐ/tháng</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.upgradeTitle}>Nâng cấp báo cáo chuyên sâu</Text>
            {selectedPackage.upgrades.reporting.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.upgradeOption,
                  selectedUpgrades.reporting?.id === option.id && styles.selectedUpgrade
                ]}
                onPress={() => handleUpgradeSelect('reporting', option)}
              >
                <MaterialIcons 
                  name={selectedUpgrades.reporting?.id === option.id ? "check-circle" : "add-circle-outline"} 
                  size={24} 
                  color="#6E543C" 
                />
                <Text style={styles.upgradeText}>{option.name} - {option.price.toLocaleString()} VNĐ/tháng</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalText}>TỔNG: {total.toLocaleString()} VNĐ</Text>
            <TouchableOpacity style={styles.payButton} onPress={handlePay}>
              <Text style={styles.payButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceTitle: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  descriptionBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  descriptionTitle: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FF0000',
    marginBottom: verticalScale(8),
  },
  descriptionText: {
    fontSize: fontScale(14),
    color: '#000000',
    marginBottom: verticalScale(8),
  },
  featureText: {
    fontSize: fontScale(14),
    color: '#000000',
    marginBottom: verticalScale(4),
  },
  upgradesSection: {
    marginBottom: verticalScale(16),
  },
  upgradeTitle: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(8),
  },
  upgradeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(8),
  },
  selectedUpgrade: {
    backgroundColor: '#F5F5F5',
    borderColor: '#6E543C',
  },
  upgradeText: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginLeft: horizontalScale(8),
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: verticalScale(16),
    marginTop: verticalScale(16),
  },
  totalText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  payButton: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 