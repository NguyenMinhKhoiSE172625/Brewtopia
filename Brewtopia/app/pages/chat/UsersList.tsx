import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../../config/constants';

interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  isAI?: boolean;
}

interface UsersListProps {
  onUserSelect: (user: User) => void;
  currentUserId: string;
}

const UsersList: React.FC<UsersListProps> = ({ onUserSelect, currentUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // Fetch users from API
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      // Add AI user at the beginning of the list
      const aiUser: User = {
        _id: 'ai',
        name: 'BREWBOT',
        avatar: require('../../../assets/images/bot1.png'),
        isAI: true
      };

      // Filter out current user and add AI user
      const filteredUsers = data.filter((user: User) => String(user._id) !== String(currentUserId));
      setUsers([aiUser, ...filteredUsers]);
    } catch (err) {
      setError('Không thể tải danh sách người dùng');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    // Avatar mặc định random nếu không có
    let avatarSource;
    if (item.avatar && item.avatar !== 'false') {
      avatarSource = typeof item.avatar === 'string' ? { uri: item.avatar } : item.avatar;
    } else if (item.isAI) {
      avatarSource = require('../../../assets/images/bot1.png');
    } else {
      // random avatar từ randomuser.me (dựa vào _id để không đổi mỗi lần render)
      const hash = Math.abs(
        item._id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      ) % 100;
      avatarSource = { uri: `https://randomuser.me/api/portraits/men/${hash}.jpg` };
    }
    return (
      <TouchableOpacity 
        style={styles.userItem}
        onPress={() => onUserSelect(item)}
      >
        <Image 
          source={avatarSource}
          style={styles.userAvatar}
        />
        <View style={styles.userInfoCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.userName}>{item.name}</Text>
            {item.isAI && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
          </View>
          {item.email && (
            <Text style={styles.userEmail}>{item.email}</Text>
          )}
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E543C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      renderItem={renderUserItem}
      keyExtractor={item => item._id}
      style={styles.container}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5EA',
  },
  listContent: {
    padding: moderateScale(16),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userAvatar: {
    width: horizontalScale(50),
    height: verticalScale(50),
    borderRadius: horizontalScale(25),
    marginRight: horizontalScale(12),
  },
  userInfoCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userName: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#333',
  },
  aiBadge: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    marginLeft: horizontalScale(8),
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    fontWeight: '500',
  },
  userEmail: {
    fontSize: fontScale(13),
    color: '#888',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5EA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5EA',
    padding: moderateScale(16),
  },
  errorText: {
    fontSize: fontScale(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '500',
  },
});

export default UsersList; 