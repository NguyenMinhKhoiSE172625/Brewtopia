import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PRIMARY_BROWN } from '../config/constants';
import { isGoogleMapsAvailable, MAP_CONFIG } from '../utils/MapUtils';

interface MapDebugInfoProps {
  visible?: boolean;
  onClose?: () => void;
}

const MapDebugInfo: React.FC<MapDebugInfoProps> = ({ visible = true, onClose }) => {
  if (!visible) return null;

  const checkGoogleMapsStatus = () => {
    try {
      const available = isGoogleMapsAvailable();
      Alert.alert(
        'Google Maps Status', 
        available ? '✅ Google Maps khả dụng' : '❌ Google Maps không khả dụng'
      );
    } catch (error) {
      Alert.alert('Google Maps Error', `❌ Lỗi: ${error}`);
    }
  };

  const showTroubleshootingTips = () => {
    Alert.alert(
      'Khắc phục lỗi Map',
      `🔧 Các bước khắc phục:

1. Restart ứng dụng hoàn toàn
2. Chạy: npx expo prebuild --clean
3. Chạy: npx expo run:android
4. Kiểm tra kết nối mạng
5. Đảm bảo có Google Play Services

📱 Yêu cầu:
• Development build (không phải Expo Go)
• Android API level 21+
• Google Play Services`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="bug-report" size={20} color={PRIMARY_BROWN} />
        <Text style={styles.title}>Map Debug Info</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Trạng thái thư viện:</Text>
        
        <View style={styles.statusRow}>
          <MaterialIcons 
            name={isGoogleMapsAvailable() ? "check-circle" : "cancel"} 
            size={16} 
            color={isGoogleMapsAvailable() ? "#4CAF50" : "#F44336"} 
          />
          <Text style={styles.statusText}>
            react-native-maps: {isGoogleMapsAvailable() ? 'Khả dụng' : 'Không khả dụng'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.debugButton} onPress={checkGoogleMapsStatus}>
          <Text style={styles.buttonText}>Test Google Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpButton} onPress={showTroubleshootingTips}>
          <MaterialIcons name="help" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Hướng dẫn sửa lỗi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    margin: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: PRIMARY_BROWN,
  },
  closeButton: {
    padding: 4,
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_BROWN,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  debugButton: {
    backgroundColor: PRIMARY_BROWN,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 80,
  },
  helpButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 120,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 2,
  },
});

export default MapDebugInfo; 