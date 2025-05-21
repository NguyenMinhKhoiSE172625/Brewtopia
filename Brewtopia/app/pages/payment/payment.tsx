import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import PaymentWebView from '../../components/PaymentWebView';
import { withAuth } from '../../components/withAuth';

function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const checkoutUrl = params.url as string;

  useEffect(() => {
    if (!checkoutUrl) {
      router.back();
    }
  }, [checkoutUrl]);

  const handleNavigationStateChange = (navState: any) => {
    // Handle payment completion or cancellation
    if (navState.url.includes('status=PAID') || navState.url.includes('payment-success')) {
      // Payment successful
      Alert.alert(
        'Payment Successful',
        'Thank you for your payment. Your premium subscription has been activated.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/pages/payment-success/payment-success')
          }
        ]
      );
    } else if (navState.url.includes('cancel=true') || navState.url.includes('status=CANCELLED')) {
      // Payment cancelled
      Alert.alert(
        'Payment Cancelled',
        'Your payment has been cancelled. You can try again when you are ready.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  if (!checkoutUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E543C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PaymentWebView 
        url={checkoutUrl}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default withAuth(Payment); 