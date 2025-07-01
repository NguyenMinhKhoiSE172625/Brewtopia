import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';

export default function Identification() {
  const router = useRouter();
  const [nationality, setNationality] = useState('Viet Nam');
  const [frontIdImage, setFrontIdImage] = useState<string | null>(null);

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
        aspect: [3, 2],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setFrontIdImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleDone = async () => {
    if (!frontIdImage) {
      Alert.alert('Lỗi', 'Vui lòng tải lên giấy tờ tùy thân');
      return;
    }
    try {
      const cafeId = await AsyncStorage.getItem('cafeId');
      if (!cafeId) {
        Alert.alert('Lỗi', 'Không tìm thấy cafeId');
        return;
      }
      await ApiService.cafe.updateProfile(cafeId, {
        identification: {
          nationality: nationality,
          citizenIdImage: frontIdImage,
        },
        status: 'success',
      });
      router.push('/pages/login-user/login-user?role=admin');
    } catch (error) {
      Alert.alert('Lỗi', 'Cập nhật thông tin thất bại');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin định danh</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressDot} />
        <View style={styles.progressLine} />
        <View style={styles.progressDot} />
        <View style={styles.progressLine} />
        <View style={styles.progressDot} />
        <View style={styles.progressLine} />
        <View style={[styles.progressDot, styles.activeDot]} />
      </View>

      <View style={styles.labels}>
        <Text style={styles.labelText}>Thông tin</Text>
        <Text style={styles.labelText}>Menu</Text>
        <Text style={styles.labelText}>Thông tin{'\n'}thuế</Text>
        <Text style={styles.labelText}>Thông tin{'\n'}định danh</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={24} color="#6E543C" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Please provide the Identification Information of the Business Owner (if an individual), or the Legal Representative on the business registration certificate.
          </Text>
        </View>

        <Text style={styles.label}>Nationality *</Text>
        <View style={styles.nationalityContainer}>
          <TouchableOpacity
            style={[
              styles.nationalityButton,
              nationality === 'Viet Nam' && styles.selectedNationality,
            ]}
            onPress={() => setNationality('Viet Nam')}
          >
            <View style={styles.radioButton}>
              <View
                style={[
                  styles.radioInner,
                  nationality === 'Viet Nam' && styles.selectedRadioInner,
                ]}
              />
            </View>
            <Text
              style={[
                styles.nationalityText,
                nationality === 'Viet Nam' && styles.selectedNationalityText,
              ]}
            >
              Viet Nam
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nationalityButton,
              nationality === 'Other' && styles.selectedNationality,
            ]}
            onPress={() => setNationality('Other')}
          >
            <View style={styles.radioButton}>
              <View
                style={[
                  styles.radioInner,
                  nationality === 'Other' && styles.selectedRadioInner,
                ]}
              />
            </View>
            <Text
              style={[
                styles.nationalityText,
                nationality === 'Other' && styles.selectedNationalityText,
              ]}
            >
              Other
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Photo of the front of the Citizen Identification Card *</Text>
        <TouchableOpacity style={styles.uploadContainer} onPress={handleImagePick}>
          {frontIdImage ? (
            <Image source={{ uri: frontIdImage }} style={styles.uploadedImage} />
          ) : (
            <>
              <MaterialIcons name="add-photo-alternate" size={40} color="#6E543C" />
              <Text style={styles.uploadText}>Upload photo</Text>
              <Image 
                source={require('../../../assets/images/idcard.png')}
                style={styles.idCardExample}
                resizeMode="contain"
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleDone}>
          <Text style={styles.nextButtonText}>Hoàn thành</Text>
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
  infoBox: {
    backgroundColor: '#FFF9E5',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    flexDirection: 'row',
    marginBottom: verticalScale(24),
  },
  infoIcon: {
    marginRight: horizontalScale(12),
  },
  infoText: {
    flex: 1,
    fontSize: fontScale(14),
    color: '#6E543C',
    lineHeight: verticalScale(20),
  },
  label: {
    fontSize: fontScale(16),
    color: '#6E543C',
    marginBottom: verticalScale(16),
  },
  nationalityContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(24),
  },
  nationalityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    marginRight: horizontalScale(16),
  },
  radioButton: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: '#6E543C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  radioInner: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: 'transparent',
  },
  selectedRadioInner: {
    backgroundColor: '#6E543C',
  },
  nationalityText: {
    fontSize: fontScale(16),
    color: '#6E543C',
  },
  selectedNationality: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
  },
  selectedNationalityText: {
    fontWeight: '500',
  },
  uploadContainer: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(24),
  },
  uploadedImage: {
    width: '100%',
    height: verticalScale(200),
    borderRadius: moderateScale(8),
  },
  uploadText: {
    fontSize: fontScale(16),
    color: '#6E543C',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  idCardExample: {
    width: horizontalScale(200),
    height: verticalScale(120),
    marginTop: verticalScale(16),
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