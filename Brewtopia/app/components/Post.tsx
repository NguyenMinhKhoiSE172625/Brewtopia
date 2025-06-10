import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Modal, Dimensions, TouchableWithoutFeedback, FlatList } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
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

  // Check if imageUrl is an array (multiple images) or single image
  const isMultipleImages = Array.isArray(imageUrl);
  const images = isMultipleImages ? imageUrl : [imageUrl];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        username: 'Current User',
        text: newComment,
        timestamp: new Date().toLocaleString()
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  const openImageViewer = (index: number = 0) => {
    setCurrentImageIndex(index);
    setImageViewVisible(true);
  };

  const closeImageViewer = () => {
    setImageViewVisible(false);
  };

  const renderImages = () => {
    if (images.length === 0 || !images[0]) return null;

    if (images.length === 1) {
      // Single image
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openImageViewer(0)}
        >
          <Image
            source={images[0]}
            style={styles.postImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    } else if (images.length === 2) {
      // Two images - show side by side
      return (
        <View style={styles.twoImagesContainer}>
          <TouchableOpacity
            style={styles.halfImageContainer}
            activeOpacity={0.9}
            onPress={() => openImageViewer(0)}
          >
            <Image
              source={images[0]}
              style={styles.halfImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.halfImageContainer}
            activeOpacity={0.9}
            onPress={() => openImageViewer(1)}
          >
            <Image
              source={images[1]}
              style={styles.halfImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      );
    } else if (images.length === 3) {
      // Three images - first large, two small on right
      return (
        <View style={styles.threeImagesContainer}>
          <TouchableOpacity
            style={styles.largeImageContainer}
            activeOpacity={0.9}
            onPress={() => openImageViewer(0)}
          >
            <Image
              source={images[0]}
              style={styles.largeImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={styles.smallImagesColumn}>
            <TouchableOpacity
              style={styles.smallImageContainer}
              activeOpacity={0.9}
              onPress={() => openImageViewer(1)}
            >
              <Image
                source={images[1]}
                style={styles.smallImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallImageContainer}
              activeOpacity={0.9}
              onPress={() => openImageViewer(2)}
            >
              <Image
                source={images[2]}
                style={styles.smallImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      // Four or more images - 2x2 grid with overlay for remaining
      return (
        <View style={styles.multipleImagesContainer}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.quarterImageContainer}
              activeOpacity={0.9}
              onPress={() => openImageViewer(0)}
            >
              <Image
                source={images[0]}
                style={styles.quarterImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quarterImageContainer}
              activeOpacity={0.9}
              onPress={() => openImageViewer(1)}
            >
              <Image
                source={images[1]}
                style={styles.quarterImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.quarterImageContainer}
              activeOpacity={0.9}
              onPress={() => openImageViewer(2)}
            >
              <Image
                source={images[2]}
                style={styles.quarterImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quarterImageContainer}
              activeOpacity={0.9}
              onPress={() => openImageViewer(3)}
            >
              <Image
                source={images[3]}
                style={styles.quarterImage}
                resizeMode="cover"
              />
              {images.length > 4 && (
                <View style={styles.moreImagesOverlay}>
                  <Text style={styles.moreImagesText}>+{images.length - 4}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

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

      {renderImages()}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <MaterialIcons 
            name={isLiked ? "favorite" : "favorite-border"} 
            size={24} 
            color={isLiked ? "#FF0000" : "#6E543C"} 
          />
          <Text style={styles.actionText}>{likes} likes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowComments(!showComments)}
        >
          <MaterialIcons name="comment" size={24} color="#6E543C" />
          <Text style={styles.actionText}>{comments.length} comments</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.caption}>{caption}</Text>

      {showComments && (
        <View style={styles.commentsSection}>
          {comments.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentUsername}>{comment.username}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
              <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
            </View>
          ))}

          <View style={styles.addCommentSection}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity 
              style={styles.postCommentButton} 
              onPress={handleAddComment}
            >
              <Text style={styles.postCommentText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.imageViewerContainer}>
          {/* Header with close button and counter */}
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeImageViewer}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            {images.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>

          {/* Images */}
          <View style={styles.imageViewerContent}>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={currentImageIndex}
              getItemLayout={(data, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              renderItem={({ item }) => (
                <View style={styles.imageSlide}>
                  <TouchableWithoutFeedback>
                    <Image
                      source={item}
                      style={styles.fullImage}
                      resizeMode="contain"
                    />
                  </TouchableWithoutFeedback>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentImageIndex(index);
              }}
            />
          </View>

          {/* Navigation dots for multiple images */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.activeDot
                  ]}
                />
              ))}
            </View>
          )}

          {/* Tap area to close (only on edges) */}
          <TouchableWithoutFeedback onPress={closeImageViewer}>
            <View style={styles.closeArea} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>
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
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  closeArea: {
    position: 'absolute',
    top: 80,
    bottom: 80,
    left: 0,
    right: 0,
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