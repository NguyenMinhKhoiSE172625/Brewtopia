import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function TableBooking() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { cafeId } = params;
  
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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
  
  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
  };
  
  const handleSubmit = () => {
    // Show success message
    setShowSuccessMessage(true);
    
    // Redirect to nearby screen after a delay
    setTimeout(() => {
      router.push('pages/nearby' as any);
    }, 2000);
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
        <Text style={styles.headerTitle}>Đặt bàn</Text>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView style={styles.content}>
        {showSuccessMessage ? (
          <View style={styles.successMessage}>
            <MaterialIcons name="check-circle" size={60} color="#6E543C" />
            <Text style={styles.successTitle}>Đặt bàn thành công!</Text>
            <Text style={styles.successText}>
              Bàn của bạn đã được đặt thành công. Hẹn gặp lại bạn tại quán!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Ngày & Giờ</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ngày</Text>
                <TouchableOpacity 
                  style={styles.dateTimeInput}
                  onPress={() => setShowDateModal(true)}
                >
                  <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
                  <MaterialIcons name="calendar-today" size={20} color="#6E543C" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giờ</Text>
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
              <Text style={styles.sectionTitle}>Số lượng khách</Text>
              
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity <= 1 && styles.disabledButton]}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <MaterialIcons name="remove" size={20} color={quantity <= 1 ? "#CCCCCC" : "#6E543C"} />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity >= 10 && styles.disabledButton]}
                  onPress={increaseQuantity}
                  disabled={quantity >= 10}
                >
                  <MaterialIcons name="add" size={20} color={quantity >= 10 ? "#CCCCCC" : "#6E543C"} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Chọn bàn</Text>
              
              <Text style={styles.tableInstructions}>
                Hãy chọn một bàn từ sơ đồ bên dưới:
              </Text>
              
              <View style={styles.tablesContainer}>
                <View style={styles.tableRow}>
                  {[1, 2, 3].map(tableNumber => (
                    <TouchableOpacity
                      key={tableNumber}
                      style={[
                        styles.tableItem,
                        selectedTable === tableNumber && styles.selectedTableItem
                      ]}
                      onPress={() => handleTableSelect(tableNumber)}
                    >
                      <Text style={[
                        styles.tableNumber,
                        selectedTable === tableNumber && styles.selectedTableNumber
                      ]}>
                        {tableNumber}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.tableRow}>
                  {[4, 5, 6].map(tableNumber => (
                    <TouchableOpacity
                      key={tableNumber}
                      style={[
                        styles.tableItem,
                        selectedTable === tableNumber && styles.selectedTableItem
                      ]}
                      onPress={() => handleTableSelect(tableNumber)}
                    >
                      <Text style={[
                        styles.tableNumber,
                        selectedTable === tableNumber && styles.selectedTableNumber
                      ]}>
                        {tableNumber}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.tableRow}>
                  {[7, 8, 9, 10].map(tableNumber => (
                    <TouchableOpacity
                      key={tableNumber}
                      style={[
                        styles.tableItem,
                        selectedTable === tableNumber && styles.selectedTableItem
                      ]}
                      onPress={() => handleTableSelect(tableNumber)}
                    >
                      <Text style={[
                        styles.tableNumber,
                        selectedTable === tableNumber && styles.selectedTableNumber
                      ]}>
                        {tableNumber}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!selectedTable) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!selectedTable}
            >
              <Text style={styles.submitButtonText}>Xác nhận đặt bàn</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      
      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn ngày</Text>
            
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
              <Text style={styles.cancelButtonText}>Hủy</Text>
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
            <Text style={styles.modalTitle}>Chọn giờ</Text>
            
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
              <Text style={styles.cancelButtonText}>Hủy</Text>
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
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityButton: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: fontScale(20),
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: horizontalScale(32),
  },
  tableInstructions: {
    fontSize: fontScale(14),
    color: '#666666',
    marginBottom: verticalScale(16),
  },
  tablesContainer: {
    backgroundColor: '#F8F5F2',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    paddingBottom: verticalScale(24),
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: verticalScale(16),
  },
  tableItem: {
    width: horizontalScale(56),
    height: verticalScale(56),
    borderRadius: moderateScale(8),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    margin: moderateScale(4),
  },
  selectedTableItem: {
    backgroundColor: '#6E543C',
    borderColor: '#6E543C',
  },
  tableNumber: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  selectedTableNumber: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(40),
  },
  submitButtonText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successMessage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(32),
    marginTop: verticalScale(40),
  },
  successTitle: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#6E543C',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  successText: {
    fontSize: fontScale(16),
    color: '#333333',
    textAlign: 'center',
    lineHeight: verticalScale(24),
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