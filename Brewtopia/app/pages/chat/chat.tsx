import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import { useState, useRef } from 'react';

interface SharedItem {
  image: any;
  title: string;
  location: string;
}

interface Message {
  id: string;
  sender: string;
  time: string;
  text?: string;
  images?: any[];
  sharedItem?: SharedItem;
  icon?: string;
}

export default function Chat() {
  const router = useRouter();
  const { chatId, chatName, isGroup } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Sample messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'What is the most popular meal in Japan?',
      sender: 'user',
      time: '11:40'
    },
    {
      id: '2',
      text: 'Do you like it?',
      sender: 'user',
      time: '11:41'
    },
    {
      id: '3',
      text: 'I think top two are:',
      sender: 'me',
      time: '11:42',
      images: [
        require('../../../assets/images/mon1.png'),
        require('../../../assets/images/mon2.png')
      ]
    },
    {
      id: '4',
      sender: 'me',
      time: '11:43',
      sharedItem: {
        image: require('../../../assets/images/cafe1.png'),
        title: 'COFFEE SHOP 1',
        location: '10 Km Left'
      }
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: (messages.length + 1).toString(),
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSendLike = () => {
    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      icon: 'thumb-up' as const,
      sender: 'me',
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
    setMessages([...messages, newMessage]);
    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
            placeholder="the"
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
    backgroundColor: '#FFEB3B20',
    borderRadius: moderateScale(8),
    padding: moderateScale(8),
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  sharedItemImage: {
    width: horizontalScale(50),
    height: horizontalScale(50),
    borderRadius: moderateScale(4),
  },
  sharedItemInfo: {
    flex: 1,
    marginLeft: horizontalScale(8),
  },
  sharedItemTitle: {
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  sharedItemLocation: {
    fontSize: fontScale(12),
    color: '#666',
  },
  checkmark: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(8),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  attachButton: {
    padding: moderateScale(8),
  },
  input: {
    flex: 1,
    height: verticalScale(40),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(16),
    marginHorizontal: horizontalScale(8),
    fontSize: fontScale(16),
  },
  inputActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: moderateScale(8),
  },
}); 