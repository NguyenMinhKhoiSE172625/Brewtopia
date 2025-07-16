import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function PaymentMethod() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { amount, type, duration, packageName, upgrades } = params;
  
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'bank' | 'my_card' | 'zalopay' | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [voucher, setVoucher] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPremiumSuccessModal, setShowPremiumSuccessModal] = useState(false);
  const [showAdsSuccessModal, setShowAdsSuccessModal] = useState(false);
  
  const creditCards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/24' },
    { id: 2, type: 'Mastercard', last4: '5678', expiry: '06/25' },
    { id: 3, type: 'American Express', last4: '0123', expiry: '09/23' }
  ];
  
  const handleSelectPaymentMethod = (method: 'momo' | 'bank' | 'my_card' | 'zalopay') => {
    setPaymentMethod(method);
  };
  
  const handleSelectCard = (cardId: number) => {
    setSelectedCard(cardId);
  };
  
  const handlePlaceOrder = () => {
    if (type === 'premium') {
      setShowPremiumSuccessModal(true);
    } else if (type === 'ads') {
      setShowAdsSuccessModal(true);
    } else {
      setShowSuccessModal(true);
    }
  };
  
  const handlePremiumSuccess = () => {
    setShowPremiumSuccessModal(false);
    router.push('/pages/home/home');
  };
  
  const handleUnderstand = () => {
    setShowSuccessModal(false);
    router.push('/pages/congrats/congrats');
  };
  
  const handleAdsSuccess = () => {
    setShowAdsSuccessModal(false);
    router.push('/pages/home/home');
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
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'my_card' && styles.selectedPaymentOption
            ]}
            onPress={() => handleSelectPaymentMethod('my_card')}
          >
            <Image 
              source={require('../../../assets/images/card.png')} 
              style={styles.paymentIcon} 
              resizeMode="contain"
            />
            <Text style={[
              styles.paymentOptionText,
              paymentMethod === 'my_card' && styles.selectedPaymentOptionText
            ]}>Thẻ của tôi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'momo' && styles.selectedPaymentOption
            ]}
            onPress={() => handleSelectPaymentMethod('momo')}
          >
            <Image 
              source={require('../../../assets/images/momo.png')} 
              style={styles.paymentIcon} 
              resizeMode="contain"
            />
            <Text style={[
              styles.paymentOptionText,
              paymentMethod === 'momo' && styles.selectedPaymentOptionText
            ]}>MoMo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'zalopay' && styles.selectedPaymentOption
            ]}
            onPress={() => handleSelectPaymentMethod('zalopay')}
          >
            <Image 
              source={require('../../../assets/images/zalopay.png')} 
              style={styles.paymentIcon} 
              resizeMode="contain"
            />
            <Text style={[
              styles.paymentOptionText,
              paymentMethod === 'zalopay' && styles.selectedPaymentOptionText
            ]}>ZaloPay</Text>
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
            ]}>Ngân hàng địa phương</Text>
          </TouchableOpacity>
        </View>
        
        {paymentMethod === 'my_card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn thẻ</Text>
            
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
                  <Image 
                    source={require('../../../assets/images/creditcard.png')} 
                    style={styles.cardTypeIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardType}>{card.type}</Text>
                </View>
                <Text style={styles.cardDetails}>**** **** **** {card.last4}</Text>
                <Text style={styles.cardExpiry}>Hạn sử dụng: {card.expiry}</Text>
                
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
          <Text style={styles.sectionTitle}>Mã voucher</Text>
          
          <View style={styles.voucherContainer}>
            <TextInput
              style={styles.voucherInput}
              placeholder="Nhập mã voucher..."
              value={voucher}
              onChangeText={setVoucher}
            />
            
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {type === 'premium' 
                ? `Premium (${duration} tháng${parseInt(duration as string) > 1 ? 's' : ''})`
                : type === 'ads'
                ? `${packageName} Gói`
                : 'Tổng cộng'
              }
            </Text>
            <Text style={styles.summaryValue}>${amount}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thuế</Text>
            <Text style={styles.summaryValue}>${(parseFloat(amount as string) * 0.1).toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>
              ${(parseFloat(amount as string) * 1.1).toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.
            Đơn hàng không thể hủy bỏ sau khi đặt. Vui lòng kiểm tra chi tiết đơn hàng trước khi xác nhận.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.placeOrderButton,
            (!paymentMethod || (paymentMethod === 'my_card' && !selectedCard)) && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={!paymentMethod || (paymentMethod === 'my_card' && !selectedCard)}
        >
          <Text style={styles.placeOrderButtonText}>Đặt hàng</Text>
          <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
      
      {showSuccessModal && type !== 'premium' && (
        <View style={styles.successModal}>
          <View style={styles.successContent}>
            <MaterialIcons name="check-circle" size={60} color="#6E543C" />
            <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
            <Text style={styles.successMessage}>
              Đơn hàng của bạn đã được ghi nhận. Bạn sẽ nhận được thông báo khi đồ uống sẵn sàng.
            </Text>
            
            <View style={styles.warningContainer}>
              <MaterialIcons name="warning" size={24} color="#E67700" />
              <Text style={styles.warningText}>
                Nếu bạn đến muộn hơn 5 phút so với giờ hẹn, đồ uống vẫn sẽ được giữ đến hết ca, nhưng chất lượng có thể không đảm bảo như mong đợi. Bạn sẽ tự chịu trách nhiệm với các vấn đề phát sinh.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.understandButton}
              onPress={handleUnderstand}
            >
              <Text style={styles.understandButtonText}>Tôi đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showPremiumSuccessModal && type === 'premium' && (
        <View style={styles.successModal}>
          <View style={styles.successContent}>
            <MaterialIcons name="check-circle" size={60} color="#6E543C" />
            <Text style={styles.successTitle}>Mua Premium thành công!</Text>
            <Text style={styles.successMessage}>
              Cảm ơn bạn đã mua Premium! Bạn bây giờ có quyền truy cập vào tất cả các tính năng premium trong {duration} tháng{parseInt(duration as string) > 1 ? 's' : ''}.
            </Text>
            
            <TouchableOpacity 
              style={styles.understandButton}
              onPress={handlePremiumSuccess}
            >
              <Text style={styles.understandButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showAdsSuccessModal && type === 'ads' && (
        <View style={styles.successModal}>
          <View style={styles.successContent}>
            <MaterialIcons name="check-circle" size={60} color="#6E543C" />
            <Text style={styles.successTitle}>Gói quảng cáo đã đặt!</Text>
            <Text style={styles.successMessage}>
              Cảm ơn bạn đã mua gói {packageName}! Chiến dịch quảng cáo của bạn sẽ được kích hoạt trong vòng 24 giờ.
            </Text>
            
            <TouchableOpacity 
              style={styles.understandButton}
              onPress={handleAdsSuccess}
            >
              <Text style={styles.understandButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
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
    flex: 1,
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
  cardTypeIcon: {
    width: horizontalScale(30),
    height: verticalScale(30),
    marginRight: horizontalScale(8),
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
    marginBottom: verticalScale(16),
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginTop: verticalScale(8),
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: fontScale(14),
    color: '#E67700',
    marginLeft: horizontalScale(8),
    lineHeight: verticalScale(20),
  },
  understandButton: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(32),
    marginTop: verticalScale(24),
    width: '100%',
    alignItems: 'center',
  },
  understandButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentIcon: {
    width: horizontalScale(30),
    height: verticalScale(30),
    marginRight: horizontalScale(16),
  },
}); 