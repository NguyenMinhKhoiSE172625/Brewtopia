import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, FlatList, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { MaterialIcons, Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface Comment {
  id: string;
  userName: string;
  userAvatar: any;
  text: string;
  timestamp: string;
}

// Available livestreams data
const livestreamsData = [
  {
    id: '1',
    shopName: 'COFFEE SHOP 1',
    shopLogo: require('../../../assets/images/iconcafe2.png'),
    streamTitle: 'Acoustic Friday Session',
    thumbnail: require('../../../assets/images/live1.png'),
    viewerCount: 100
  },
  {
    id: '2',
    shopName: 'COFFEE 22',
    shopLogo: require('../../../assets/images/iconcafe3.png'),
    streamTitle: 'Acoustic Session Thursdays',
    thumbnail: require('../../../assets/images/live2.png'),
    viewerCount: 150
  },
  {
    id: '3',
    shopName: 'StayAwayHouse',
    shopLogo: require('../../../assets/images/iconcafe4.png'),
    streamTitle: 'Behind the Counter: Coffee Art',
    thumbnail: require('../../../assets/images/live3.png'),
    viewerCount: 80
  },
  {
    id: '4',
    shopName: 'QUESTO CAFÉ',
    shopLogo: require('../../../assets/images/iconcafe5.png'),
    streamTitle: 'Evening Jazz & Coffee',
    thumbnail: require('../../../assets/images/live4.png'),
    viewerCount: 75
  },
];

export default function LivestreamView() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // const { streamId } = params;

  // State cho form join phòng
  const [channelId, setChannelId] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<'streamer' | 'viewer'>('streamer');
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  // Camera
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const cameraRef = useRef(null);

  const BASE_URL = 'https://brewtopia-production.up.railway.app/api';

  // Khi join phòng
  const handleJoinRoom = async () => {
    setError('');
    if (!channelId.trim() || !userName.trim()) {
      setError('Vui lòng nhập đầy đủ tên phòng và tên của bạn.');
      return;
    }
    setJoining(true);
    try {
      // Gọi API join phòng
      const res = await fetch(`${BASE_URL}/video/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, channel: channelId })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Không thể tham gia phòng');
        setJoining(false);
        return;
      }
      setJoined(true);
      setJoining(false);
    } catch (e) {
      setError('Lỗi kết nối server');
      setJoining(false);
    }
  };

  // Xin quyền camera khi vào trang (nếu là streamer và đã join)
  useEffect(() => {
    if (joined && role === 'streamer' && !permission) {
      requestPermission();
    }
  }, [joined, role, permission]);

  // UI form join phòng
  if (!joined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}> 
        <Text style={{ color: '#6E543C', fontSize: 22, fontWeight: 'bold', marginBottom: 24 }}>Tham gia Livestream</Text>
        <TextInput
          style={[styles.input, { marginBottom: 12 }]}
          placeholder="Tên phòng (channelId)"
          value={channelId}
          onChangeText={setChannelId}
        />
        <TextInput
          style={[styles.input, { marginBottom: 12 }]}
          placeholder="Tên của bạn"
          value={userName}
          onChangeText={setUserName}
        />
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'streamer' && styles.roleButtonActive]}
            onPress={() => setRole('streamer')}
          >
            <Text style={{ color: role === 'streamer' ? '#fff' : '#6E543C' }}>Streamer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'viewer' && styles.roleButtonActive]}
            onPress={() => setRole('viewer')}
          >
            <Text style={{ color: role === 'viewer' ? '#fff' : '#6E543C' }}>Viewer</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.joinButton, joining && { opacity: 0.6 }]}
          onPress={handleJoinRoom}
          disabled={joining}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Tham gia phòng</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Sau khi đã join phòng
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {role === 'streamer' ? (
        permission && permission.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.backgroundVideo}
            facing={cameraType}
          />
        ) : (
          <View style={[styles.backgroundVideo, { justifyContent: 'center', alignItems: 'center' }]}> 
            <Text style={{ color: '#fff' }}>Đang kiểm tra quyền camera...</Text>
          </View>
        )
      ) : (
        <View style={[styles.backgroundVideo, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ color: '#fff', fontSize: 20 }}>Bạn đã vào phòng với vai trò Viewer</Text>
          <Text style={{ color: '#fff', marginTop: 8 }}>Tính năng xem stream sẽ cập nhật sau!</Text>
        </View>
      )}
      {/* Có thể bổ sung UI overlay, chat, viewer count... sau khi đã join phòng */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(16),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    width: horizontalScale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: horizontalScale(10),
  },
  shopLogo: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(10),
  },
  shopName: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    fontWeight: '600',
  },
  streamTitleContainer: {
    position: 'absolute',
    top: verticalScale(100),
    left: horizontalScale(16),
    right: horizontalScale(80),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
  },
  streamTitleText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
  },
  followingButton: {
    backgroundColor: '#00B207',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '500',
    marginLeft: horizontalScale(5),
  },
  viewerCountContainer: {
    position: 'absolute',
    top: verticalScale(100),
    right: horizontalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(16),
  },
  viewerCountText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    marginLeft: horizontalScale(5),
  },
  commentsSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: verticalScale(80),
    maxHeight: verticalScale(200),
    paddingHorizontal: horizontalScale(16),
  },
  commentsList: {
    flexGrow: 0,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: moderateScale(20),
    padding: moderateScale(8),
  },
  commentAvatar: {
    width: horizontalScale(36),
    height: verticalScale(36),
    borderRadius: moderateScale(18),
    marginRight: horizontalScale(8),
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
  },
  replyButton: {
    padding: moderateScale(6),
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: moderateScale(16),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    height: verticalScale(44),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    borderRadius: moderateScale(22),
    paddingHorizontal: horizontalScale(16),
    marginRight: horizontalScale(10),
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: horizontalScale(44),
    height: verticalScale(44),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(4),
  },
  input: {
    width: '100%',
    height: verticalScale(44),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    borderRadius: moderateScale(22),
    paddingHorizontal: horizontalScale(16),
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: '#6E543C',
    alignItems: 'center',
    marginHorizontal: horizontalScale(4),
  },
  roleButtonActive: {
    backgroundColor: '#6E543C',
    borderColor: '#6E543C',
  },
  joinButton: {
    width: '100%',
    height: verticalScale(44),
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
}); 