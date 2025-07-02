import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UsersList from './UsersList';
import chatService from '../../services/chatService';
import socketService from '../../services/socketService';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function Users() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleUserSelect = async (user: any) => {
    // Đảm bảo luôn lấy userId từ AsyncStorage
    let userId = currentUser?._id;
    if (!userId) {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          userId = JSON.parse(userData)._id;
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    }
    if (!userId) {
      console.warn('Không lấy được userId!');
      return;
    }

    // Nếu là AI thì chuyển thẳng sang chat bot, không tạo phòng, không join socket
    if (user.isAI) {
      router.push({
        pathname: '/pages/chat/chat',
        params: {
          chatId: 'ai',
          chatName: user.name,
          isGroup: 'false'
        }
      });
      return;
    }

    try {
      // Tạo phòng chat với user được chọn (chỉ truyền user._id, không truyền currentUser._id)
      const response = await chatService.createChatRoom(
        [user._id],
        false,
        user.name
      );

      // Lấy đúng dữ liệu phòng chat
      let chatRoomData = response;
      if (response.room) {
        chatRoomData = response.room;
      }
      const roomId = chatRoomData._id;
      const participants = chatRoomData.participants || [];
      console.log('Create room response:', chatRoomData);
      // Kiểm tra userId có nằm trong participants không
      const isCurrentUserInRoom = participants.some((p: any) => (typeof p === 'string' ? p === userId : p._id === userId));
      if (!isCurrentUserInRoom) {
        throw new Error('Bạn không được phép tham gia phòng này');
      }

      // Join room qua socket
      socketService.joinRoom(roomId, userId);

      // Chuyển đến trang chat
      router.push({
        pathname: '/pages/chat/chat',
        params: {
          chatId: roomId,
          chatName: user.name,
          isGroup: 'false'
        }
      });
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/pages/home/home')} 
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Placeholder for alignment */}
        </View>
      </View>

      {/* Users List */}
      <UsersList
        onUserSelect={handleUserSelect}
        currentUserId={currentUser?._id}
      />
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
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerRight: {
    width: horizontalScale(40),
  },
}); 