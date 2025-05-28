import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SharedItem {
  image: any;
  title: string;
  location: string;
}

interface SharedCafe {
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

interface Message {
  id: string;
  sender: string;
  time: string;
  text?: string;
  images?: any[];
  sharedItem?: SharedItem;
  sharedCafe?: SharedCafe;
  icon?: string;
  timestamp?: string;
}

export default function Chat() {
  const router = useRouter();
  const { chatId, chatName, isGroup } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize with empty messages
  const [messages, setMessages] = useState<Message[]>([]);

  // Load messages from AsyncStorage
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const chatMessagesKey = `chat_messages_${chatId}`;
        const messagesStr = await AsyncStorage.getItem(chatMessagesKey);
        
        if (messagesStr) {
          const loadedMessages = JSON.parse(messagesStr);
          
          // Format messages for display
          const formattedMessages = loadedMessages.map((msg: any) => {
            const messageTime = msg.timestamp 
              ? new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })
              : msg.time || '00:00';
              
            return {
              ...msg,
              time: messageTime
            };
          });
          
          setMessages(formattedMessages);
        } else {
          // Sample messages if no saved messages
          setMessages([
            {
              id: '1',
              text: 'Hi there!',
              sender: 'user',
              time: '11:40'
            },
            {
              id: '2',
              text: 'How are you?',
              sender: 'me',
              time: '11:41'
            }
          ]);
        }
        
        // Scroll to bottom after loading messages
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 200);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    loadMessages();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      // Create new message
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setMessage('');
      
      // Save to AsyncStorage
      try {
        const chatMessagesKey = `chat_messages_${chatId}`;
        await AsyncStorage.setItem(chatMessagesKey, JSON.stringify(updatedMessages));
      } catch (error) {
        console.error('Error saving message:', error);
      }
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSendLike = async () => {
    const newMessage: Message = {
      id: Date.now().toString(),
      icon: 'thumb-up' as const,
      sender: 'me',
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Save to AsyncStorage
    try {
      const chatMessagesKey = `chat_messages_${chatId}`;
      await AsyncStorage.setItem(chatMessagesKey, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error saving like message:', error);
    }
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  const handleViewSharedCafe = (cafe: SharedCafe) => {
    // Navigate to map screen with cafe location
    router.push({
      pathname: '/pages/nearby',
      params: { 
        focusCafeId: cafe.cafeId,
        latitude: cafe.coordinate.latitude,
        longitude: cafe.coordinate.longitude
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {isGroup === 'true' ? (
            <Image 
              source={require('../../../assets/images/cafe1.png')}
              style={styles.groupImage}
            />
          ) : (
            <Image 
              source={require('../../../assets/images/profile1.png')}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.headerTitle}>{chatName}</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          style={styles.messageContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.sender === 'me' ? styles.myMessage : styles.otherMessage
              ]}
            >
              {msg.text && (
                <View style={[
                  styles.messageBubble,
                  msg.sender === 'me' ? styles.myBubble : styles.otherBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText
                  ]}>{msg.text}</Text>
                </View>
              )}
              
              {msg.images && (
                <View style={styles.imageContainer}>
                  {msg.images.map((img, index) => (
                    <Image 
                      key={index}
                      source={img}
                      style={styles.messageImage}
                    />
                  ))}
                  <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.checkmark} />
                </View>
              )}

              {msg.sharedItem && (
                <View style={[styles.messageWrapper]}>
                  <View style={styles.sharedItemContainer}>
                    <Image source={msg.sharedItem.image} style={styles.sharedItemImage} />
                    <View style={styles.sharedItemInfo}>
                      <Text style={styles.sharedItemTitle}>{msg.sharedItem.title}</Text>
                      <Text style={styles.sharedItemLocation}>{msg.sharedItem.location}</Text>
                    </View>
                    <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.checkmark} />
                  </View>
                </View>
              )}
              
              {msg.sharedCafe && (
                <TouchableOpacity 
                  style={styles.sharedCafeContainer}
                  onPress={() => handleViewSharedCafe(msg.sharedCafe!)}
                >
                  <View style={styles.sharedCafeContent}>
                    <View style={styles.sharedCafeHeader}>
                      <MaterialIcons name="store" size={20} color="#6E543C" />
                      <Text style={styles.sharedCafeTitle}>{msg.sharedCafe.cafeName}</Text>
                    </View>
                    <Text style={styles.sharedCafeAddress}>{msg.sharedCafe.cafeAddress}</Text>
                    <View style={styles.sharedCafeFooter}>
                      <MaterialIcons name="place" size={16} color="#6E543C" />
                      <Text style={styles.viewOnMapText}>View on map</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {msg.icon && (
                <View style={[
                  styles.messageBubble,
                  msg.sender === 'me' ? styles.myBubble : styles.otherBubble,
                  styles.iconBubble
                ]}>
                  <MaterialIcons 
                    name={msg.icon as any}
                    size={24} 
                    color={msg.sender === 'me' ? '#FFFFFF' : '#000000'} 
                  />
                </View>
              )}

              <Text style={styles.messageTime}>{msg.time}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#000" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Message"
            placeholderTextColor="#999"
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="sentiment-satisfied" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSendLike}
            >
              <MaterialIcons name="thumb-up" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    height: horizontalScale(40),
    borderRadius: horizontalScale(20),
  },
  groupImage: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: horizontalScale(8),
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
  },
  messageBubble: {
    padding: moderateScale(12),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(4),
  },
  myBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
  },
  iconBubble: {
    padding: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
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
  messageTime: {
    fontSize: fontScale(12),
    color: '#666666',
    alignSelf: 'flex-end',
    marginTop: verticalScale(4),
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
    marginBottom: verticalScale(4),
  },
  messageImage: {
    width: horizontalScale(120),
    height: horizontalScale(120),
    borderRadius: moderateScale(8),
  },
  sharedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sharedItemImage: {
    width: horizontalScale(60),
    height: horizontalScale(60),
    borderRadius: moderateScale(8),
    marginRight: horizontalScale(12),
  },
  sharedItemInfo: {
    flex: 1,
  },
  sharedItemTitle: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: verticalScale(4),
  },
  sharedItemLocation: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  checkmark: {
    position: 'absolute',
    bottom: moderateScale(4),
    right: moderateScale(4),
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
    height: verticalScale(40),
    backgroundColor: '#F2F2F7',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(16),
    fontSize: fontScale(16),
  },
  attachButton: {
    marginRight: horizontalScale(8),
  },
  inputActions: {
    flexDirection: 'row',
    marginLeft: horizontalScale(8),
  },
  actionButton: {
    marginLeft: horizontalScale(12),
  },
  // Shared cafe styling
  sharedCafeContainer: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    marginBottom: verticalScale(4),
  },
  sharedCafeContent: {
    padding: moderateScale(12),
  },
  sharedCafeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  sharedCafeTitle: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#6E543C',
    marginLeft: horizontalScale(6),
  },
  sharedCafeAddress: {
    fontSize: fontScale(14),
    color: '#666',
    marginBottom: verticalScale(8),
    paddingLeft: horizontalScale(26),
  },
  sharedCafeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewOnMapText: {
    fontSize: fontScale(14),
    color: '#6E543C',
    fontWeight: '500',
    marginLeft: horizontalScale(6),
  }
}); 