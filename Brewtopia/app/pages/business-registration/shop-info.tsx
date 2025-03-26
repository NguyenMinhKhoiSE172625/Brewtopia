import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function ShopInfo() {
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

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
        
        setAddress(addressComponents.join(', '));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    }
  };

  const handleNext = () => {
    if (!shopName || !address || !email || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Save data and navigate to menu selection
    router.push('/pages/business-registration/menu-selection');
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
          <View style={styles.addressContainer}>
            <TextInput
              style={[styles.input, styles.addressInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              multiline
            />
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <MaterialIcons name="my-location" size={24} color="#6E543C" />
            </TouchableOpacity>
          </View>
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
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    flex: 1,
    marginRight: horizontalScale(8),
  },
  locationButton: {
    padding: moderateScale(12),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
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