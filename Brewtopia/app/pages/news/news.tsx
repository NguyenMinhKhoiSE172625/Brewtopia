import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, TextInput, Modal, Alert, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import Post from '../../components/Post';
import BottomBar from '../../components/BottomBar';
import SponsorBanner from '../../components/SponsorBanner';
import * as ImagePicker from 'expo-image-picker';
import { withAuth } from '../../components/withAuth';
import ApiService from '../../utils/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketService from '../../services/socketService';
import AppLoading from '../../components/AppLoading';
import useFetchData from '../../utils/useFetchData';

// Interface for API Post data
interface ApiPost {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    role: string;
    provider: string;
    isActive: boolean;
    points: number;
    createdAt: string;
    updatedAt: string;
    verificationCode: string | null;
  } | null;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  shareCount: number;
  commentCount: number;
}

// Interface for UI Post data (compatible with existing Post component)
interface UIPost {
  id: string;
  username: string;
  timestamp: string;
  imageUrl: any;
  caption: string;
  likes: number;
  comments: any[];
}

function News() {
  const router = useRouter();

  // State for posts and loading
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // Modal states
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratedCafe, setRatedCafe] = useState('');

  // New states for comments
  const [comments, setComments] = useState<Record<string, any[]>>({}); // { [postId]: [comment, ...] }
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({}); // { [postId]: string }
  const [currentUserId, setCurrentUserId] = useState('');

  // Thay thế toàn bộ state posts, loading, error, fetchPosts bằng:
  const {
    data: posts,
    loading,
    error,
    refetch: refetchPosts,
    reset: resetPosts
  } = useFetchData(async () => {
    const response = await ApiService.posts.getPosts(page, 10);
    if (!response || !Array.isArray(response.data)) return [];
    return response.data.map(convertApiPostToUIPost);
  }, [page]);

  // Function to convert API post to UI post format
  const convertApiPostToUIPost = (apiPost: ApiPost): UIPost => {
    let imageUrl;

    if (apiPost.images.length > 0) {
      // Always create array of image objects for consistency
      imageUrl = apiPost.images.map(img => ({ uri: img }));
    } else {
      // No images, use default avatar (single image format)
      imageUrl = require('../../../assets/images/avatar3.png');
    }

    return {
      id: apiPost._id,
      username: apiPost.user?.name || 'Anonymous',
      timestamp: formatTimestamp(apiPost.createdAt),
      imageUrl: imageUrl,
      caption: apiPost.content,
      likes: apiPost.likeCount,
      comments: [] // Comments will be loaded separately if needed
    };
  };

  // Function to format timestamp
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Vừa xong';
          } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      } else if (diffInDays === 1) {
        return '1 ngày trước';
      } else {
        return `${diffInDays} ngày trước`;
    }
  };

  // Load current user data
  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Load more posts (pagination)
  const loadMorePosts = () => {
    if (!loading && hasMorePosts) {
      const nextPage = page + 1;
      setPage(nextPage);
      refetchPosts(nextPage, false);
    }
  };

  // Refresh posts
  const onRefresh = () => {
    refetchPosts(1, true);
  };

  // useEffect to load data on component mount
  useEffect(() => {
    loadCurrentUser();
    refetchPosts(1, false);
  }, []);

  useEffect(() => {
    // Lấy userId từ AsyncStorage
    AsyncStorage.getItem('userId').then(id => {
      if (id) setCurrentUserId(id);
    });
  }, []);

  useEffect(() => {
    // Lắng nghe like realtime
    socketService.on('like:update', ({ targetId, likeChange, targetModel }) => {
      if (targetModel === 'Post') {
        resetPosts(prev =>
          prev.map(post =>
            post.id === targetId
              ? { ...post, likes: (post.likes || 0) + likeChange }
              : post
          )
        );
      }
    });

    // Lắng nghe comment realtime
    socketService.on('comment:update', ({ action, comment }) => {
      if (action === 'create' && comment.targetType === 'Post') {
        setComments(prev => ({
          ...prev,
          [comment.targetId]: [...(prev[comment.targetId] || []), comment]
        }));
      }
      if (action === 'delete' && comment.targetType === 'Post') {
        setComments(prev => ({
          ...prev,
          [comment.targetId]: (prev[comment.targetId] || []).filter(c => c._id !== comment._id)
        }));
      }
    });

    return () => {
      socketService.removeListener('like:update');
      socketService.removeListener('comment:update');
    };
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
              Alert.alert('Quyền truy cập bị từ chối', 'Vui lòng cho phép truy cập thư viện ảnh để chọn hình ảnh.');
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
              Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn hình ảnh.');
      console.error(error);
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages(prev => prev.filter(imageUri => imageUri !== uri));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedImages.length === 0) {
      return;
    }

    try {
      setLoading(true);

      // Prepare content with rating if exists
      let content = newPostContent.trim();
      if (rating > 0) {
        content += `\n\nĐánh giá ${ratedCafe || 'quán này'}: ${rating}⭐`;
      }

      // Create post via API
      await ApiService.posts.createPost(content, selectedImages);

      // Reset form
      setNewPostContent('');
      setSelectedImages([]);
      setRating(0);
      setRatedCafe('');
      setShowPostModal(false);

      // Refresh posts to show the new post
      refetchPosts(1, true);

              Alert.alert('Thành công', 'Bài đăng đã được tạo thành công!');

    } catch (error) {
      console.error('Error creating post:', error);
              Alert.alert('Lỗi', 'Tạo bài đăng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = () => {
    setShowRatingModal(true);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => setRating(i)}
          style={styles.starContainer}
        >
          <FontAwesome 
            name={i <= rating ? 'star' : 'star-o'} 
            size={30} 
            color="#F8B740" 
          />
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.starsContainer}>
        {stars}
      </View>
    );
  };

  // Function to render posts with sponsor banners in between
  const renderPostsWithSponsors = () => {
    const safePosts = Array.isArray(posts) ? posts : [];
    const result = [];
    
    // Add create post card
    result.push(
      <View key="create-post" style={styles.createPostCard}>
        <View style={styles.createPostHeader}>
          <Image 
            source={require('../../../assets/images/avatar3.png')} 
            style={styles.createPostAvatar} 
          />
          <TouchableOpacity 
            style={styles.createPostInput}
            onPress={() => setShowPostModal(true)}
          >
            <Text style={styles.createPostPlaceholder}>Bạn đang nghĩ gì?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.createPostActions}>
          <TouchableOpacity 
            style={styles.createPostAction}
            onPress={() => {
              setShowPostModal(true);
              setTimeout(pickImages, 500);
            }}
          >
            <MaterialIcons name="photo-library" size={24} color="#6E543C" />
            <Text style={styles.createPostActionText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createPostAction}>
            <MaterialIcons name="location-on" size={24} color="#6E543C" />
            <Text style={styles.createPostActionText}>Check in</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.createPostAction}
            onPress={() => {
              setShowPostModal(true);
              setTimeout(openRatingModal, 500);
            }}
          >
            <MaterialIcons name="star" size={24} color="#6E543C" />
            <Text style={styles.createPostActionText}>Rate</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
    
    // Add posts with sponsor banners in between
    safePosts.forEach((post, index) => {
      // Add the post
      result.push(<Post key={post.id} {...post} />);
      
      // After every 2 posts (0, 2, 4, etc.), add a sponsor banner
      if (index % 2 === 1 && index < safePosts.length - 1) {
        result.push(
          <SponsorBanner 
            key={`sponsor-${index}`} 
            title={index === 1 ? "Sponsored Cafes" : "Discover New Flavors"} 
          />
        );
      }
    });
    
    return result;
  };

  const renderImageItem = ({ item }: { item: string }) => (
    <View style={styles.selectedImageContainer}>
      <Image source={{ uri: item }} style={styles.selectedImage} />
      <TouchableOpacity 
        style={styles.removeImageButton}
        onPress={() => removeImage(item)}
      >
        <MaterialIcons name="close" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const handleLike = (postId: string) => {
    if (!currentUserId) return;
    (socketService as any).emit('likeOrUnlike', {
      targetId: postId,
      userId: currentUserId,
      targetModel: 'Post'
    });
  };

  const handleSendComment = (postId: string) => {
    if (!currentUserId || !commentInputs[postId]?.trim()) return;
    (socketService as any).emit('comment:create', {
      targetId: postId,
      userId: currentUserId,
      targetType: 'Post',
      content: commentInputs[postId]
    });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BrewNews</Text>
        <TouchableOpacity 
          style={styles.postButton}
          onPress={() => setShowPostModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#6E543C" />
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#6E543C']}
            tintColor="#6E543C"
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom) {
            loadMorePosts();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Loading indicator for initial load */}
        {loading && (Array.isArray(posts) ? posts.length : 0) === 0 ? (
          <View style={styles.loadingContainer}>
            <AppLoading text="Loading posts..." />
          </View>
        ) : (
          <>
            {/* Render posts with sponsor banners */}
            {renderPostsWithSponsors()}

            {/* Loading indicator for pagination */}
            {loading && (Array.isArray(posts) ? posts.length : 0) > 0 && (
              <View style={styles.paginationLoading}>
                <AppLoading text="Loading more posts..." size="small" />
              </View>
            )}

            {/* End of posts message */}
            {!hasMorePosts && (Array.isArray(posts) ? posts.length : 0) > 0 && (
              <View style={styles.endOfPostsContainer}>
                <Text style={styles.endOfPostsText}>You've reached the end!</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPostModal(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Tạo bài đăng</Text>
              <TouchableOpacity 
                style={[
                  styles.postButton,
                  (!newPostContent.trim() && selectedImages.length === 0) && styles.postButtonDisabled
                ]}
                onPress={handleCreatePost}
                disabled={!newPostContent.trim() && selectedImages.length === 0}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalUserInfo}>
              <Image
                source={require('../../../assets/images/avatar3.png')}
                style={styles.modalAvatar}
              />
              <View>
                <Text style={styles.modalUserName}>{currentUser?.name || 'You'}</Text>
                <View style={styles.modalLocationPicker}>
                  <MaterialIcons name="location-on" size={16} color="#6E543C" />
                  <Text style={styles.modalLocationText}>Add location</Text>
                </View>
              </View>
            </View>
            
            {selectedImages.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                <FlatList
                  data={selectedImages}
                  renderItem={renderImageItem}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}
            
            {rating > 0 && (
              <View style={styles.ratingPreview}>
                <Text style={styles.ratingText}>Đánh giá của bạn cho {ratedCafe || 'quán này'}: {rating} ⭐</Text>
              </View>
            )}
            
            <TextInput
              style={styles.modalInput}
              placeholder="Bạn đang nghĩ gì?"
              placeholderTextColor="#999"
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalAction}
                onPress={pickImages}
              >
                <MaterialIcons name="photo-library" size={24} color="#6E543C" />
                <Text style={styles.modalActionText}>Add Photos</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalAction}
                onPress={openRatingModal}
              >
                <MaterialIcons name="star" size={24} color="#6E543C" />
                <Text style={styles.modalActionText}>Thêm đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.ratingModalOverlay}>
          <View style={styles.ratingModalContent}>
            <Text style={styles.ratingModalTitle}>Đánh giá quán này</Text>
            
            <TextInput
              style={styles.ratingCafeInput}
              placeholder="Cafe name"
              placeholderTextColor="#999"
              value={ratedCafe}
              onChangeText={setRatedCafe}
            />
            
            {renderStars()}
            
            <View style={styles.ratingModalActions}>
              <TouchableOpacity 
                style={[styles.ratingModalButton, styles.ratingModalCancelButton]}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.ratingModalCancelText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.ratingModalButton, 
                  styles.ratingModalSubmitButton,
                  rating === 0 && styles.ratingModalSubmitButtonDisabled
                ]}
                onPress={() => setShowRatingModal(false)}
                disabled={rating === 0}
              >
                <Text style={styles.ratingModalSubmitText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#6E543C',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    marginLeft: horizontalScale(4),
    color: '#6E543C',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: moderateScale(16),
  },
  createPostCard: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  createPostAvatar: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(12),
  },
  createPostInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: moderateScale(12),
    borderRadius: moderateScale(20),
  },
  createPostPlaceholder: {
    color: '#999',
    fontSize: fontScale(14),
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: verticalScale(12),
  },
  createPostAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createPostActionText: {
    marginLeft: horizontalScale(4),
    color: '#6E543C',
    fontSize: fontScale(14),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#000000',
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  modalAvatar: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(12),
  },
  modalUserName: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#000000',
  },
  modalLocationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  modalLocationText: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginLeft: horizontalScale(4),
  },
  modalInput: {
    flex: 1,
    padding: moderateScale(16),
    fontSize: fontScale(16),
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalActionText: {
    marginLeft: horizontalScale(4),
    color: '#6E543C',
    fontSize: fontScale(14),
  },
  // New styles for images and rating
  selectedImagesContainer: {
    padding: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  selectedImageContainer: {
    marginRight: horizontalScale(10),
    position: 'relative',
  },
  selectedImage: {
    width: horizontalScale(80),
    height: verticalScale(80),
    borderRadius: moderateScale(10),
  },
  removeImageButton: {
    position: 'absolute',
    top: verticalScale(5),
    right: horizontalScale(5),
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: horizontalScale(24),
    height: verticalScale(24),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingPreview: {
    backgroundColor: '#FFF9E6',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginHorizontal: horizontalScale(16),
    marginTop: verticalScale(10),
  },
  ratingText: {
    fontSize: fontScale(14),
    color: '#6E543C',
  },
  ratingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    padding: moderateScale(20),
    alignItems: 'center',
  },
  ratingModalTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(20),
  },
  ratingCafeInput: {
    width: '100%',
    height: verticalScale(45),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: moderateScale(10),
    paddingHorizontal: horizontalScale(15),
    fontSize: fontScale(16),
    marginBottom: verticalScale(20),
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  starContainer: {
    padding: moderateScale(5),
  },
  ratingModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  ratingModalButton: {
    flex: 1,
    height: verticalScale(45),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: horizontalScale(5),
  },
  ratingModalCancelButton: {
    backgroundColor: '#F5F5F5',
  },
  ratingModalCancelText: {
    color: '#6E543C',
    fontSize: fontScale(16),
    fontWeight: '500',
  },
  ratingModalSubmitButton: {
    backgroundColor: '#6E543C',
  },
  ratingModalSubmitButtonDisabled: {
    opacity: 0.5,
  },
  ratingModalSubmitText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '500',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(50),
  },
  paginationLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  endOfPostsContainer: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
  endOfPostsText: {
    fontSize: fontScale(14),
    color: '#999999',
    fontStyle: 'italic',
  },
});

export default withAuth(News); 