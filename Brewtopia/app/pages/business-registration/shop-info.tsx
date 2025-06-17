import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import MapLocationPicker from '../../components/MapLocationPicker';
import { formatAddressToString } from '../../utils/addressUtils';

export default function ShopInfo() {
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
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
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cafeId, setCafeId] = useState<string | null>(null);

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

  const getUserIdAsCafeId = async () => {
    try {
      console.log('ShopInfo - getUserIdAsCafeId: Starting...');

      // Try to get userId directly first
      let userId = await AsyncStorage.getItem('userId');
      console.log('ShopInfo - userId from AsyncStorage:', userId);

      // If not found, try to get from user_data
      if (!userId) {
        console.log('ShopInfo - No userId, trying user_data...');
        const userDataString = await AsyncStorage.getItem('user_data');
        console.log('ShopInfo - user_data string:', userDataString);

        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log('ShopInfo - parsed userData:', userData);
          userId = userData.id || userData._id; // Handle both id and _id
          console.log('ShopInfo - extracted userId:', userId);

          // Save userId for future use
          if (userId) {
            await AsyncStorage.setItem('userId', userId);
            console.log('ShopInfo - Saved userId to AsyncStorage');
          }
        }
      }

      if (userId) {
        console.log('ShopInfo - Using userId as cafeId:', userId);
        await AsyncStorage.setItem('cafeId', userId);
        setCafeId(userId);
        return userId;
      } else {
        console.log('ShopInfo - No userId found after all attempts');
      }
    } catch (error) {
      console.error('ShopInfo - Error getting userId:', error);
      console.error('ShopInfo - Error details:', JSON.stringify(error));
    }
    return null;
  };

  useEffect(() => {
    const loadCafeData = async () => {
      setIsLoading(true);
      try {
        // Debug: Check all AsyncStorage keys
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('ShopInfo - All AsyncStorage keys:', allKeys);

        // Check if user is logged in
        const authToken = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user_data');
        console.log('ShopInfo - Auth token exists:', !!authToken);
        console.log('ShopInfo - User data exists:', !!userData);

        if (!authToken || !userData) {
          console.log('ShopInfo - User not logged in, redirecting...');
          // User not logged in, should redirect to login
          return;
        }

        // First priority: Check for cafeId from login response
        let id = await AsyncStorage.getItem('cafeId');
        console.log('ShopInfo - cafeId from AsyncStorage:', id);

        // If still no cafeId, something is wrong with login
        if (!id) {
          console.log('ShopInfo - No cafeId found, user may need to login again');
        }

        if (id) {
          setCafeId(id);
          console.log('ShopInfo - Using cafeId:', id);
          console.log('ShopInfo - Getting cafe profile for id:', id);

          try {
            console.log('ShopInfo - Calling getProfile with cafeId:', id);
            const data = await ApiService.cafe.getProfile(id);
            console.log('ShopInfo - getProfile response:', data);

            if (data) {
              console.log('ShopInfo - Loaded cafe data successfully');
              setShopName(data.name || (data as any).shopName || '');

              // Handle both string and object address formats
              setAddress(formatAddressToString(data.address));

              // Set coordinates if available
              if (typeof data.address === 'object' && data.address.coordinates) {
                setCoordinates(data.address.coordinates);
              }

              setEmail(data.email || '');
              setPhoneNumber(data.phoneNumber || '');
            } else {
              console.log('ShopInfo - No data returned from getProfile');
            }
          } catch (profileError) {
            console.error('ShopInfo - Error getting cafe profile:', profileError);
            console.error('ShopInfo - Profile error details:', JSON.stringify(profileError));

            // If cafe not found, maybe we need to use userId instead
            if ((profileError as any)?.status === 404) {
              console.log('ShopInfo - Cafe not found with ID:', id);
              console.log('ShopInfo - Trying to use userId as cafeId...');

              const userId = await AsyncStorage.getItem('userId');
              if (userId && userId !== id) {
                console.log('ShopInfo - Found different userId:', userId);
                await AsyncStorage.setItem('cafeId', userId);
                setCafeId(userId);

                // Try again with userId
                try {
                  const userData = await ApiService.cafe.getProfile(userId);
                  if (userData) {
                    console.log('ShopInfo - Loaded cafe data with userId:', userData);
                    setShopName(userData.name || (userData as any).shopName || '');
                    setAddress(formatAddressToString(userData.address));
                    if (typeof userData.address === 'object' && userData.address.coordinates) {
                      setCoordinates(userData.address.coordinates);
                    }
                    setEmail(userData.email || '');
                    setPhoneNumber(userData.phoneNumber || '');
                  }
                } catch (userIdError) {
                  console.error('ShopInfo - Error with userId as cafeId:', userIdError);
                }
              }
            }
          }
        } else {
          console.log('ShopInfo - Still no cafeId after all attempts');
        }
      } catch (err) {
        console.error('ShopInfo - Error loading cafe data:', err);
        console.error('ShopInfo - Error details:', JSON.stringify(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadCafeData();
  }, []);



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

  const handleMapLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    setCoordinates([location.latitude, location.longitude]);
    if (location.address) {
      setAddress(location.address);

      // Try to parse address to extract components
      const addressParts = location.address.split(', ');
      if (addressParts.length >= 2) {
        // Try to find matching province
        const cityPart = addressParts[addressParts.length - 1];
        const matchingProvince = provinces.find(p =>
          cityPart.includes(p.name) || p.name.includes(cityPart)
        );

        if (matchingProvince) {
          setSelectedProvince(matchingProvince);
          console.log('ShopInfo - Auto-selected province from map:', matchingProvince.name);
        }
      }
    }
    setIsMapModalVisible(false);
  };

  const handleNext = async () => {
    if (!shopName || !address || !email || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    let currentCafeId = cafeId;

    // If still no cafeId, try to get from AsyncStorage
    if (!currentCafeId) {
      currentCafeId = await AsyncStorage.getItem('cafeId');
      console.log('ShopInfo - Got cafeId from AsyncStorage:', currentCafeId);
    }

    console.log('ShopInfo - cafeId when Next:', currentCafeId);

    // Debug: Check all AsyncStorage values
    const allKeys = await AsyncStorage.getAllKeys();
    const allValues = await AsyncStorage.multiGet(allKeys);
    console.log('ShopInfo - All AsyncStorage values:', allValues);

    if (!currentCafeId) {
      Alert.alert('Error', 'Cafe ID not found. Please try logging in again or restart the app.');
      return;
    }

    try {
      // Create address object with coordinates in GeoJSON format [lng, lat]
      let geoJsonCoordinates: [number, number] | undefined = undefined;
      if (coordinates && coordinates[0] !== 0 && coordinates[1] !== 0) {
        // Convert from [lat, lng] to [lng, lat] for GeoJSON format
        geoJsonCoordinates = [coordinates[1], coordinates[0]];
        console.log('ShopInfo - Converting coordinates from [lat, lng] to [lng, lat]:', {
          original: coordinates,
          geoJson: geoJsonCoordinates
        });
      }

      // Create proper address object with separate components
      let addressData: any = {};

      if (selectedWard && selectedDistrict && selectedProvince) {
        // User selected from dropdown - use structured data
        addressData = {
          street: houseNumber ? `${houseNumber} ${street}` : street,
          ward: selectedWard.name,
          district: selectedDistrict.name,
          city: selectedProvince.name,
          ...(geoJsonCoordinates && { coordinates: geoJsonCoordinates })
        };
      } else {
        // User only used map picker - parse address string
        const addressParts = address.split(', ');
        addressData = {
          street: address, // Use full address as street for now
          ward: null,
          district: null,
          city: addressParts.length > 0 ? addressParts[addressParts.length - 1] : null,
          ...(geoJsonCoordinates && { coordinates: geoJsonCoordinates })
        };
      }

      console.log('ShopInfo - Sending update data:', {
        shopName: shopName,
        address: addressData,
        email: email,
        phoneNumber: phoneNumber,
        status: 'pending',
      });

      const updateResponse = await ApiService.cafe.updateProfile(currentCafeId, {
        shopName: shopName, // Use shopName instead of name
        address: addressData,
        email: email,
        phoneNumber: phoneNumber,
        status: 'pending',
      });

      console.log('ShopInfo - Update response:', updateResponse);

      // Show success message
      Alert.alert(
        'Thành công',
        'Thông tin quán cafe đã được cập nhật thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/pages/business-registration/menu-selection',
                params: { cafeId: currentCafeId }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error update cafe profile:', error);
      Alert.alert('Error', 'Failed to update cafe information');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Đang tải thông tin quán...</Text>
      </View>
    );
  }

  if (!cafeId) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <MaterialIcons name="error-outline" size={48} color="#6E543C" />
        <Text style={styles.errorTitle}>Không tìm thấy thông tin quán</Text>
        <Text style={styles.errorText}>
          Có vẻ như có lỗi khi tạo thông tin quán cafe. Vui lòng thử lại hoặc đăng nhập lại.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {
          setIsLoading(true);
          // Reload the component
          const loadCafeData = async () => {
            setIsLoading(true);
            try {
              let id = await AsyncStorage.getItem('cafeId');
              if (!id) {
                id = await getUserIdAsCafeId();
              }
              if (id) {
                setCafeId(id);
                const data = await ApiService.cafe.getProfile(id);
                if (data) {
                  setShopName(data.name || '');
                  setAddress(formatAddressToString(data.address));
                  if (typeof data.address === 'object' && data.address.coordinates) {
                    setCoordinates(data.address.coordinates);
                  }
                  setEmail(data.email || '');
                  setPhoneNumber(data.phoneNumber || '');
                }
              }
            } catch (err) {
              console.error('ShopInfo - Error reloading cafe data:', err);
            } finally {
              setIsLoading(false);
            }
          };
          loadCafeData();
        }}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

          {/* Map Location Picker Button */}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setIsMapModalVisible(true)}
          >
            <MaterialIcons name="location-on" size={20} color="#6E543C" />
            <Text style={styles.mapButtonText}>Chọn vị trí trên bản đồ</Text>
          </TouchableOpacity>

          {coordinates && (
            <Text style={styles.coordinatesText}>
              Tọa độ: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
            </Text>
          )}
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

      {/* Map Location Picker Modal */}
      <Modal visible={isMapModalVisible} animationType="slide">
        <MapLocationPicker
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setIsMapModalVisible(false)}
          initialLocation={coordinates ? { latitude: coordinates[0], longitude: coordinates[1] } : undefined}
        />
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
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginTop: verticalScale(8),
  },
  mapButtonText: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginLeft: horizontalScale(8),
    fontWeight: '500',
  },
  coordinatesText: {
    fontSize: fontScale(12),
    color: '#666',
    marginTop: verticalScale(4),
    fontStyle: 'italic',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  loadingText: {
    fontSize: fontScale(16),
    color: '#6E543C',
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  errorTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    textAlign: 'center',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  errorText: {
    fontSize: fontScale(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: verticalScale(20),
    marginBottom: verticalScale(24),
  },
  retryButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(12),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
});