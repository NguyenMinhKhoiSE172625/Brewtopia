import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function PaymentMethod() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { cafeId } = params;
  
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'momo' | 'bank' | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [voucher, setVoucher] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const creditCards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/24' },
    { id: 2, type: 'Mastercard', last4: '5678', expiry: '06/25' },
    { id: 3, type: 'American Express', last4: '0123', expiry: '09/23' }
  ];
  
  const handleSelectPaymentMethod = (method: 'credit_card' | 'momo' | 'bank') => {
    setPaymentMethod(method);
  };
  
  const handleSelectCard = (cardId: number) => {
    setSelectedCard(cardId);
  };
  
  const handlePlaceOrder = () => {
    // Show success modal
    setShowSuccessModal(true);
    
    // Navigate back to nearby screen after delay
    setTimeout(() => {
      setShowSuccessModal(false);
      router.push('pages/nearby' as any);
    }, 3000);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'credit_card' && styles.selectedPaymentOption
            ]}
            onPress={() => handleSelectPaymentMethod('credit_card')}
          >
            <FontAwesome name="credit-card" size={24} color={paymentMethod === 'credit_card' ? '#6E543C' : '#666666'} />
            <Text style={[
              styles.paymentOptionText,
              paymentMethod === 'credit_card' && styles.selectedPaymentOptionText
            ]}>Credit Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'momo' && styles.selectedPaymentOption
            ]}
            onPress={() => handleSelectPaymentMethod('momo')}
          >
            <MaterialCommunityIcons name="wallet-outline" size={24} color={paymentMethod === 'momo' ? '#6E543C' : '#666666'} />
            <Text style={[
              styles.paymentOptionText,
              paymentMethod === 'momo' && styles.selectedPaymentOptionText
            ]}>MoMo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'bank' && styles.selectedPaymentOption
            ]}
            onPress={() => handleSelectPaymentMethod('bank')}
          >
            <MaterialIcons name="account-balance" size={24} color={paymentMethod === 'bank' ? '#6E543C' : '#666666'} />
            <Text style={[
              styles.paymentOptionText,
              paymentMethod === 'bank' && styles.selectedPaymentOptionText
            ]}>Local Bank</Text>
          </TouchableOpacity>
        </View>
        
        {paymentMethod === 'credit_card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Card</Text>
            
            {creditCards.map(card => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.cardOption,
                  selectedCard === card.id && styles.selectedCardOption
                ]}
                onPress={() => handleSelectCard(card.id)}
              >
                <View style={styles.cardTypeContainer}>
                  <FontAwesome 
                    name={card.type === 'Visa' ? 'cc-visa' : card.type === 'Mastercard' ? 'cc-mastercard' : 'cc-amex'} 
                    size={24} 
                    color="#6E543C" 
                  />
                  <Text style={styles.cardType}>{card.type}</Text>
                </View>
                <Text style={styles.cardDetails}>**** **** **** {card.last4}</Text>
                <Text style={styles.cardExpiry}>Expires: {card.expiry}</Text>
                
                {selectedCard === card.id && (
                  <View style={styles.selectedCardIndicator}>
                    <MaterialIcons name="check-circle" size={24} color="#6E543C" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voucher Code</Text>
          
          <View style={styles.voucherContainer}>
            <TextInput
              style={styles.voucherInput}
              placeholder="Enter voucher code..."
              value={voucher}
              onChangeText={setVoucher}
            />
            
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>$11.50</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>$1.15</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>$12.65</Text>
          </View>
        </View>
        
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By placing your order, you agree to the Terms of Service and Privacy Policy.
            Orders cannot be canceled once placed. Please check your order details before confirming.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.placeOrderButton,
            (!paymentMethod || (paymentMethod === 'credit_card' && !selectedCard)) && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={!paymentMethod || (paymentMethod === 'credit_card' && !selectedCard)}
        >
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
          <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
      
      {showSuccessModal && (
        <View style={styles.successModal}>
          <View style={styles.successContent}>
            <MaterialIcons name="check-circle" size={60} color="#6E543C" />
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successMessage}>
              Your order has been successfully placed. You will receive a notification when it's ready.
            </Text>
          </View>
        </View>
      )}
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
    padding: moderateScale(16),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#333333',
    marginBottom: verticalScale(16),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedPaymentOption: {
    borderColor: '#6E543C',
    backgroundColor: '#F8F5F2',
  },
  paymentOptionText: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#333333',
    marginLeft: horizontalScale(16),
  },
  selectedPaymentOptionText: {
    color: '#6E543C',
  },
  cardOption: {
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  selectedCardOption: {
    borderColor: '#6E543C',
    backgroundColor: '#F8F5F2',
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  cardType: {
    fontSize: fontScale(16),
    fontWeight: '500',
    marginLeft: horizontalScale(8),
    color: '#333333',
  },
  cardDetails: {
    fontSize: fontScale(14),
    color: '#666666',
    marginBottom: verticalScale(4),
  },
  cardExpiry: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  selectedCardIndicator: {
    position: 'absolute',
    top: moderateScale(16),
    right: moderateScale(16),
  },
  voucherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: fontScale(16),
    marginRight: horizontalScale(12),
  },
  applyButton: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
  },
  applyButtonText: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderSummary: {
    backgroundColor: '#F8F5F2',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: verticalScale(24),
  },
  summaryTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#333333',
    marginBottom: verticalScale(16),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  summaryLabel: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  summaryValue: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#333333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: verticalScale(8),
    marginTop: verticalScale(8),
  },
  totalLabel: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#6E543C',
  },
  termsSection: {
    marginBottom: verticalScale(24),
  },
  termsText: {
    fontSize: fontScale(12),
    color: '#666666',
    lineHeight: verticalScale(18),
  },
  placeOrderButton: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(24),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  placeOrderButtonText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: horizontalScale(8),
  },
  successModal: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(32),
    width: '80%',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#6E543C',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  successMessage: {
    fontSize: fontScale(16),
    color: '#333333',
    textAlign: 'center',
    lineHeight: verticalScale(24),
  },
}); 