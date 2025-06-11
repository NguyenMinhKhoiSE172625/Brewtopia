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
    console.log('MenuSelection params:', params);
    console.log('MenuSelection - cafeId from params:', cafeId);
    AsyncStorage.getItem('cafeId').then(storedCafeId => {
      console.log('MenuSelection - cafeId from AsyncStorage:', storedCafeId);
    });

    if (!cafeId) {
      console.log('MenuSelection - No cafeId provided');
      return;
    }
    console.log('MenuSelection - Fetching cafe with ID:', cafeId);
    fetch(`${API_URL}/cafes/${cafeId}`)
      .then(res => res.json())
      .then(data => {
        console.log('MenuSelection - Cafe data:', data);
        console.log('MenuSelection - Data type:', typeof data);
        console.log('MenuSelection - Is array:', Array.isArray(data));

        // Handle both array and object response formats
        let cafeData = data;
        if (Array.isArray(data) && data.length > 0) {
          cafeData = data[0]; // Take first cafe if response is array
          console.log('MenuSelection - Using first cafe from array:', cafeData);
        }

        // Log all possible menu-related fields
        console.log('MenuSelection - cafeData.menu:', cafeData.menu);
        console.log('MenuSelection - cafeData.menuId:', cafeData.menuId);
        console.log('MenuSelection - cafeData._id:', cafeData._id);
        console.log('MenuSelection - cafeData.id:', cafeData.id);
        console.log('MenuSelection - Full cafeData keys:', Object.keys(cafeData));

        // Try to extract menuId from different possible locations
        let extractedMenuId = null;

        if (cafeData.menu && Array.isArray(cafeData.menu) && cafeData.menu.length > 0) {
          extractedMenuId = cafeData.menu[0];
          console.log('MenuSelection - Found menuId in menu array:', extractedMenuId);
        } else if (cafeData.menuId) {
          extractedMenuId = cafeData.menuId;
          console.log('MenuSelection - Found menuId in menuId field:', extractedMenuId);
        } else if (cafeData.menu && typeof cafeData.menu === 'string') {
          extractedMenuId = cafeData.menu;
          console.log('MenuSelection - Found menuId as string in menu field:', extractedMenuId);
        } else {
          // Use cafeId as menuId (common pattern)
          extractedMenuId = cafeData._id || cafeData.id || cafeId;
          console.log('MenuSelection - Using cafeId as menuId:', extractedMenuId);
        }

        if (extractedMenuId) {
          setMenuId(extractedMenuId);
          console.log('MenuSelection - Set menuId to:', extractedMenuId);

          // Fetch menu items using the correct API
          console.log('MenuSelection - Fetching menu items from:', `${API_URL}/menu-items/${extractedMenuId}`);
          fetch(`${API_URL}/menu-items/${extractedMenuId}`)
            .then(res => {
              console.log('MenuSelection - Menu items response status:', res.status);
              return res.json();
            })
            .then(items => {
              console.log('MenuSelection - Menu items response:', items);
              // Handle different response formats
              const menuItemsArray = Array.isArray(items) ? items : (items.items || items.menuItems || []);
              console.log('MenuSelection - Processed menu items array:', menuItemsArray);
              setMenuItems(menuItemsArray);
            })
            .catch(error => {
              console.error('MenuSelection - Error fetching menu items:', error);
              // Don't show alert, just start with empty menu
              setMenuItems([]);
            });
        } else {
          console.log('MenuSelection - No menuId found, starting with empty menu');
          setMenuItems([]);
        }
      })
      .catch(error => {
        console.error('MenuSelection - Error fetching cafe:', error);
        Alert.alert('Error', 'Failed to load cafe information');
      });
  }, [cafeId]);

  const handleAddMenuItem = () => {
    console.log('MenuSelection - handleAddMenuItem called, menuId:', menuId);
    if (!menuId) {
      console.log('MenuSelection - No menuId available');
      Alert.alert('Error', 'Menu not ready. Please wait a moment and try again.');
      return;
    }

    // Allow adding items even with temporary menu ID
    console.log('MenuSelection - Opening add item modal');
    setIsModalVisible(true);
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to your photo library');
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
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const handleSaveItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter a name for the menu item');
      return;
    }
    if (!newItemImage) {
      Alert.alert('Error', 'Please upload an image for the menu item');
      return;
    }
    if (!newItemPrice.trim()) {
      Alert.alert('Error', 'Please enter a price for the menu item');
      return;
    }
    if (!newItemCategory.trim()) {
      Alert.alert('Error', 'Please enter a category for the menu item');
      return;
    }
    if (!menuId) {
      Alert.alert('Error', 'Menu ID not found');
      return;
    }
    try {
      console.log('MenuSelection - Creating menu item for menuId:', menuId);

      if (!menuId) {
        Alert.alert('Error', 'Menu ID not available. Please try again.');
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

      console.log('MenuSelection - Sending POST to:', `${API_URL}/menu-items/create-Item/${menuId}`);

      const createResponse = await fetch(`${API_URL}/menu-items/create-Item/${menuId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      console.log('MenuSelection - Response status:', createResponse.status);
      const createResult = await createResponse.json();
      console.log('MenuSelection - Create item response:', createResult);

      if (!createResponse.ok) {
        console.error('MenuSelection - API Error:', createResult);
        throw new Error(`Failed to create menu item: ${createResult.message || createResult.error || 'Unknown error'}`);
      }

      // Refresh menu items using the correct API
      console.log('MenuSelection - Fetching updated menu items from:', `${API_URL}/menu-items/${menuId}`);
      const res = await fetch(`${API_URL}/menu-items/${menuId}`);
      const data = await res.json();
      console.log('MenuSelection - Updated menu items:', data);

      const menuItemsArray = Array.isArray(data) ? data : (data.items || data.menuItems || []);
      setMenuItems(menuItemsArray);

      setIsModalVisible(false);
      setNewItemName('');
      setNewItemImage(null);
      setNewItemPrice('');
      setNewItemCategory('');

      Alert.alert('Success', 'Menu item added successfully!');
    } catch (error) {
      console.error('MenuSelection - Error saving menu item:', error);
      Alert.alert('Error', `Failed to save menu item: ${error.message}`);
    }
  };

  const handleNext = () => {
    if (menuItems.length === 0) {
      Alert.alert('Error', 'Please add at least one menu item');
      return;
    }
    // Save data and navigate to tax information
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
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
              <Text style={styles.modalTitle}>Add New Menu Item</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#6E543C" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Item Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Enter item name"
                maxLength={50}
              />
              <Text style={styles.charCount}>{newItemName.length}/50</Text>

              <Text style={styles.modalLabel}>Category *</Text>
              <TextInput
                style={styles.modalInput}
                value={newItemCategory}
                onChangeText={setNewItemCategory}
                placeholder="Enter category (e.g. Tea, Coffee)"
              />

              <Text style={styles.modalLabel}>Price *</Text>
              <TextInput
                style={styles.modalInput}
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                placeholder="Enter price"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Item Image *</Text>
              <TouchableOpacity style={styles.uploadContainer} onPress={handleImagePick}>
                {newItemImage ? (
                  <Image source={{ uri: newItemImage }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <MaterialIcons name="add-photo-alternate" size={40} color="#6E543C" />
                    <Text style={styles.uploadText}>Upload photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveItem}
              >
                <Text style={styles.saveButtonText}>Save</Text>
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