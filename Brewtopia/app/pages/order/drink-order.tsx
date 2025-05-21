import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import ApiService from '../../utils/ApiService';

export default function DrinkOrder() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { cafeId } = params;
  
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  
  // Date options for the picker
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const dateOptions = [];
  for (let d = new Date(today); d <= nextWeek; d.setDate(d.getDate() + 1)) {
    dateOptions.push(new Date(d));
  }
  
  // Time options from 8:00 AM to 10:00 PM in 30-minute intervals
  const timeOptions = [];
  const startTime = new Date();
  startTime.setHours(8, 0, 0, 0);
  const endTime = new Date();
  endTime.setHours(22, 0, 0, 0);
  
  for (let t = new Date(startTime); t <= endTime; t.setMinutes(t.getMinutes() + 30)) {
    timeOptions.push(new Date(t));
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handlePay = async () => {
    try {
      const checkoutUrl = await ApiService.payment.createPayosPayment(
        100000, // Example amount, replace with actual amount
        `Drink Order - ${formatDate(date)} ${formatTime(time)}`
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
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Drinks</Text>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Pickup Date & Time</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity 
              style={styles.dateTimeInput}
              onPress={() => setShowDateModal(true)}
            >
              <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#6E543C" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time</Text>
            <TouchableOpacity 
              style={styles.dateTimeInput}
              onPress={() => setShowTimeModal(true)}
            >
              <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
              <MaterialIcons name="access-time" size={20} color="#6E543C" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Selected Drinks</Text>
          
          <View style={styles.selectedDrinkItem}>
            <View style={styles.drinkInfo}>
              <Text style={styles.drinkName}>Cappuccino</Text>
              <Text style={styles.drinkPrice}>$4.50</Text>
            </View>
            <View style={styles.drinkQuantity}>
              <Text style={styles.quantityText}>× 1</Text>
            </View>
          </View>
          
          <View style={styles.selectedDrinkItem}>
            <View style={styles.drinkInfo}>
              <Text style={styles.drinkName}>Espresso</Text>
              <Text style={styles.drinkPrice}>$3.50</Text>
            </View>
            <View style={styles.drinkQuantity}>
              <Text style={styles.quantityText}>× 2</Text>
            </View>
          </View>
          
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Total:</Text>
            <Text style={styles.orderTotalAmount}>$11.50</Text>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Special Requirements</Text>
          
          <TextInput
            style={styles.requirementsInput}
            placeholder="Add any special instructions for your order..."
            multiline
            numberOfLines={4}
            value={requirements}
            onChangeText={setRequirements}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePay}
        >
          <Text style={styles.payButtonText}>Pay for Order</Text>
          <MaterialIcons name="payment" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
      
      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            
            <ScrollView style={styles.optionsContainer}>
              {dateOptions.map((dateOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    dateOption.toDateString() === date.toDateString() && styles.selectedOptionItem
                  ]}
                  onPress={() => {
                    setDate(dateOption);
                    setShowDateModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      dateOption.toDateString() === date.toDateString() && styles.selectedOptionText
                    ]}
                  >
                    {formatDate(dateOption)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Custom Time Picker Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            
            <ScrollView style={styles.optionsContainer}>
              {timeOptions.map((timeOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    timeOption.getHours() === time.getHours() && 
                    timeOption.getMinutes() === time.getMinutes() && 
                    styles.selectedOptionItem
                  ]}
                  onPress={() => {
                    setTime(timeOption);
                    setShowTimeModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      timeOption.getHours() === time.getHours() && 
                      timeOption.getMinutes() === time.getMinutes() && 
                      styles.selectedOptionText
                    ]}
                  >
                    {formatTime(timeOption)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  formSection: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#333333',
    marginBottom: verticalScale(16),
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  inputLabel: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#666666',
    marginBottom: verticalScale(8),
  },
  dateTimeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateTimeText: {
    fontSize: fontScale(16),
    color: '#333333',
  },
  selectedDrinkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingVertical: verticalScale(12),
  },
  drinkInfo: {
    flex: 1,
  },
  drinkName: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#333333',
    marginBottom: verticalScale(4),
  },
  drinkPrice: {
    fontSize: fontScale(14),
    color: '#6E543C',
    fontWeight: '600',
  },
  drinkQuantity: {
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(4),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
  },
  quantityText: {
    fontSize: fontScale(14),
    color: '#333333',
    fontWeight: '500',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(16),
    marginTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  orderTotalLabel: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#333333',
  },
  orderTotalAmount: {
    fontSize: fontScale(20),
    fontWeight: '700',
    color: '#6E543C',
  },
  requirementsInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: fontScale(16),
    height: verticalScale(120),
    textAlignVertical: 'top',
  },
  payButton: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(24),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(40),
  },
  payButtonText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: horizontalScale(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  optionsContainer: {
    maxHeight: verticalScale(300),
  },
  optionItem: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedOptionItem: {
    backgroundColor: '#F8F5F2',
  },
  optionText: {
    fontSize: fontScale(16),
    color: '#333333',
  },
  selectedOptionText: {
    color: '#6E543C',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: fontScale(16),
    color: '#6E543C',
    fontWeight: '600',
  },
}); 