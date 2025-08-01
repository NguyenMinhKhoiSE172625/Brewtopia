import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Modal, Dimensions, TouchableWithoutFeedback, FlatList, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';
import ApiService from '../utils/ApiService';
import socketService from '../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostImages from './PostImages';
import PostComments from './PostComments';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

interface ApiComment {
  _id: string;
  user?: string; // API trả về user ID thay vì object, có thể undefined
  content: string;
  createdAt: string;
  updatedAt: string;
  targetId: string;
  targetType: string;
  likes: any[];
}

interface PostProps {
  id: string;
  username: string;
  timestamp: string;
  imageUrl: any; // Can be single image or array of images
  caption: string;
  likes: number;
  comments: Comment[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Post({ id, username, timestamp, imageUrl, caption, likes: initialLikes, comments: initialComments }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Check if imageUrl is an array (multiple images) or single image
  const isMultipleImages = Array.isArray(imageUrl);
  const images = isMultipleImages ? imageUrl : [imageUrl];

  // Convert API comment to UI comment format
  const convertApiCommentToUIComment = (apiComment: ApiComment): Comment => {
    console.log('Converting comment:', JSON.stringify(apiComment, null, 2));
    console.log('User field:', apiComment.user, 'Type:', typeof apiComment.user);

    let username = 'Người dùng ẩn danh';
    if (apiComment.user && typeof apiComment.user === 'string') {
      username = `User ${apiComment.user.slice(-4)}`;
    }

    return {
      id: apiComment._id,
      username: username,
      text: apiComment.content,
      timestamp: formatTimestamp(apiComment.createdAt)
    };
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Vừa xong' : `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
              return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Fetch comments from API
  const fetchComments = async () => {
    if (commentsLoaded) return;

    try {
      setLoadingComments(true);
      const response = await ApiService.posts.getComments(id, 'Post');
      // API trả về array trực tiếp, không có property comments
      const uiComments = response.map(convertApiCommentToUIComment);
      setComments(uiComments);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error fetching comments:', error);
                Alert.alert('Lỗi', 'Tải bình luận thất bại. Vui lòng thử lại.');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = () => {
    if (!currentUserId) return;
    // Optimistic update
    setIsLiked(prev => !prev);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    // Emit socket event với đúng targetModel và userId
    socketService.emit('likeOrUnlike', {
      targetId: id,
      userId: currentUserId,
      targetModel: 'Post'
    });
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await ApiService.posts.addComment(id, newComment.trim(), 'Post');

        console.log('Add Comment API Response:', JSON.stringify(response, null, 2));
        console.log('Response user field:', response.user, 'Type:', typeof response.user);

        // Convert API response to UI format and add to comments
        try {
          const newCommentObj = convertApiCommentToUIComment(response);
          setComments([...comments, newCommentObj]);
          setNewComment('');
          console.log('Comment added successfully:', response);
        } catch (convertError) {
          console.error('Error converting comment:', convertError);
          // Fallback: Add comment with basic info
          const fallbackComment = {
            id: response._id || Date.now().toString(),
            username: 'You',
            text: newComment.trim(),
            timestamp: 'Vừa xong'
          };
          setComments([...comments, fallbackComment]);
          setNewComment('');
          Alert.alert('Thành công', 'Bình luận đã được thêm thành công!');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        Alert.alert('Lỗi', 'Thêm bình luận thất bại. Vui lòng thử lại.');
      }
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && !commentsLoaded) {
      fetchComments();
    }
  };

  const openImageViewer = (index: number = 0) => {
    setCurrentImageIndex(index);
    setImageViewVisible(true);
  };

  const closeImageViewer = () => {
    setImageViewVisible(false);
  };

  useEffect(() => {
    // Lấy userId hiện tại từ AsyncStorage
    const getUserId = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        setCurrentUserId(parsed._id);
      }
    };
    getUserId();
  }, []);

  // Khi load lại post, lấy trạng thái like từ API
  useEffect(() => {
    let isMounted = true;
    const fetchLikeStatus = async () => {
      if (!currentUserId) return;
      try {
        const API_URL = 'http://10.0.2.2:4000/api'; // hoặc import từ config/constants
        const res = await fetch(`${API_URL}/likes/${id}?targetModel=Post`);
        const data = await res.json();
        if (!isMounted) return;
        setLikes(Number(data.likeCount) || 0);
        // Nếu backend trả về likedByCurrentUser
        if (typeof data.likedByCurrentUser === 'boolean') {
          setIsLiked(data.likedByCurrentUser);
        } else if (Array.isArray(data.likedUserIds)) {
          setIsLiked(data.likedUserIds.includes(currentUserId));
        }
      } catch (e) {
        // fallback: không đổi trạng thái
      }
    };
    fetchLikeStatus();
    return () => { isMounted = false; };
  }, [id, currentUserId]);

  // Fetch comments chỉ khi showComments chuyển từ false sang true và chưa từng load
  useEffect(() => {
    let isMounted = true;
    if (showComments && !commentsLoaded) {
      (async () => {
        try {
          setLoadingComments(true);
          const response = await ApiService.posts.getComments(id, 'Post');
          const uiComments = response.map(convertApiCommentToUIComment);
          if (!isMounted) return;
          setComments(uiComments);
          setCommentsLoaded(true);
        } catch (error) {
          if (isMounted) {
            console.error('Error fetching comments:', error);
            Alert.alert('Lỗi', 'Tải bình luận thất bại. Vui lòng thử lại.');
          }
        } finally {
          if (isMounted) setLoadingComments(false);
        }
      })();
    }
    return () => { isMounted = false; };
  }, [showComments, commentsLoaded, id]);

  useEffect(() => {
    // Lắng nghe event likeOrUnlike từ server
    const onLikeOrUnlike = (data: any) => {
      if (data.targetId === id && data.targetModel === 'Post') {
        setLikes(Number(data.likeCount) || 0);
        // Nếu backend trả về userId vừa like/unlike
        if (data.userId && currentUserId) {
          if (data.userId === currentUserId) {
            setIsLiked(prev => !prev); // Toggle trạng thái like của chính mình
          }
        }
        // Nếu backend trả về likedByCurrentUser hoặc likedUserIds
        if (typeof data.likedByCurrentUser === 'boolean') {
          setIsLiked(data.likedByCurrentUser);
        } else if (Array.isArray(data.likedUserIds) && currentUserId) {
          setIsLiked(data.likedUserIds.includes(currentUserId));
        }
      }
    };
    socketService.on('likeOrUnlike', onLikeOrUnlike);
    return () => {
      socketService.removeListener('likeOrUnlike');
    };
  }, [id, currentUserId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/avatar1.png')} 
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>

      <PostImages
        images={images}
        openImageViewer={openImageViewer}
        currentImageIndex={currentImageIndex}
        imageViewVisible={imageViewVisible}
        closeImageViewer={closeImageViewer}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <MaterialIcons 
            name={isLiked ? "favorite" : "favorite-border"} 
            size={24} 
            color={isLiked ? "#FF0000" : "#6E543C"} 
          />
          <Text style={styles.actionText}>{Number.isFinite(likes) ? likes : 0} thích</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleComments}
        >
          <MaterialIcons name="comment" size={24} color="#6E543C" />
          <Text style={styles.actionText}>{comments.length} bình luận</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.caption}>{caption}</Text>

      {showComments && (
        <PostComments
          comments={comments}
          loadingComments={loadingComments}
          handleAddComment={handleAddComment}
          newComment={newComment}
          setNewComment={setNewComment}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
    padding: moderateScale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: horizontalScale(20),
  },
  headerInfo: {
    marginLeft: horizontalScale(12),
  },
  username: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#6E543C',
  },
  timestamp: {
    fontSize: fontScale(12),
    color: '#999999',
  },
  postImage: {
    width: '100%',
    height: verticalScale(300),
    borderRadius: moderateScale(8),
  },
  actions: {
    flexDirection: 'row',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  actionText: {
    marginLeft: horizontalScale(4),
    fontSize: fontScale(14),
    color: '#6E543C',
  },
  caption: {
    fontSize: fontScale(14),
    color: '#333333',
    marginTop: verticalScale(8),
  },
  commentsSection: {
    marginTop: verticalScale(12),
  },
  commentItem: {
    marginBottom: verticalScale(8),
    padding: moderateScale(8),
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
  },
  commentUsername: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#6E543C',
  },
  commentText: {
    fontSize: fontScale(14),
    color: '#333333',
    marginTop: verticalScale(2),
  },
  commentTimestamp: {
    fontSize: fontScale(12),
    color: '#999999',
    marginTop: verticalScale(2),
  },
  addCommentSection: {
    flexDirection: 'row',
    marginTop: verticalScale(12),
  },
  commentInput: {
    flex: 1,
    height: verticalScale(40),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(16),
    marginRight: horizontalScale(8),
  },
  postCommentButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
  },
  postCommentText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
  },
  loadingText: {
    marginLeft: horizontalScale(8),
    fontSize: fontScale(14),
    color: '#6E543C',
  },
  // Image viewer styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  // Image viewer modal styles
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imageViewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 5,
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Multiple images layout styles
  twoImagesContainer: {
    flexDirection: 'row',
    height: verticalScale(200),
  },
  halfImageContainer: {
    flex: 1,
    marginHorizontal: 1,
  },
  halfImage: {
    width: '100%',
    height: '100%',
  },

  threeImagesContainer: {
    flexDirection: 'row',
    height: verticalScale(200),
  },
  largeImageContainer: {
    flex: 2,
    marginRight: 2,
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  smallImagesColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  smallImageContainer: {
    height: '49%',
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },

  multipleImagesContainer: {
    height: verticalScale(200),
  },
  topRow: {
    flexDirection: 'row',
    height: '50%',
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    height: '50%',
  },
  quarterImageContainer: {
    flex: 1,
    marginHorizontal: 1,
    position: 'relative',
  },
  quarterImage: {
    width: '100%',
    height: '100%',
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    fontWeight: 'bold',
  },
});