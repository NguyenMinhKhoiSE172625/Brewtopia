import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';

interface OrderPlacedModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OrderPlacedModal({ visible, onClose }: OrderPlacedModalProps) {
  const router = useRouter();

  const handleUnderstand = () => {
    onClose();
    router.push('/pages/congrats/congrats');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.checkCircle}>
            <MaterialIcons name="check" size={40} color="#FFFFFF" />
          </View>
          
          <Text style={styles.title}>Order Placed!</Text>
          
          <Text style={styles.message}>
            Your order has been successfully placed. You will receive a notification when it's ready.
          </Text>

          <View style={styles.warningBox}>
            <MaterialIcons name="warning" size={24} color="#FF9800" />
            <Text style={styles.warningText}>
              If you arrive more than 5 minutes after the appointment time, your drink will still be kept until the end of the session, but the quality will not be guaranteed as expected. You will be responsible for any problems.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.understandButton}
            onPress={handleUnderstand}
          >
            <Text style={styles.understandButtonText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    width: '100%',
    alignItems: 'center',
  },
  checkCircle: {
    width: horizontalScale(60),
    height: verticalScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: '#6E543C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: '#6E543C',
    marginBottom: verticalScale(12),
  },
  message: {
    fontSize: fontScale(16),
    color: '#666666',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(24),
  },
  warningText: {
    flex: 1,
    marginLeft: horizontalScale(12),
    fontSize: fontScale(14),
    color: '#FF9800',
    lineHeight: fontScale(20),
  },
  understandButton: {
    backgroundColor: '#6E543C',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(32),
    borderRadius: moderateScale(25),
    width: '100%',
  },
  understandButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
    textAlign: 'center',
  },
}); 