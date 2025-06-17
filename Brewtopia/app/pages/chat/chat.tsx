import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
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

export default function Chat() {
  const router = useRouter();
  const { chatId, chatName, isGroup } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        // Get current user data
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setCurrentUser(parsedUserData);
          socketService.setCurrentUser(parsedUserData._id);
        }

        // Get chat history
        const history = await chatService.getChatHistory(chatId as string);
        setMessages(history);

        // Connect to socket and join room
        socketService.connect();
        socketService.joinRoom(chatId as string, currentUser?._id);

        // Set up socket listeners
        socketService.on('receiveMessage', (msg: Message) => {
          setMessages(prev => [...prev, msg]);
        });

        socketService.on('systemMessage', (data: { message: string }) => {
          setMessages(prev => [...prev, { 
            _id: Date.now().toString(),
            sender: { _id: 'system', name: 'System' },
            message: data.message,
            createdAt: new Date().toISOString(),
            system: true
          }]);
        });

      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Không thể kết nối đến phòng chat');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      socketService.removeListener('receiveMessage');
      socketService.removeListener('systemMessage');
      if (currentUser) {
        socketService.leaveRoom(chatId as string, currentUser._id);
      }
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    const newMessage = {
      chatId,
      senderId: currentUser._id,
      message: message.trim()
    };

    // If chatting with AI
    if (chatName === 'BREWBOT') {
      try {
        // Send message to socket
        socketService.sendMessage(newMessage);

        // Get AI response
        const response = await sendMessageToGemini(message.trim());
        
        // Add AI response to messages
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          sender: {
            _id: 'ai',
            name: 'BREWBOT',
            avatar: require('../../../assets/images/bot1.png')
          },
          message: response.text,
          createdAt: new Date().toISOString()
        }]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        setError('Không thể gửi tin nhắn');
      }
    } else {
      // Normal chat
      socketService.sendMessage(newMessage);
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
            source={chatName === 'BREWBOT' ? require('../../../assets/images/bot1.png') : require('../../../assets/images/profile1.png')}
            style={styles.profileImage}
          />
          <Text style={styles.headerTitle}>{chatName}</Text>
        </View>
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
                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
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