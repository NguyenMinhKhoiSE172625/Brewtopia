import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { useState } from 'react';

export default function Premium() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('1');

  const plans = [
    { id: '1', months: 1, price: '2.99' },
    { id: '3', months: 3, price: '7.99' },
    { id: '6', months: 6, price: '14.99' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.productsButton}
          onPress={() => console.log('Products')}
        >
          <MaterialIcons name="shopping-bag" size={24} color="#000" />
          <Text style={styles.productsText}>Products</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Badge */}
      <View style={styles.premiumBadge}>
        <MaterialIcons name="diamond" size={24} color="#FFD700" />
        <Text style={styles.premiumText}>Premium</Text>
      </View>

      {/* Main Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../../assets/images/Logo2.png')}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>BUY PREMIUM TO GET THE BEST FEATURES FROM OUR APP</Text>

      {/* Plan Selection */}
      <View style={styles.planContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planButton,
              selectedPlan === plan.id && styles.planButtonActive
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <Text style={[
              styles.planMonths,
              selectedPlan === plan.id && styles.planTextActive
            ]}>{plan.months} month</Text>
            <Text style={[
              styles.planPrice,
              selectedPlan === plan.id && styles.planTextActive
            ]}>{plan.price}$</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add to Order Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => console.log('Add to Order')}
      >
        <MaterialIcons name="add-shopping-cart" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Add to Order</Text>
      </TouchableOpacity>

      {/* Information Button */}
      <TouchableOpacity style={styles.infoButton}>
        <MaterialIcons name="info" size={24} color="#000" />
        <Text style={styles.infoButtonText}>Information</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: moderateScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  productsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
  },
  productsText: {
    marginLeft: horizontalScale(8),
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  premiumText: {
    marginLeft: horizontalScale(8),
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FFD700',
  },
  imageContainer: {
    width: '100%',
    height: verticalScale(300),
    marginBottom: verticalScale(24),
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: verticalScale(32),
  },
  planContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(32),
  },
  planButton: {
    backgroundColor: '#F5F5F5',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    width: '30%',
  },
  planButtonActive: {
    backgroundColor: '#6E543C',
  },
  planMonths: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#000',
    marginBottom: verticalScale(4),
  },
  planPrice: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#000',
  },
  planTextActive: {
    color: '#FFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6E543C',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
  },
  addButtonText: {
    color: '#FFF',
    fontSize: fontScale(16),
    fontWeight: '600',
    marginLeft: horizontalScale(8),
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
  },
  infoButtonText: {
    fontSize: fontScale(16),
    fontWeight: '500',
    marginLeft: horizontalScale(8),
  },
}); 