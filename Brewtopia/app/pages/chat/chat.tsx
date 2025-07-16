import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function Chat() {
  const router = useRouter();

  const showComingSoonAlert = () => {
    Alert.alert(
      "Thông báo",
      "Tính năng Chat sẽ có sớm! Chúng tôi đang phát triển để mang đến trải nghiệm tốt nhất cho bạn.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  React.useEffect(() => {
    showComingSoonAlert();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.comingSoonContainer}>
          <MaterialIcons name="chat" size={80} color="#6E543C" />
          <Text style={styles.comingSoonTitle}>Tính năng Chat</Text>
          <Text style={styles.comingSoonSubtitle}>Sẽ có sớm!</Text>
          <Text style={styles.comingSoonDescription}>
            Chúng tôi đang phát triển tính năng chat để bạn có thể trò chuyện với các quán cafe và người dùng khác một cách thuận tiện nhất.
          </Text>
          <TouchableOpacity 
            style={styles.backToHomeButton}
            onPress={() => router.push('/pages/home/home')}
          >
            <Text style={styles.backToHomeButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5EA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#6E543C',
  },
  backButton: {
    marginRight: horizontalScale(16),
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(32),
  },
  comingSoonContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: moderateScale(32),
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#6E543C',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  comingSoonSubtitle: {
    fontSize: fontScale(18),
    fontWeight: '500',
    color: '#FF6B6B',
    marginBottom: verticalScale(16),
  },
  comingSoonDescription: {
    fontSize: fontScale(14),
    color: '#666666',
    textAlign: 'center',
    lineHeight: fontScale(20),
    marginBottom: verticalScale(24),
  },
  backToHomeButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  backToHomeButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
}); 