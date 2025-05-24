import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    fetch(`/cafes/${cafeId}`)
      .then(res => res.json())
      .then(data => {
        console.log('MenuSelection - Cafe data:', data);
        console.log('MenuSelection - Menu array:', data.menu);
        if (!data.menu || !Array.isArray(data.menu)) {
          console.log('MenuSelection - No menu array found in cafe data');
          return;
        }
        const id = data.menu.length > 0 ? data.menu[0] : null;
        console.log('MenuSelection - Menu ID:', id);
        setMenuId(id);
        if (id) {
          console.log('MenuSelection - Fetching menu items for menu ID:', id);
          fetch(`/menu-items/${id}`)
            .then(res => res.json())
            .then(items => {
              console.log('MenuSelection - Menu items response:', items);
              setMenuItems(items);
            })
            .catch(error => {
              console.error('MenuSelection - Error fetching menu items:', error);
              Alert.alert('Error', 'Failed to load menu items');
            });
        } else {
          console.log('MenuSelection - No menu ID found, creating new menu');
          fetch(`/cafes/${cafeId}/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
            .then(res => res.json())
            .then(newMenu => {
              console.log('MenuSelection - New menu created:', newMenu);
              setMenuId(newMenu._id);
            })
            .catch(error => {
              console.error('MenuSelection - Error creating menu:', error);
              Alert.alert('Error', 'Failed to create menu');
            });
        }
      })
      .catch(error => {
        console.error('MenuSelection - Error fetching cafe:', error);
        Alert.alert('Error', 'Failed to load cafe information');
      });
  }, [cafeId]);

  const handleAddMenuItem = () => {
    if (!menuId) {
      Alert.alert('Error', 'Menu ID not loaded yet. Please wait a moment.');
      return;
    }
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
    const formData = new FormData();
    formData.append('name', newItemName.trim());
    formData.append('price', newItemPrice.trim());
    formData.append('category', newItemCategory.trim());
    formData.append('image', {
      uri: newItemImage,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);
    await fetch(`/menu-items/create-Item/${menuId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: formData,
    });
    const res = await fetch(`/menu-items/${menuId}`);
    const data = await res.json();
    setMenuItems(data);
    setIsModalVisible(false);
    setNewItemName('');
    setNewItemImage(null);
    setNewItemPrice('');
    setNewItemCategory('');
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
          <TouchableOpacity style={styles.addButton} onPress={handleAddMenuItem} disabled={!menuId}>
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