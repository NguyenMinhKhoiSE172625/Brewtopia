import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketService from '../../services/socketService';
import chatService from '../../services/chatService';
import { sendMessageToGemini } from '../../services/geminiService';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  createdAt: string;
  system?: boolean;
}

const AI_HISTORY_KEY = 'ai_chat_history';
const AI_FEATURES_DESC = `
Bạn là trợ lý cho app Brewtopia. App này có các tính năng: đặt bàn, đặt đồ uống, chat với quán, xem tin tức, tích điểm thưởng, đổi quà, thanh toán, hỗ trợ tài khoản, xem ưu đãi, livestream, v.v...
Nếu người dùng hỏi về các tính năng này, hãy hướng dẫn chi tiết cách sử dụng, chỉ dẫn rõ ràng các bước thao tác hoặc vị trí nút bấm trên app.
Nếu người dùng hỏi về một tính năng mà app chưa có, hãy trả lời: “Tính năng này đang được phát triển, bạn vui lòng chờ các bản cập nhật tiếp theo.”
Hãy trả lời thân thiện, ngắn gọn, dễ hiểu.
`;
export default function Chat() {
  const router = useRouter();
  const { chatId, chatName, isGroup } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const realChatIdRef = useRef<string>('');
  const [socketStatus, setSocketStatus] = useState<any>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        // Get current user data
        const userData = await AsyncStorage.getItem('user_data');
        let parsedUserData = null;
        if (userData) {
          parsedUserData = JSON.parse(userData);
          setCurrentUser(parsedUserData);
          socketService.setCurrentUser(parsedUserData._id);
        }

        // Nếu là chat với AI thì không gọi API, không join socket, không set listener
        if (chatId === 'ai') {
          // Load lịch sử chat AI từ AsyncStorage
          const aiHistory = await AsyncStorage.getItem(AI_HISTORY_KEY);
          setMessages(aiHistory ? JSON.parse(aiHistory) : []);
          setLoading(false);
          return;
        }

        // Get chat history
        realChatIdRef.current = Array.isArray(chatId) ? String(chatId[0]) : String(chatId);
        const history = await chatService.getChatHistory(String(realChatIdRef.current));
        setMessages(history);

        // Set up socket listeners TRƯỚC KHI connect
        socketService.on('receiveMessage', (msg: Message) => {
          console.log('🔥 Socket received message:', msg);
          // Map sender thành object nếu là string
          let senderObj = msg.sender;
          if (typeof msg.sender === 'string') {
            senderObj = { _id: msg.sender, name: 'Người dùng', avatar: undefined };
          }
          const fixedMsg = { ...msg, sender: senderObj };

          setMessages(prev => {
            if (prev.some(m => m._id === fixedMsg._id)) return prev;
            console.log('🔥 Adding new message to UI:', fixedMsg.message);
            return [...prev, fixedMsg];
          });
        });

        socketService.on('systemMessage', (data: { message: string }) => {
          console.log('🔥 Socket received system message:', data);
          setMessages(prev => [...prev, { 
            _id: Date.now().toString(),
            sender: { _id: 'system', name: 'System' },
            message: data.message,
            createdAt: new Date().toISOString(),
            system: true
          }]);
        });

        // Connect to socket SAU KHI đã set listeners
        console.log('🔥 Connecting to socket...');
        const connected = await socketService.connect();
        console.log('🔥 Socket connection result:', connected);
        
        // Join room sau khi đã connect
        if (parsedUserData && connected) {
          console.log('🔥 Joining room:', realChatIdRef.current, 'with user:', parsedUserData._id);
          const joined = await socketService.joinRoom(String(realChatIdRef.current), parsedUserData._id);
          console.log('🔥 Room join result:', joined);
        }

        // Cập nhật socket status để debug
        const status = socketService.getConnectionStatus();
        setSocketStatus(status);
        console.log('🔥 Final socket status:', status);

      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Không thể kết nối đến phòng chat');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      // Nếu là AI thì không cleanup socket
      if (chatId === 'ai') return;
      socketService.removeListener('receiveMessage');
      socketService.removeListener('systemMessage');
      if (currentUser) {
        socketService.leaveRoom(String(realChatIdRef.current), currentUser._id);
      }
    };
  }, [chatId]);

  const handleClearAIHistory = async () => {
    Alert.alert(
      'Xóa lịch sử',
      'Bạn có chắc muốn xóa toàn bộ lịch sử chat với BREWBOT?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem(AI_HISTORY_KEY);
          setMessages([]);
        }}
      ]
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    // Nếu là AI chỉ xử lý local và Gemini
    if (chatName === 'BREWBOT' || chatId === 'ai') {
      try {
        // Thêm tin nhắn người dùng vào state
        const userMsg = {
          _id: Date.now().toString(),
          sender: {
            _id: currentUser._id,
            name: currentUser.name,
            avatar: currentUser.avatar || require('../../../assets/images/profile1.png')
          },
          message: message.trim(),
          createdAt: new Date().toISOString()
        };
        setMessages(prev => {
          const newMsgs = [...prev, userMsg, {
            _id: (Date.now() + 1).toString(),
            sender: {
              _id: 'ai',
              name: 'BREWBOT',
              avatar: require('../../../assets/images/bot1.png')
            },
            message: 'Đang soạn trả lời...',
            createdAt: new Date().toISOString()
          }];
          AsyncStorage.setItem(AI_HISTORY_KEY, JSON.stringify(newMsgs));
          return newMsgs;
        });
        setMessage('');

        // Gửi prompt có prepend mô tả tính năng app
        const prompt = `${AI_FEATURES_DESC}\nNgười dùng: ${message.trim()}`;
        const response = await sendMessageToGemini(prompt);

        // Thay thế "Đang soạn trả lời..." bằng câu trả lời thật
        setMessages(prev => {
          const idx = prev.findIndex(m => m.sender._id === 'ai' && m.message === 'Đang soạn trả lời...');
          if (idx !== -1) {
            const newMsgs = [...prev];
            newMsgs[idx] = {
              _id: (Date.now() + 2).toString(),
              sender: {
                _id: 'ai',
                name: 'BREWBOT',
                avatar: require('../../../assets/images/bot1.png')
              },
              message: response.text,
              createdAt: new Date().toISOString()
            };
            AsyncStorage.setItem(AI_HISTORY_KEY, JSON.stringify(newMsgs));
            return newMsgs;
          }
          return prev;
        });
      } catch (error) {
        setError('Không thể gửi tin nhắn');
      }
      return;
    }

    // Gửi lên server
    if (chatName === 'BREWBOT') {
      try {
        socketService.sendMessage({
          chatId: String(realChatIdRef.current),
          senderId: currentUser._id,
          message: message.trim()
        });

        // Lấy phản hồi AI
        const response = await sendMessageToGemini(message.trim());
        setMessages(prev => [...prev, {
          _id: (Date.now() + 1).toString(),
          sender: {
            _id: 'ai',
            name: 'BREWBOT',
            avatar: require('../../../assets/images/bot1.png')
          },
          message: response.text,
          createdAt: new Date().toISOString()
        }]);
      } catch (error) {
        setError('Không thể gửi tin nhắn');
      }
    } else {
      console.log('🔥 Sending message via socket:', {
        chatId: String(realChatIdRef.current),
        senderId: currentUser._id,
        message: message.trim()
      });
      
      socketService.sendMessage({
        chatId: String(realChatIdRef.current),
        senderId: currentUser._id,
        message: message.trim()
      });
      
      // Debug: check socket status sau khi gửi
      const statusAfterSend = socketService.getConnectionStatus();
      console.log('🔥 Socket status after sending:', statusAfterSend);
    }

    setMessage('');
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6E543C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={(() => {
              if (chatName === 'BREWBOT') {
                return require('../../../assets/images/bot1.png');
              }
              // Tìm avatar user đối phương trong messages (nếu có participants thì nên lấy từ participants)
              const otherMsg = messages.find(m => m.sender && m.sender._id !== currentUser?._id && m.sender._id !== 'system');
              let avatar = otherMsg?.sender?.avatar;
              if (!avatar || avatar === 'false') {
                // random avatar từ randomuser.me dựa vào id
                const id = otherMsg?.sender?._id || 'default';
                const hash = Math.abs(id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 100;
                return { uri: `https://randomuser.me/api/portraits/men/${hash}.jpg` };
              }
              return typeof avatar === 'string' ? { uri: avatar } : avatar;
            })()}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.headerTitle}>{chatName}</Text>
            {socketStatus && chatId !== 'ai' && (
              <Text style={[styles.socketStatus, { color: socketStatus.connected ? '#4CAF50' : '#F44336' }]}>
                Socket: {socketStatus.connected ? '✅ Kết nối' : '❌ Ngắt kết nối'}
              </Text>
            )}
          </View>
        </View>
        {chatId !== 'ai' && (
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={() => {
              const status = socketService.getConnectionStatus();
              setSocketStatus(status);
              Alert.alert('Socket Debug', `
Connected: ${status.connected}
Socket ID: ${status.socketId || 'None'}
User ID: ${status.currentUserId || 'None'}
Attempts: ${status.connectionAttempts}
              `);
            }}
          >
            <MaterialIcons name="bug-report" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messageContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            msg.system ? null : (
              <View 
                key={msg._id}
                style={[
                  styles.messageWrapper,
                  msg.sender._id === currentUser?._id ? styles.myMessage : styles.otherMessage
                ]}
              >
                {!msg.system && msg.sender._id !== currentUser?._id && (
                  <Image 
                    source={msg.sender.avatar || require('../../../assets/images/profile1.png')}
                    style={styles.messageAvatar}
                  />
                )}
                <View style={[
                  styles.messageBubble,
                  msg.sender._id === currentUser?._id ? styles.myBubble : styles.otherBubble,
                  msg.system && styles.systemBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.sender._id === currentUser?._id ? styles.myMessageText : styles.otherMessageText,
                    msg.system && styles.systemMessageText
                  ]}>{msg.message}</Text>
                </View>
                <Text style={styles.messageTime}>
                  {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime())
                    ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </Text>
              </View>
            )
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <MaterialIcons name="send" size={24} color="#6E543C" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <MaterialIcons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {chatId === 'ai' && (
        <TouchableOpacity style={{position: 'absolute', top: 10, right: 16, zIndex: 10}} onPress={handleClearAIHistory}>
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5EA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: horizontalScale(12),
  },
  socketStatus: {
    fontSize: fontScale(12),
    marginLeft: horizontalScale(12),
    marginTop: verticalScale(2),
  },
  debugButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImage: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: horizontalScale(20),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    padding: moderateScale(16),
  },
  messageWrapper: {
    marginBottom: verticalScale(16),
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageAvatar: {
    width: horizontalScale(30),
    height: verticalScale(30),
    borderRadius: horizontalScale(15),
    marginRight: horizontalScale(8),
  },
  messageBubble: {
    padding: moderateScale(12),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(4),
  },
  myBubble: {
    backgroundColor: '#6E543C',
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
  },
  systemBubble: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'center',
    marginVertical: verticalScale(8),
  },
  messageText: {
    fontSize: fontScale(16),
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  systemMessageText: {
    color: '#666666',
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: fontScale(12),
    color: '#666666',
    alignSelf: 'flex-end',
    marginTop: verticalScale(4),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    minHeight: verticalScale(40),
    maxHeight: verticalScale(100),
    backgroundColor: '#F2F2F7',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    fontSize: fontScale(16),
  },
  sendButton: {
    marginLeft: horizontalScale(12),
    width: horizontalScale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    bottom: verticalScale(80),
    left: horizontalScale(16),
    right: horizontalScale(16),
    backgroundColor: '#FF3B30',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    flex: 1,
    marginRight: horizontalScale(8),
  },
}); 