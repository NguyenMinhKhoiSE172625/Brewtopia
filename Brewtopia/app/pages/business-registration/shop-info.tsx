import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ShopInfo() {
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Fetch provinces on mount
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(setProvinces);
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts));
      setSelectedDistrict(null);
      setSelectedWard(null);
      setWards([]);
    }
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards));
      setSelectedWard(null);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    AsyncStorage.getItem('cafeId').then(id => console.log('ShopInfo - cafeId from AsyncStorage:', id));
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode[0]) {
        const addressComponents = [
          geocode[0].street,
          geocode[0].district,
          geocode[0].city,
          geocode[0].region,
          geocode[0].country
        ].filter(Boolean);
        
        setStreet(geocode[0].street || '');
        setHouseNumber(geocode[0].streetNumber || '');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    }
  };

  const handleSaveAddress = () => {
    if (!street || !selectedDistrict || !selectedProvince) {
      Alert.alert('Error', 'Vui lòng nhập đầy đủ địa chỉ');
      return;
    }
    // Ghép số nhà và tên đường thành 1 cụm
    const streetBlock = houseNumber ? `${houseNumber} ${street}` : street;
    // Ghép các phần còn lại
    const addressParts = [
      streetBlock,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');
    setAddress(fullAddress);
    setIsAddressModalVisible(false);
  };

  const handleNext = async () => {
    if (!shopName || !address || !email || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const shopData = {
      name: shopName,
      address,
      email,
      phone: phoneNumber,
    };
    try {
      const cafeId = await AsyncStorage.getItem('cafeId');
      console.log('ShopInfo - cafeId when Next:', cafeId);
      if (!cafeId) {
        Alert.alert('Error', 'Cafe ID not found. Please try logging in again.');
        return;
      }
      router.push({
        pathname: '/pages/business-registration/menu-selection',
        params: { cafeId }
      });
    } catch (error) {
      console.error('Error getting cafeId:', error);
      Alert.alert('Error', 'Failed to get cafe information');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop's Information</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressDot, styles.activeDot]} />
        <View style={styles.progressLine} />
        <View style={styles.progressDot} />
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

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Shop Name *</Text>
          <TextInput
            style={styles.input}
            value={shopName}
            onChangeText={setShopName}
            placeholder="Enter shop name"
            maxLength={50}
          />
          <Text style={styles.charCount}>{shopName.length}/50</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address *</Text>
          <TouchableOpacity onPress={() => setIsAddressModalVisible(true)}>
            <View pointerEvents="none">
              <TextInput
                style={styles.input}
                value={address}
                placeholder="Chọn địa chỉ"
                editable={false}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone number *</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
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

      <Modal visible={isAddressModalVisible} animationType="slide">
        <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Nhập địa chỉ chi tiết</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Province/City *</Text>
            <Picker
              selectedValue={selectedProvince}
              onValueChange={(itemValue) => setSelectedProvince(itemValue)}
            >
              <Picker.Item label="Chọn tỉnh/thành" value={null} />
              {provinces.map((p: any) => (
                <Picker.Item key={p.code} label={p.name} value={p} />
              ))}
            </Picker>
          </View>
          {selectedProvince && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>District *</Text>
              <Picker
                selectedValue={selectedDistrict}
                onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
              >
                <Picker.Item label="Chọn quận/huyện" value={null} />
                {districts.map((d: any) => (
                  <Picker.Item key={d.code} label={d.name} value={d} />
                ))}
              </Picker>
            </View>
          )}
          {selectedDistrict && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ward *</Text>
              <Picker
                selectedValue={selectedWard}
                onValueChange={(itemValue) => setSelectedWard(itemValue)}
              >
                <Picker.Item label="Chọn phường/xã" value={null} />
                {wards.map((w: any) => (
                  <Picker.Item key={w.code} label={w.name} value={w} />
                ))}
              </Picker>
            </View>
          )}
          {selectedWard && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Street *</Text>
                <TextInput
                  style={styles.input}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="Nhập tên đường"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>House Number *</Text>
                <TextInput
                  style={styles.input}
                  value={houseNumber}
                  onChangeText={setHouseNumber}
                  placeholder="Nhập số nhà, chi tiết"
                />
              </View>
            </>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <TouchableOpacity style={[styles.backButton, { flex: 1, marginRight: 8 }]} onPress={() => setIsAddressModalVisible(false)}>
              <Text style={styles.backButtonText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.nextButton, { flex: 1, marginLeft: 8 }]} onPress={handleSaveAddress}>
              <Text style={styles.nextButtonText}>Lưu địa chỉ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  form: {
    padding: moderateScale(16),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginBottom: verticalScale(8),
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: fontScale(16),
  },
  charCount: {
    fontSize: fontScale(12),
    color: '#999',
    textAlign: 'right',
    marginTop: verticalScale(4),
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