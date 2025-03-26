import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

const businessTypes = [
  'Traditional',
  'Take-away',
  'Franchise',
  'Garden cafe',
  'Book cafe',
  'Acoustic cafe',
  'Other',
];

export default function TaxInfo() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('Traditional');

  const handleNext = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a business type');
      return;
    }
    // Save data and navigate to identification information
    router.push('/pages/business-registration/identification');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax Information</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressDot} />
        <View style={styles.progressLine} />
        <View style={styles.progressDot} />
        <View style={styles.progressLine} />
        <View style={[styles.progressDot, styles.activeDot]} />
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
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={24} color="#6E543C" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            The collection of Tax Information and Identification Information is mandatory under the provisions of the Law on Cyber Security, E-Commerce and Taxation of Vietnam. Tax Information and Identification Information will be protected under Brewtopia's privacy policy. The enterprise is solely responsible for the accuracy of the information.
          </Text>
        </View>

        <Text style={styles.label}>Business type *</Text>
        <View style={styles.businessTypeContainer}>
          {businessTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.businessTypeButton,
                selectedType === type && styles.selectedBusinessType,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <View style={styles.radioButton}>
                <View
                  style={[
                    styles.radioInner,
                    selectedType === type && styles.selectedRadioInner,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.businessTypeText,
                  selectedType === type && styles.selectedBusinessTypeText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
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
  businessTypeContainer: {
    gap: verticalScale(12),
  },
  businessTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
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
  businessTypeText: {
    fontSize: fontScale(16),
    color: '#6E543C',
  },
  selectedBusinessType: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(12),
  },
  selectedBusinessTypeText: {
    fontWeight: '500',
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