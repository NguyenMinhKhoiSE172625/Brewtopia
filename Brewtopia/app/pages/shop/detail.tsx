import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';
import CafeMenu from '../../components/CafeMenu';
import CafeEvents from '../../components/CafeEvents';
import CafeFeed from '../../components/CafeFeed';

interface ShopDetail {
  id: string;
  name: string;
  address: string;
  description: string;
  status: string;
  closingTime: string;
  rating: number;
  images: any[];
}

export default function ShopDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { shopId } = params;
  const [activeTab, setActiveTab] = useState('Menu');

  // Mock data for the shop detail
  // In a real app, you would fetch this data from an API based on shopId
  const shopData: ShopDetail = {
    id: shopId as string,
    name: 'COFFEE SHOP 1',
    address: 'ABC St, WCD District, City A',
    description: 'A cozy coffee shop with a wide selection of specialty coffees and a relaxing atmosphere.',
    status: 'Open',
    closingTime: '23:00',
    rating: 4.5,
    images: [
      require('../../../assets/images/cafe1.png'),
      require('../../../assets/images/cafe2.png'),
      require('../../../assets/images/cafe3.png'),
    ],
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Menu':
        return <CafeMenu cafeId={shopId as string} />;
      case 'Event':
        return <CafeEvents cafeId={shopId as string} />;
      case 'Feed':
        return <CafeFeed cafeId={shopId as string} />;
      default:
        return <CafeMenu cafeId={shopId as string} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{shopData.name}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-horiz" size={24} color="#6E543C" />
        </TouchableOpacity>
      </View>

      {/* Shop Image and Info */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.shopImageContainer}>
          <Image 
            source={shopData.images[0]} 
            style={styles.shopImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.shopInfoContainer}>
          <View style={styles.shopInfoHeader}>
            <Text style={styles.shopName}>{shopData.name}</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {shopData.status} - Closed at {shopData.closingTime}
              </Text>
            </View>
          </View>
          
          <Text style={styles.shopAddress}>{shopData.address}</Text>
          <Text style={styles.shopDescription}>{shopData.description}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Menu' && styles.activeTab]} 
            onPress={() => setActiveTab('Menu')}
          >
            <Text style={[styles.tabText, activeTab === 'Menu' && styles.activeTabText]}>Menu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Event' && styles.activeTab]} 
            onPress={() => setActiveTab('Event')}
          >
            <Text style={[styles.tabText, activeTab === 'Event' && styles.activeTabText]}>Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Feed' && styles.activeTab]} 
            onPress={() => setActiveTab('Feed')}
          >
            <Text style={[styles.tabText, activeTab === 'Feed' && styles.activeTabText]}>Feed</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
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
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: moderateScale(8),
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    flex: 1,
    textAlign: 'center',
  },
  moreButton: {
    padding: moderateScale(8),
  },
  shopImageContainer: {
    width: '100%',
    height: verticalScale(250),
  },
  shopImage: {
    width: '100%',
    height: '100%',
  },
  shopInfoContainer: {
    padding: moderateScale(16),
  },
  shopInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  shopName: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#000000',
    flex: 1,
  },
  statusContainer: {
    backgroundColor: '#F0F0F0',
    padding: moderateScale(6),
    borderRadius: moderateScale(4),
  },
  statusText: {
    fontSize: fontScale(12),
    color: '#6E543C',
  },
  shopAddress: {
    fontSize: fontScale(14),
    color: '#666666',
    marginBottom: verticalScale(8),
  },
  shopDescription: {
    fontSize: fontScale(14),
    color: '#333333',
    lineHeight: verticalScale(20),
    marginBottom: verticalScale(16),
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6E543C',
  },
  tabText: {
    fontSize: fontScale(16),
    color: '#999999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6E543C',
    fontWeight: '600',
  },
  tabContent: {
    padding: moderateScale(16),
    minHeight: verticalScale(400),
  },
}); 