import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/constants';

export default function MenuSelection() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cafeId = params.cafeId as string;
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemImage, setNewItemImage] = useState<any>(null);
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('cafeId').then(storedCafeId => {
    });

    if (!cafeId) {
      return;
    }
    fetch(`${API_URL}/cafes/${cafeId}`)
      .then(res => res.json())
      .then(data => {
        let cafeData = data;
        if (Array.isArray(data) && data.length > 0) {
          cafeData = data[0];
        }

        if (cafeData.menu && Array.isArray(cafeData.menu) && cafeData.menu.length > 0) {
          setMenuId(cafeData.menu[0]);

          fetch(`${API_URL}/menu-items/${cafeData.menu[0]}`)
            .then(res => {
              const menuItemsArray = Array.isArray(res.json()) ? res.json() : (res.json().items || res.json().menuItems || []);
              setMenuItems(menuItemsArray);
            })
            .catch(() => {
              setMenuItems([]);
            });
        } else if (cafeData.menuId) {
          setMenuId(cafeData.menuId);

          fetch(`${API_URL}/menu-items/${cafeData.menuId}`)
            .then(res => {
              const menuItemsArray = Array.isArray(res.json()) ? res.json() : (res.json().items || res.json().menuItems || []);
              setMenuItems(menuItemsArray);
            })
            .catch(() => {
              setMenuItems([]);
            });
        } else if (cafeData.menu && typeof cafeData.menu === 'string') {
          setMenuId(cafeData.menu);

          fetch(`${API_URL}/menu-items/${cafeData.menu}`)
            .then(res => {
              const menuItemsArray = Array.isArray(res.json()) ? res.json() : (res.json().items || res.json().menuItems || []);
              setMenuItems(menuItemsArray);
            })
            .catch(() => {
              setMenuItems([]);
            });
        } else {
          setMenuId(cafeData._id || cafeData.id || cafeId);
          setMenuItems([]);
        }
      })
      .catch(() => {
        Alert.alert('Lỗi', 'Tải thông tin quán cà phê thất bại');
      });
  }, [cafeId]);

  const handleAddMenuItem = () => {
    if (!menuId) {
              Alert.alert('Lỗi', 'Menu chưa sẵn sàng. Vui lòng đợi một chút và thử lại.');
      return;
    }

    setIsModalVisible(true);
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Vui lòng cho phép truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setNewItemImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleSaveItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên cho món ăn');
      return;
    }
    if (!newItemImage) {
      Alert.alert('Lỗi', 'Vui lòng tải lên hình ảnh cho món ăn');
      return;
    }
    if (!newItemPrice.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá cho món ăn');
      return;
    }
    if (!newItemCategory.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập danh mục cho món ăn');
      return;
    }
    if (!menuId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID menu');
      return;
    }
    try {
      if (!menuId) {
        Alert.alert('Lỗi', 'ID menu không khả dụng. Vui lòng thử lại.');
        return;
      }

      const formData = new FormData();
      formData.append('name', newItemName.trim());
      formData.append('price', newItemPrice.trim());
      formData.append('category', newItemCategory.trim());
      formData.append('image', {
        uri: newItemImage,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const createResponse = await fetch(`${API_URL}/menu-items/create-Item/${menuId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(`Failed to create menu item: ${createResult.message || createResult.error || 'Unknown error'}`);
      }

      const res = await fetch(`${API_URL}/menu-items/${menuId}`);
      const data = await res.json();

      const menuItemsArray = Array.isArray(data) ? data : (data.items || data.menuItems || []);
      setMenuItems(menuItemsArray);

      setIsModalVisible(false);
      setNewItemName('');
      setNewItemImage(null);
      setNewItemPrice('');
      setNewItemCategory('');

      Alert.alert('Thành công', 'Món ăn đã được thêm thành công!');
    } catch (error) {
      Alert.alert('Lỗi', `Lưu món ăn thất bại: ${error.message}`);
    }
  };

  const handleNext = () => {
    if (menuItems.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một món ăn');
      return;
    }
    router.push('/pages/business-registration/tax-info');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressDot} />
        <View style={styles.progressLine} />
        <View style={[styles.progressDot, styles.activeDot]} />
        <View style={styles.progressLine} />
        <View style={styles.progressDot} />
        <View style={styles.progressLine} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.labels}>
        <Text style={styles.labelText}>Information</Text>
        <Text style={styles.labelText}>Menu</Text>
        <Text style={styles.labelText}>Tax{'\n'}Information</Text>
        <Text style={styles.labelText}>Identification{'\n'}Information</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Select</Text>
        <Text style={styles.subtitle}>Fruit Drinks</Text>

        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMenuItem}>
            <MaterialIcons name="add" size={40} color="#6E543C" />
          </TouchableOpacity>

          {menuItems.map((item) => (
            <View key={item._id} style={styles.menuItem}>
              <Image source={{ uri: item.image }} style={styles.menuImage} />
              <Text style={styles.menuItemName}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Tiếp theo</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm món mới</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#6E543C" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Tên món *</Text>
              <TextInput
                style={styles.modalInput}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Nhập tên món"
                maxLength={50}
              />
              <Text style={styles.charCount}>{newItemName.length}/50</Text>

              <Text style={styles.modalLabel}>Category *</Text>
              <TextInput
                style={styles.modalInput}
                value={newItemCategory}
                onChangeText={setNewItemCategory}
                placeholder="Nhập danh mục (VD: Trà, Cà phê)"
              />

              <Text style={styles.modalLabel}>Price *</Text>
              <TextInput
                style={styles.modalInput}
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                placeholder="Nhập giá tiền"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Hình ảnh món *</Text>
              <TouchableOpacity style={styles.uploadContainer} onPress={handleImagePick}>
                {newItemImage ? (
                  <Image source={{ uri: newItemImage }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <MaterialIcons name="add-photo-alternate" size={40} color="#6E543C" />
                    <Text style={styles.uploadText}>Tải lên ảnh</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveItem}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(20),
    paddingHorizontal: horizontalScale(40),
  },
  progressDot: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#E8E8E8',
  },
  activeDot: {
    backgroundColor: '#6E543C',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E8E8E8',
    marginHorizontal: horizontalScale(4),
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(20),
  },
  labelText: {
    fontSize: fontScale(12),
    color: '#6E543C',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: moderateScale(16),
  },
  title: {
    fontSize: fontScale(16),
    color: '#6E543C',
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: fontScale(20),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(20),
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: moderateScale(16),
  },
  addButton: {
    width: horizontalScale(150),
    height: verticalScale(150),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  menuItem: {
    width: horizontalScale(150),
    marginBottom: verticalScale(16),
  },
  menuImage: {
    width: horizontalScale(150),
    height: verticalScale(150),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(8),
  },
  menuItemName: {
    fontSize: fontScale(14),
    color: '#6E543C',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: moderateScale(16),
    marginTop: verticalScale(20),
  },
  backButton: {
    flex: 1,
    padding: moderateScale(12),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
    marginRight: horizontalScale(8),
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    padding: moderateScale(12),
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(8),
    marginLeft: horizontalScale(8),
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: fontScale(16),
    color: '#6E543C',
  },
  nextButtonText: {
    fontSize: fontScale(16),
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
  },
  modalBody: {
    padding: moderateScale(16),
  },
  modalLabel: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginBottom: verticalScale(8),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: fontScale(16),
    marginBottom: verticalScale(4),
  },
  charCount: {
    fontSize: fontScale(12),
    color: '#999',
    textAlign: 'right',
    marginBottom: verticalScale(16),
  },
  uploadContainer: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(200),
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(8),
  },
  uploadText: {
    fontSize: fontScale(16),
    color: '#6E543C',
    marginTop: verticalScale(8),
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  modalButton: {
    flex: 1,
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    marginHorizontal: horizontalScale(8),
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#6E543C',
  },
  cancelButtonText: {
    fontSize: fontScale(16),
    color: '#6E543C',
  },
  saveButtonText: {
    fontSize: fontScale(16),
    color: '#FFFFFF',
  },
}); 