import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import ApiService from '../../utils/ApiService';

interface PayOSResponse {
  paymentUrl: string;
  // Add other fields if needed
}

export default function Premium() {
  const router = useRouter();
  const monthlyPrice = '2000'; // Price in VND

  const handleSubscribe = async () => {
    try {
      // Create PayOS payment
      const checkoutUrl = await ApiService.payment.createPayosPayment(
        parseInt(monthlyPrice),
        'Premium Subscription - 1 Month'
      );

      // Navigate to payment page with checkoutUrl
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
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

      {/* Plan Info */}
      <View style={styles.planInfoContainer}>
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Monthly Plan</Text>
          <Text style={styles.planPrice}>{monthlyPrice} VNĐ<Text style={styles.perMonth}>/month</Text></Text>
          <View style={styles.benefitRow}>
            <MaterialIcons name="check-circle" size={20} color="#6E543C" />
            <Text style={styles.benefitText}>Ad-Free Experience</Text>
          </View>
          <View style={styles.benefitRow}>
            <MaterialIcons name="check-circle" size={20} color="#6E543C" />
            <Text style={styles.benefitText}>Premium Features Access</Text>
          </View>
          <View style={styles.benefitRow}>
            <MaterialIcons name="check-circle" size={20} color="#6E543C" />
            <Text style={styles.benefitText}>Priority Customer Support</Text>
          </View>
        </View>
      </View>

      {/* Add to Order Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleSubscribe}
      >
        <MaterialIcons name="add-shopping-cart" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Subscribe Now</Text>
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
    height: verticalScale(200),
    marginBottom: verticalScale(24),
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: fontScale(22),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: verticalScale(32),
  },
  planInfoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  planCard: {
    backgroundColor: '#F5F1ED',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  planTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(8),
  },
  planPrice: {
    fontSize: fontScale(28),
    fontWeight: '700',
    color: '#000',
    marginBottom: verticalScale(16),
  },
  perMonth: {
    fontSize: fontScale(16),
    fontWeight: '400',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    width: '100%',
  },
  benefitText: {
    fontSize: fontScale(16),
    color: '#333',
    marginLeft: horizontalScale(8),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6E543C',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
  },
  addButtonText: {
    color: '#FFF',
    fontSize: fontScale(16),
    fontWeight: '600',
    marginLeft: horizontalScale(8),
  },
}); 