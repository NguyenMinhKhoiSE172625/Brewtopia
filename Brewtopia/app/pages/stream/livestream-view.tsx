import React, { useState, useRef, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, FlatList, StatusBar, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { API_URL, debugLog } from '../../config/constants';

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

  // State cho server connection
  const [serverConnected, setServerConnected] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);

  // Chat
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Comment[]>([]);

  // Test server connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        debugLog('Testing server connection...', API_URL);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_URL}/stream/active`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        debugLog('Server response:', data);
        setServerConnected(data.success !== false);
        
      } catch (error) {
        debugLog('Server connection failed:', error);
        setServerConnected(false);
      } finally {
        setConnectionTested(true);
      }
    };
    
    testConnection();
  }, []);

  // Join room handler
  const handleJoinRoom = async () => {
    setError('');
    if (!channelId.trim() || !userName.trim()) {
      setError('Vui lòng nhập đầy đủ tên phòng và tên của bạn.');
      return;
    }

    setJoining(true);
    
    // Offline mode if server not connected
    if (!serverConnected) {
      debugLog('Server not connected, going offline mode');
      setTimeout(() => {
        setJoined(true);
        setJoining(false);
        setShowCameraPreview(role === 'streamer');
        setMessages([
          {
            id: '1',
            userName: 'Hệ thống',
            userAvatar: require('../../../assets/images/bot1.png'),
            text: `🔴 Chế độ offline: ${userName} đã vào phòng ${channelId}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }, 1000);
      return;
    }
    
    try {
      debugLog('Attempting to join room:', { name: userName, channel: channelId });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_URL}/stream/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, channel: channelId }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();
      
      debugLog('Join room response:', data);
      
      if (!data.success) {
        setError(data.message || 'Không thể tham gia phòng');
        setJoining(false);
        return;
      }

      // Camera permission for streamer
      if (role === 'streamer') {
        const cameraPermission = await requestPermission();
        if (!cameraPermission.granted) {
          setError('Cần quyền truy cập camera để stream');
          setJoining(false);
          return;
        }
        setShowCameraPreview(true);
      }

      setJoined(true);
      setJoining(false);
      
      setMessages([
        {
          id: '1',
          userName: 'Hệ thống',
          userAvatar: require('../../../assets/images/bot1.png'),
          text: `🟢 Chào mừng ${userName} đến với phòng ${channelId}!`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

    } catch (e) {
      debugLog('Join room error:', e);
      setError('Đang chuyển sang chế độ offline...');
      
      // Fallback to offline mode
      setTimeout(() => {
        setJoined(true);
        setJoining(false);
        setShowCameraPreview(role === 'streamer');
        setMessages([
          {
            id: '1',
            userName: 'Hệ thống',
            userAvatar: require('../../../assets/images/bot1.png'),
            text: `🔴 Chế độ offline: ${userName} đã vào phòng ${channelId}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        setError('');
      }, 1500);
    }
  };

  // Camera flip
  const flipCamera = () => {
    setCameraType(current => (current === 'front' ? 'back' : 'front'));
  };

  // Send message
  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage: Comment = {
      id: Date.now().toString(),
      userName: userName,
      userAvatar: require('../../../assets/images/avatar1.png'),
      text: chatMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  // Leave room
  const handleLeaveRoom = async () => {
    if (serverConnected) {
      try {
        await fetch(`${API_URL}/stream/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName, channel: channelId })
        });
      } catch (error) {
        debugLog('Leave room error:', error);
      }
    }
    
    setJoined(false);
    setShowCameraPreview(false);
    setMessages([]);
    router.back();
  };

  // Join form UI
  if (!joined) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}> 
        <StatusBar barStyle="light-content" />
        
        <View style={styles.joinHeader}>
          <MaterialIcons name="videocam" size={48} color="#6E543C" />
          <Text style={styles.joinTitle}>Tham gia Livestream</Text>
          
          {!connectionTested ? (
            <View style={styles.connectionStatus}>
              <MaterialIcons name="hourglass-empty" size={16} color="#FFA500" />
              <Text style={[styles.joinSubtitle, { color: '#FFA500' }]}>
                Đang kiểm tra kết nối server...
              </Text>
            </View>
          ) : (
            <View style={styles.connectionStatus}>
              <MaterialIcons 
                name={serverConnected ? "wifi" : "wifi-off"} 
                size={16} 
                color={serverConnected ? "#4CAF50" : "#FF6B6B"} 
              />
              <Text style={[styles.joinSubtitle, { color: serverConnected ? '#4CAF50' : '#FF6B6B' }]}>
                {serverConnected ? 'Kết nối server thành công' : 'Chế độ offline - Chỉ sử dụng camera'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.joinForm}>
          <TextInput
            style={styles.input}
            placeholder="Tên phòng (channelId)"
            placeholderTextColor="#999"
            value={channelId}
            onChangeText={setChannelId}
          />
          <TextInput
            style={styles.input}
            placeholder="Tên của bạn"
            placeholderTextColor="#999"
            value={userName}
            onChangeText={setUserName}
          />
          
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'streamer' && styles.roleButtonActive]}
              onPress={() => setRole('streamer')}
            >
              <MaterialIcons name="videocam" size={20} color={role === 'streamer' ? '#fff' : '#6E543C'} />
              <Text style={[styles.roleText, role === 'streamer' && styles.roleTextActive]}>Streamer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'viewer' && styles.roleButtonActive]}
              onPress={() => setRole('viewer')}
            >
              <MaterialIcons name="visibility" size={20} color={role === 'viewer' ? '#fff' : '#6E543C'} />
              <Text style={[styles.roleText, role === 'viewer' && styles.roleTextActive]}>Viewer</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={20} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.joinButton, (joining || !connectionTested) && styles.joinButtonDisabled]}
            onPress={handleJoinRoom}
            disabled={joining || !connectionTested}
          >
            {joining ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={20} color="#fff" />
                <Text style={styles.joinButtonText}>Đang tham gia...</Text>
              </View>
            ) : !connectionTested ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="wifi" size={20} color="#fff" />
                <Text style={styles.joinButtonText}>Kiểm tra kết nối...</Text>
              </View>
            ) : (
              <Text style={styles.joinButtonText}>
                {serverConnected ? 'Tham gia phòng' : 'Vào chế độ offline'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main livestream UI
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera/Video View */}
      {role === 'streamer' && showCameraPreview ? (
        permission && permission.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.backgroundVideo}
            facing={cameraType}
          >
            <View style={styles.cameraOverlay}>
              <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
                <MaterialIcons name="flip-camera-ios" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <View style={[styles.backgroundVideo, styles.cameraPermissionView]}> 
            <MaterialIcons name="videocam-off" size={64} color="#fff" />
            <Text style={styles.permissionText}>Cần quyền truy cập camera</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Cấp quyền</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={[styles.backgroundVideo, styles.viewerView]}> 
          <MaterialIcons name="visibility" size={64} color="#fff" />
          <Text style={styles.viewerText}>Chế độ Viewer</Text>
          <Text style={styles.viewerSubtext}>Phòng: {channelId}</Text>
          <Text style={styles.viewerSubtext}>Tên: {userName}</Text>
        </View>
      )}

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity style={styles.backButton} onPress={handleLeaveRoom}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.streamInfo}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.channelName}>{channelId}</Text>
        </View>

        <View style={styles.viewerCount}>
          <MaterialIcons name="visibility" size={16} color="#fff" />
          <Text style={styles.viewerCountText}>1</Text>
        </View>
      </View>

      {/* Chat Section */}
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.messageItem}>
              <Image source={item.userAvatar} style={styles.messageAvatar} />
              <View style={styles.messageContent}>
                <Text style={styles.messageUser}>{item.userName}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
              <Text style={styles.messageTime}>{item.timestamp}</Text>
            </View>
          )}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
        
        <View style={styles.messageInput}>
          <TextInput
            style={styles.chatInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            value={chatMessage}
            onChangeText={setChatMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <MaterialIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
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
    flex: 1,
    alignItems: 'center',
  },

  input: {
    backgroundColor: 'rgba(110, 84, 60, 0.1)',
    color: '#000',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(16),
    fontSize: fontScale(16),
    borderWidth: 1,
    borderColor: 'rgba(110, 84, 60, 0.3)',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
    gap: horizontalScale(8),
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#6E543C',
    backgroundColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: '#6E543C',
    borderColor: '#6E543C',
  },
  roleText: {
    color: '#6E543C',
    fontSize: fontScale(14),
    fontWeight: '600',
    marginLeft: horizontalScale(8),
  },
  roleTextActive: {
    color: '#fff',
  },
  joinButton: {
    backgroundColor: '#6E543C',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Join form styles
  joinHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  joinTitle: {
    color: '#6E543C',
    fontSize: fontScale(24),
    fontWeight: '700',
    marginTop: verticalScale(16),
  },
  joinSubtitle: {
    color: '#666',
    fontSize: fontScale(14),
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
    gap: horizontalScale(6),
  },
  joinForm: {
    width: '100%',
    maxWidth: horizontalScale(320),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(16),
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: fontScale(14),
    marginLeft: horizontalScale(8),
    flex: 1,
  },
  // Camera styles
  cameraOverlay: {
    position: 'absolute',
    top: verticalScale(100),
    right: horizontalScale(16),
  },
  flipButton: {
    width: horizontalScale(48),
    height: verticalScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPermissionView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  permissionText: {
    color: '#fff',
    fontSize: fontScale(18),
    marginTop: verticalScale(16),
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    marginTop: verticalScale(16),
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  viewerView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  viewerText: {
    color: '#fff',
    fontSize: fontScale(24),
    fontWeight: '600',
    marginTop: verticalScale(16),
  },
  viewerSubtext: {
    color: '#ccc',
    fontSize: fontScale(16),
    marginTop: verticalScale(8),
  },
  // Live indicator styles
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(4),
  },
  liveDot: {
    width: horizontalScale(8),
    height: verticalScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#fff',
    marginRight: horizontalScale(4),
  },
  liveText: {
    color: '#fff',
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  channelName: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  viewerCountText: {
    color: '#fff',
    fontSize: fontScale(12),
    marginLeft: horizontalScale(4),
  },
  // Chat styles
  chatContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(200),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(8),
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: moderateScale(8),
    borderRadius: moderateScale(8),
  },
  messageAvatar: {
    width: horizontalScale(32),
    height: verticalScale(32),
    borderRadius: moderateScale(16),
    marginRight: horizontalScale(8),
  },
  messageContent: {
    flex: 1,
  },
  messageUser: {
    color: '#fff',
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  messageText: {
    color: '#fff',
    fontSize: fontScale(14),
    marginTop: verticalScale(2),
  },
  messageTime: {
    color: '#ccc',
    fontSize: fontScale(10),
    marginLeft: horizontalScale(8),
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(8),
    maxHeight: verticalScale(80),
  },
  sendButton: {
    width: horizontalScale(36),
    height: verticalScale(36),
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 