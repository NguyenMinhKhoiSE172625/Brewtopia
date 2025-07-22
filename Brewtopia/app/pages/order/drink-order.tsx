import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import ApiService from '../../utils/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { claimTaskBonus } from '../../services/pointService';

export default function DrinkOrder() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { cafeId, cart: cartParam, menuid } = params;
  
  // Parse cart id+quantity
  const [cartArr, setCartArr] = useState<{id: string, quantity: number}[]>([]);
  
  // Parse cart param khi component mount hoặc cartParam thay đổi
  useEffect(() => {
    try {
      const parsed = cartParam ? JSON.parse(cartParam as string) : [];
      const newCartArr = Array.isArray(parsed) ? parsed : [];
      setCartArr(newCartArr);
      console.log('DrinkOrder - Parsed cart:', newCartArr);
    } catch (error) {
      console.log('DrinkOrder - Error parsing cart:', error);
      setCartArr([]);
    }
  }, [cartParam]);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [paying, setPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  
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
  
  // Lấy menu từ API
  useEffect(() => {
    console.log('DrinkOrder - menuid:', menuid);
    console.log('DrinkOrder - cartParam:', cartParam);
    console.log('DrinkOrder - cartArr:', cartArr);
    
    const fetchMenuItems = async () => {
      if (!menuid) return;
      
      try {
        // Thử gọi trực tiếp menu-items trước
        console.log('DrinkOrder - Trying /menu-items/', menuid);
        const itemsData = await ApiService.fetch(`/menu-items/${menuid}`);
        console.log('DrinkOrder - Direct menu-items response:', itemsData);
        
        if (Array.isArray(itemsData) && itemsData.length > 0) {
          setMenuItems(itemsData);
          return;
        }
        
        // Nếu không có items, thử gọi /menus để lấy menu trước
        console.log('DrinkOrder - No items found, trying /menus/', menuid);
        const menuData = await ApiService.fetch(`/menus/${menuid}`);
        console.log('DrinkOrder - Menu response:', menuData);
        
        if (Array.isArray(menuData) && menuData.length > 0) {
          // Lấy menu đầu tiên và gọi items
          const firstMenu = menuData[0];
          console.log('DrinkOrder - First menu:', firstMenu);
          
          if (firstMenu._id) {
            console.log('DrinkOrder - Trying /menu-items/', firstMenu._id);
            const itemsData2 = await ApiService.fetch(`/menu-items/${firstMenu._id}`);
            console.log('DrinkOrder - Items from menu response:', itemsData2);
            setMenuItems(Array.isArray(itemsData2) ? itemsData2 : []);
          }
        } else {
          console.log('DrinkOrder - No menu found');
          setMenuItems([]);
        }
      } catch (error) {
        console.log('DrinkOrder - API error:', error);
        setMenuItems([]);
      }
    };
    
    fetchMenuItems();
  }, [menuid]);

  // Ghép quantity vào từng item
  useEffect(() => {
    console.log('DrinkOrder - Matching items:');
    console.log('- menuItems.length:', menuItems.length);
    console.log('- cartArr.length:', cartArr.length);
    console.log('- menuItems:', menuItems);
    console.log('- cartArr:', cartArr);
    
    if (menuItems.length && cartArr.length) {
      const selected = cartArr.map(ci => {
        const item = menuItems.find(mi => String(mi._id) === String(ci.id));
        console.log(`- Looking for item with id ${ci.id}:`, item);
        return item ? { ...item, quantity: ci.quantity } : null;
      }).filter(Boolean);
      console.log('- Final selected items:', selected);
      setSelectedItems(selected);
    } else {
      console.log('- No items to match, setting empty array');
      setSelectedItems([]);
    }
  }, [menuItems, cartArr]);

  // Tính tổng tiền động
  const totalPrice = selectedItems.reduce((sum, ci) => sum + (ci.price || 0) * (ci.quantity || 1), 0);
  
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
    setPaying(true);
    try {
      // Gọi API PayOS ở đây (mock)
      await new Promise(res => setTimeout(res, 1500)); // giả lập delay
      setShowSuccess(true);
      // Gọi API cộng điểm thưởng
      try {
        await claimTaskBonus();
        setBonusMessage('Bạn đã được cộng 20 điểm thưởng!');
      } catch (e) {
        setBonusMessage('Đặt hàng thành công, nhưng cộng điểm thất bại!');
      }
    } catch (e) {
      setShowSuccess(true);
    } finally {
      setPaying(false);
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
        <Text style={styles.headerTitle}>Đặt nước</Text>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Ngày & Giờ nhận</Text>
          
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
          <Text style={styles.sectionTitle}>Các món đã chọn</Text>
          {selectedItems.length === 0 && (
            <Text style={{color:'#999',marginBottom:12}}>Chưa chọn món nào</Text>
          )}
          {selectedItems.map((ci, idx) => (
            <View key={ci._id || idx} style={styles.selectedDrinkItem}>
            <View style={styles.drinkInfo}>
                <Text style={styles.drinkName}>{ci.name || '---'}</Text>
                <Text style={styles.drinkPrice}>{ci.price?.toLocaleString()}đ</Text>
            </View>
            <View style={styles.drinkQuantity}>
                <Text style={styles.quantityText}>× {ci.quantity}</Text>
          </View>
            </View>
          ))}
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Tổng cộng:</Text>
            <Text style={styles.orderTotalAmount}>{totalPrice.toLocaleString()}đ</Text>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Yêu cầu đặc biệt</Text>
          
          <TextInput
            style={styles.requirementsInput}
            placeholder="Thêm ghi chú cho đơn hàng (nếu có)..."
            multiline
            numberOfLines={4}
            value={requirements}
            onChangeText={setRequirements}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.payButton, paying && {opacity:0.5}]}
          onPress={handlePay}
          disabled={paying}
        >
          <Text style={styles.payButtonText}>Thanh toán</Text>
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
      
      <Modal visible={showSuccess} transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>Đặt hàng thành công!</Text>
            {!!bonusMessage && <Text style={{ marginTop: 8, color: '#6E543C', fontWeight: 'bold' }}>{bonusMessage}</Text>}
            <TouchableOpacity onPress={() => {
              setShowSuccess(false);
              setBonusMessage('');
              router.replace('/pages/order/confirmation');
            }}>
              <Text style={{ marginTop: 16, color: '#6E543C', fontWeight: 'bold' }}>Tiếp tục</Text>
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