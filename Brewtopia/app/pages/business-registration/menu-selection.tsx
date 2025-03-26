import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function MenuSelection() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([
    { id: 1, image: require('../../../assets/images/mon1.png'), name: 'Strawberry Matcha Latte' },
    { id: 2, image: require('../../../assets/images/mon2.png'), name: 'Cherry Lemonade' },
    { id: 3, image: require('../../../assets/images/mon3.png'), name: 'Fruit & Yogurt Parfait' },
  ]);

  const handleAddMenuItem = async () => {
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
        const newItem = {
          id: menuItems.length + 1,
          image: { uri: result.assets[0].uri },
          name: `New Item ${menuItems.length + 1}`,
        };
        setMenuItems([...menuItems, newItem]);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not add menu item');
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
            <View key={item.id} style={styles.menuItem}>
              <Image source={item.image} style={styles.menuImage} />
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
}); 