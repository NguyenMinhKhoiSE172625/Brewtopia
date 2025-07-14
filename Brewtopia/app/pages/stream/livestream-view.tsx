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
  const { streamId } = params;
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [viewerCount, setViewerCount] = useState(50);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const cameraRef = useRef(null);

  // Find the selected livestream based on streamId
  const selectedStream = livestreamsData.find(stream => stream.id === streamId) || livestreamsData[0];
  
  // Set stream info based on selected stream
  const [streamInfo, setStreamInfo] = useState({
    id: selectedStream.id,
    shopName: selectedStream.shopName,
    shopLogo: selectedStream.shopLogo,
    title: selectedStream.streamTitle,
  });
  
  // Initialize viewer count from stream data
  useEffect(() => {
    if (selectedStream) {
      setViewerCount(selectedStream.viewerCount);
    }
  }, [selectedStream]);
  
  // Comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userName: 'WebSushi',
      userAvatar: require('../../../assets/images/avatar1.png'),
      text: 'Lorem ipsum is simply dummy text',
      timestamp: '2m ago'
    },
    {
      id: '2',
      userName: 'Dan Cruz',
      userAvatar: require('../../../assets/images/avatar2.png'),
      text: 'Lorem ipsum is simply dummy text, lorem ipsum dolor sit amet',
      timestamp: '1m ago'
    },
    {
      id: '3',
      userName: 'John Weed',
      userAvatar: require('../../../assets/images/avatar3.png'),
      text: 'Lorem ipsum is simply dummy text',
      timestamp: 'Just now'
    }
  ]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share livestream');
  };

  const handleSendComment = () => {
    if (commentText.trim() === '') return;
    
    // Add new comment
    const newComment: Comment = {
      id: (comments.length + 1).toString(),
      userName: 'You',
      userAvatar: require('../../../assets/images/profile1.png'),
      text: commentText,
      timestamp: 'Just now'
    };
    
    setComments([...comments, newComment]);
    setCommentText('');
  };
  
  // Simulating increasing viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prevCount => {
        const increase = Math.floor(Math.random() * 3);
        return prevCount + increase;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Xin quyền camera khi vào trang
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={item.userAvatar} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUserName}>{item.userName}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
      {item.id === '3' && (
        <TouchableOpacity style={styles.replyButton}>
          <AntDesign name="message1" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Hiện camera preview nếu đã cấp quyền, ngược lại hiện ảnh nền */}
      {permission === null ? (
        <View style={[styles.backgroundVideo, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ color: '#fff' }}>Đang kiểm tra quyền camera...</Text>
        </View>
      ) : !permission.granted ? (
        <View style={[styles.backgroundVideo, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ color: '#fff' }}>Không có quyền truy cập camera</Text>
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.backgroundVideo}
          facing={cameraType}
        />
      )}
      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.streamInfo}>
          <Image source={streamInfo.shopLogo} style={styles.shopLogo} />
          <Text style={styles.shopName}>{streamInfo.shopName}</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.followButton,
            isFollowing && styles.followingButton
          ]}
          onPress={handleFollow}
        >
          <AntDesign name={isFollowing ? "check" : "plus"} size={16} color="#FFFFFF" />
          <Text style={styles.followButtonText}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Stream Title */}
      <View style={styles.streamTitleContainer}>
        <Text style={styles.streamTitleText}>{selectedStream.streamTitle}</Text>
      </View>
      
      {/* Viewer Count */}
      <View style={styles.viewerCountContainer}>
        <Ionicons name="eye" size={18} color="#FFFFFF" />
        <Text style={styles.viewerCountText}>{viewerCount}+</Text>
      </View>
      
      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.commentsList}
        />
      </View>
      
      {/* Comment Input and Actions */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
        keyboardVerticalOffset={80}
      >
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Comment ..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={commentText}
            onChangeText={setCommentText}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSendComment}
            >
              <MaterialIcons name="send" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
            >
              <AntDesign 
                name={isLiked ? "heart" : "hearto"} 
                size={24} 
                color={isLiked ? "#FF4D67" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
}); 