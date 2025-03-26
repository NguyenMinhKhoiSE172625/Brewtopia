import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';

export default function PackageDetails() {
  const router = useRouter();
  const { packageId } = useLocalSearchParams();
  const [selectedUpgrades, setSelectedUpgrades] = useState({
    impressions: null,
    format: null,
    reporting: null
  });
  const [total, setTotal] = useState(0);

  const packages = {
    1: {
      name: 'Display Package',
      basePrice: 15.96,
      description: 'Minimum commitment of 15,000 impressions/month, weekly reports on impressions, clicks and engagement time.',
      features: [
        'Banners (static or animated) appear in priority positions: "Deals & Discover" category and partner introduction page.',
        'Integrated CTA button leads visitors to a personalized landing page.'
      ],
      upgrades: {
        impressions: [
          { id: 1, name: '+5,000 impressions', price: 4 },
          { id: 2, name: '+8,000 impressions', price: 7.25 },
          { id: 3, name: '+15,000 impressions', price: 25 }
        ],
        format: [
          { id: 1, name: 'Short video banner', price: 6 },
          { id: 2, name: 'Advanced animated banner', price: 10 },
          { id: 3, name: 'Interactive banner (image & video)', price: 14 }
        ],
        reporting: [
          { id: 1, name: 'Heatmap & avg. view time', price: 4 },
          { id: 2, name: 'Detailed customer behavior', price: 8 },
          { id: 3, name: 'Real-time dashboard', price: 12 }
        ]
      }
    },
    2: {
      name: 'Interactive Package',
      basePrice: 31.96,
      description: '1,500 clicks/month commitment, detailed weekly reports on clicks and post-click traffic.',
      features: [
        'Ads appear on the homepage, map, and table reservation/product details page.',
        '"Featured recommendations" position when customers search by area.'
      ],
      upgrades: {
        impressions: [
          { id: 1, name: '+500 clicks', price: 8 },
          { id: 2, name: '+750 clicks', price: 14 },
          { id: 3, name: '+1,000 clicks', price: 20 }
        ],
        format: [
          { id: 1, name: 'High-interaction images', price: 6 },
          { id: 2, name: 'Short video ads', price: 10 },
          { id: 3, name: 'Combined image & video', price: 14 }
        ],
        reporting: [
          { id: 1, name: 'Detailed conversion', price: 6 },
          { id: 2, name: 'Post-click behavior', price: 10 },
          { id: 3, name: 'Real-time dashboard', price: 14 }
        ]
      }
    },
    3: {
      name: 'Conversion Package',
      basePrice: 63.96,
      description: 'Charge per action with a maximum commitment of 300 actions/month.',
      features: [
        'Ads appear on the homepage, table reservation page, payment page and product/service detail page.',
        'Integrate exclusive discount codes and push notifications.',
        'Detailed reports by action type.'
      ],
      upgrades: {
        impressions: [
          { id: 1, name: '+100 actions', price: 12 },
          { id: 2, name: '+200 actions', price: 20 },
          { id: 3, name: '+300 actions', price: 28 }
        ],
        format: [
          { id: 1, name: 'Email remarketing', price: 8 },
          { id: 2, name: 'SMS remarketing', price: 12 },
          { id: 3, name: 'Email & SMS remarketing', price: 16 }
        ],
        reporting: [
          { id: 1, name: 'Customer behavior', price: 8 },
          { id: 2, name: 'Advanced dashboard', price: 12 },
          { id: 3, name: 'Real-time analysis', price: 16 }
        ]
      }
    },
    4: {
      name: 'Exclusive Package',
      basePrice: 143.96,
      description: 'Premium solution for both F&B and non-F&B businesses.',
      features: [
        'Priority position on all main pages.',
        'Flexible CPM, CPC, CPA support.',
        'Push notifications and A/B testing.',
        'Social media integration.'
      ],
      upgrades: {
        impressions: [
          { id: 1, name: 'Google Ads channel', price: 40 },
          { id: 2, name: 'LinkedIn channel', price: 60 },
          { id: 3, name: 'Google Ads & LinkedIn', price: 80 }
        ],
        format: [
          { id: 1, name: 'Basic CRM reports', price: 28 },
          { id: 2, name: 'Advanced CRM reports', price: 40 },
          { id: 3, name: 'Real-time dashboard', price: 52 }
        ],
        reporting: [
          { id: 1, name: 'Basic A/B testing', price: 20 },
          { id: 2, name: 'Advanced A/B testing', price: 32 },
          { id: 3, name: 'ML optimization', price: 48 }
        ]
      }
    }
  };

  const selectedPackage = packages[packageId as keyof typeof packages];

  const handleUpgradeSelect = (category: string, option: any) => {
    setSelectedUpgrades(prev => ({
      ...prev,
      [category]: prev[category]?.id === option.id ? null : option
    }));

    // Calculate new total
    const newTotal = selectedPackage.basePrice + 
      Object.values(selectedUpgrades).reduce((sum: number, upgrade: any) => {
        return sum + (upgrade?.price || 0);
      }, 0);
    
    setTotal(newTotal);
  };

  const handlePay = () => {
    // Handle payment logic
    console.log('Selected upgrades:', selectedUpgrades);
    console.log('Total:', total);
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
          <Text style={styles.priceTitle}>PRICE LIST</Text>
          
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>DESCRIPTION</Text>
            <Text style={styles.descriptionText}>{selectedPackage.description}</Text>
            {selectedPackage.features.map((feature, index) => (
              <Text key={index} style={styles.featureText}>• {feature}</Text>
            ))}
          </View>

          <View style={styles.upgradesSection}>
            <Text style={styles.upgradeTitle}>Upgrade additional impressions</Text>
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
                <Text style={styles.upgradeText}>{option.name} - ${option.price}/Month</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.upgradeTitle}>Upgrade interactive banner format</Text>
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
                <Text style={styles.upgradeText}>{option.name} - ${option.price}/Month</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.upgradeTitle}>Upgrade your in-depth reporting</Text>
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
                <Text style={styles.upgradeText}>{option.name} - ${option.price}/Month</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalText}>TOTAL: ${total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.payButton} onPress={handlePay}>
              <Text style={styles.payButtonText}>PAY</Text>
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