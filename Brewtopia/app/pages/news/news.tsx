import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, ScrollView, FlatList, Dimensions, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import BottomBar from '../../components/BottomBar';

interface Post {
  id: string;
  user: {
    name: string;
    avatar: any;
  };
  location: string;
  rating: number;
  time: string;
  content: string;
  images: any[];
  likes: number;
  comments: number;
  isLiked: boolean;
}

export default function News() {
  const router = useRouter();
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      user: {
        name: 'John Weed',
        avatar: require('../../../assets/images/avatar1.png'),
      },
      location: 'Highway coffee',
      rating: 5,
      time: '1 day ago',
      content: 'Chillax with my hot coffee ☕',
      images: [
        require('../../../assets/images/cafe1.png'),
        require('../../../assets/images/cafe2.png'),
      ],
      likes: 12,
      comments: 3,
      isLiked: false,
    },
    {
      id: '2',
      user: {
        name: 'Daniel',
        avatar: require('../../../assets/images/avatar2.png'),
      },
      location: 'Haz coffeeshop',
      rating: 4,
      time: '1 day ago',
      content: 'Just enjoy this time ...',
      images: [
        require('../../../assets/images/cafe3.png'),
      ],
      likes: 8,
      comments: 1,
      isLiked: false,
    },
  ]);

  const sponsorBanners = [
    require('../../../assets/images/ads1.png'),
    require('../../../assets/images/ads2.png'),
    require('../../../assets/images/ads3.png'),
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentBannerIndex + 1) % sponsorBanners.length;
      bannerRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentBannerIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const newPost: Post = {
        id: (posts.length + 1).toString(),
        user: {
          name: 'You',
          avatar: require('../../../assets/images/avatar3.png'),
        },
        location: 'Your location',
        rating: 5,
        time: 'Just now',
        content: newPostContent,
        images: [],
        likes: 0,
        comments: 0,
        isLiked: false,
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setShowPostModal(false);
    }
  };

  const renderPost = ({ item: post }: { item: Post }) => (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={post.user.avatar} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{post.user.name}</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.timeText}>was at</Text>
              <MaterialIcons name="location-on" size={16} color="#FF0000" />
              <Text style={styles.locationText}>{post.location}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.timeText}>{post.time}</Text>
              <View style={styles.stars}>
                {[...Array(5)].map((_, index) => (
                  <MaterialIcons
                    key={index}
                    name="star"
                    size={16}
                    color={index < post.rating ? '#FFD700' : '#D3D3D3'}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Post Images */}
      <View style={styles.imageGrid}>
        {post.images.map((image, index) => (
          <Image key={index} source={image} style={styles.postImage} />
        ))}
      </View>

      {/* Post Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <MaterialIcons 
            name={post.isLiked ? "favorite" : "favorite-border"} 
            size={24} 
            color={post.isLiked ? "#FF0000" : "#000"} 
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="chat-bubble-outline" size={24} color="#000" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSponsorBanner = ({ item }: { item: any }) => (
    <Image
      source={item}
      style={styles.sponsorBanner}
      resizeMode="cover"
    />
  );

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

      <ScrollView style={styles.content}>
        {/* Create Post Card */}
        <View style={styles.createPostCard}>
          <View style={styles.createPostHeader}>
            <Image 
              source={require('../../../assets/images/avatar3.png')} 
              style={styles.createPostAvatar} 
            />
            <TouchableOpacity 
              style={styles.createPostInput}
              onPress={() => setShowPostModal(true)}
            >
              <Text style={styles.createPostPlaceholder}>What's on your mind?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.createPostActions}>
            <TouchableOpacity style={styles.createPostAction}>
              <MaterialIcons name="photo-library" size={24} color="#6E543C" />
              <Text style={styles.createPostActionText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createPostAction}>
              <MaterialIcons name="location-on" size={24} color="#6E543C" />
              <Text style={styles.createPostActionText}>Check in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createPostAction}>
              <MaterialIcons name="star" size={24} color="#6E543C" />
              <Text style={styles.createPostActionText}>Rate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts */}
        {posts.map((post) => (
          <View key={post.id}>
            {renderPost({ item: post })}
          </View>
        ))}

        {/* Sponsored Section */}
        <View style={styles.sponsoredSection}>
          <Text style={styles.sponsoredTitle}>Discover now</Text>
          <View style={styles.sponsoredLabel}>
            <Text style={styles.sponsoredText}>Sponsored</Text>
          </View>
          <FlatList
            ref={bannerRef}
            data={sponsorBanners}
            renderItem={renderSponsorBanner}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={2}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
            getItemLayout={(data, index) => ({
              length: Dimensions.get('window').width,
              offset: Dimensions.get('window').width * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / Dimensions.get('window').width
              );
              setCurrentBannerIndex(index);
            }}
          />
        </View>
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
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity 
                style={[
                  styles.postButton,
                  !newPostContent.trim() && styles.postButtonDisabled
                ]}
                onPress={handleCreatePost}
                disabled={!newPostContent.trim()}
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
                <Text style={styles.modalUserName}>You</Text>
                <View style={styles.modalLocationPicker}>
                  <MaterialIcons name="location-on" size={16} color="#6E543C" />
                  <Text style={styles.modalLocationText}>Add location</Text>
                </View>
              </View>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#999"
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalAction}>
                <MaterialIcons name="photo-library" size={24} color="#6E543C" />
                <Text style={styles.modalActionText}>Add Photos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAction}>
                <MaterialIcons name="star" size={24} color="#6E543C" />
                <Text style={styles.modalActionText}>Add Rating</Text>
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
    backgroundColor: '#FFFFFF',
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
  },
  createPostCard: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
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
  postContainer: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(12),
  },
  userName: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#000000',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  locationText: {
    fontSize: fontScale(14),
    color: '#000000',
    marginLeft: horizontalScale(4),
  },
  timeText: {
    fontSize: fontScale(14),
    color: '#666666',
    marginRight: horizontalScale(4),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  stars: {
    flexDirection: 'row',
    marginLeft: horizontalScale(8),
  },
  moreButton: {
    padding: moderateScale(4),
  },
  postContent: {
    fontSize: fontScale(16),
    color: '#000000',
    marginBottom: verticalScale(12),
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
    marginBottom: verticalScale(12),
  },
  postImage: {
    width: '48%',
    height: verticalScale(150),
    borderRadius: moderateScale(8),
  },
  actionContainer: {
    flexDirection: 'row',
    gap: horizontalScale(16),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: horizontalScale(4),
    fontSize: fontScale(14),
    color: '#666666',
  },
  sponsoredSection: {
    padding: moderateScale(16),
  },
  sponsoredTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(8),
  },
  sponsoredLabel: {
    position: 'absolute',
    top: moderateScale(16),
    right: moderateScale(16),
    backgroundColor: '#FFFFFF80',
    padding: moderateScale(4),
    paddingHorizontal: moderateScale(8),
    borderRadius: moderateScale(12),
    zIndex: 1,
  },
  sponsoredText: {
    fontSize: fontScale(12),
    color: '#666666',
  },
  sponsorBanner: {
    width: Dimensions.get('window').width - horizontalScale(32),
    height: verticalScale(150),
    borderRadius: moderateScale(12),
    marginRight: horizontalScale(16),
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
}); 