import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { MaterialIcons } from '@expo/vector-icons';

interface UsersListProps {
  onUserSelect?: (user: any) => void;
  currentUserId?: string;
}

const UsersList: React.FC<UsersListProps> = ({ onUserSelect, currentUserId }) => {
  const showComingSoonAlert = () => {
    Alert.alert(
      "Thông báo",
      "Tính năng Chat sẽ có sớm! Chúng tôi đang phát triển để mang đến trải nghiệm tốt nhất cho bạn.",
      [{ text: "OK" }]
    );
  };

  React.useEffect(() => {
    showComingSoonAlert();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.comingSoonContainer}>
        <MaterialIcons name="chat" size={80} color="#6E543C" />
        <Text style={styles.comingSoonTitle}>Tính năng Chat</Text>
        <Text style={styles.comingSoonSubtitle}>Sẽ có sớm!</Text>
        <Text style={styles.comingSoonDescription}>
          Chúng tôi đang phát triển tính năng chat để bạn có thể trò chuyện với các quán cafe và người dùng khác một cách thuận tiện nhất.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5EA',
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
  },
});

export default UsersList; 