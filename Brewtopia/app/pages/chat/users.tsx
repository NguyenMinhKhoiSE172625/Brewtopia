import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UsersList from './UsersList';
import chatService from '../../services/chatService';
import socketService from '../../services/socketService';

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
}); 