import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function OrderTypeSelection() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { cafeId } = params;

  const handleTableSelection = () => {
    router.push({
      pathname: 'pages/order/table-booking' as any,
      params: { cafeId }
    });
  };

  const handleDrinkSelection = () => {
    router.push({
      pathname: 'pages/order/drink-order' as any,
      params: { cafeId }
    });
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
        <Text style={styles.headerTitle}>Order Selection</Text>
        <View style={styles.backButton} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>You want to order...?</Text>
        </View>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleTableSelection}
          >
            <View style={styles.optionIconContainer}>
              <MaterialIcons name="restaurant" size={48} color="#6E543C" />
            </View>
            <Text style={styles.optionText}>Table</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleDrinkSelection}
          >
            <View style={styles.optionIconContainer}>
              <MaterialIcons name="local-cafe" size={48} color="#6E543C" />
            </View>
            <Text style={styles.optionText}>Drink</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/images/Logo2.png')}
            style={styles.cafeImage}
            resizeMode="contain"
          />
        </View>
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
    justifyContent: 'space-between',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: moderateScale(8),
    width: horizontalScale(40),
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
    justifyContent: 'space-between',
  },
  promptContainer: {
    alignItems: 'center',
    marginTop: verticalScale(32),
  },
  promptText: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: verticalScale(48),
  },
  optionButton: {
    alignItems: 'center',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    backgroundColor: '#F8F5F2',
    width: horizontalScale(140),
    height: verticalScale(160),
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  optionIconContainer: {
    width: horizontalScale(80),
    height: verticalScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  optionText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: verticalScale(48),
  },
  cafeImage: {
    width: horizontalScale(350),
    height: verticalScale(250),
    opacity: 1,
  },
}); 