import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, TextInput, Modal, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import Post from '../../components/Post';
import BottomBar from '../../components/BottomBar';
import SponsorBanner from '../../components/SponsorBanner';
import * as ImagePicker from 'expo-image-picker';
import withAuth from '../../components/withAuth';

function News() {
  const router = useRouter();

  const samplePosts = [
    {
      id: '1',
      username: 'Coffee Lover',
      timestamp: '2 hours ago',
      imageUrl: require('../../../assets/images/cafe1.png'),
      caption: "Starting my day with the perfect cup of coffee ☕️ #MorningCoffee #CoffeeLover",
      likes: 245,
      comments: [
        {
          id: '1',
          username: 'John',
          text: 'Looks delicious! Which blend is this?',
          timestamp: '1 hour ago'
        },
        {
          id: '2',
          username: 'Sarah',
          text: "Perfect morning vibes! 😍",
          timestamp: '30 minutes ago'
        }
      ]
    },
    {
      id: '2',
      username: 'Cafe Explorer',
      timestamp: '3 hours ago',
      imageUrl: require('../../../assets/images/cafe2.png'),
      caption: "Found this hidden gem today! The atmosphere is amazing 🌟 #CafeHopping",
      likes: 189,
      comments: [
        {
          id: '1',
          username: 'Mike',
          text: 'Where is this place? Looks cozy!',
          timestamp: '2 hours ago'
        }
      ]
    },
    {
      id: '3',
      username: 'Barista Pro',
      timestamp: '5 hours ago',
      imageUrl: require('../../../assets/images/cafe3.png'),
      caption: "Latte art of the day 🎨 #LatteArt #BaristaLife",
      likes: 567,
      comments: [
        {
          id: '1',
          username: 'Emma',
          text: "Your latte art skills are amazing! 👏",
          timestamp: '4 hours ago'
        },
        {
          id: '2',
          username: 'David',
          text: "Teach me your ways! 🙏",
          timestamp: '3 hours ago'
        }
      ]
    },
    {
      id: '4',
      username: 'Food Critic',
      timestamp: '6 hours ago',
      imageUrl: require('../../../assets/images/cafe4.png'),
      caption: "Best brunch spot in town! The eggs benedict here is to die for 🍳 #FoodieLife",
      likes: 432,
      comments: [
        {
          id: '1',
          username: 'Lisa',
          text: 'Added to my must-visit list!',
          timestamp: '5 hours ago'
        }
      ]
    },
    {
      id: '5',
      username: 'Sweet Tooth',
      timestamp: '8 hours ago',
      imageUrl: require('../../../assets/images/cafe5.png'),
      caption: "This chocolate cake is pure heaven 🍫 #DessertLover",
      likes: 678,
      comments: [
        {
          id: '1',
          username: 'Peter',
          text: "Looks incredible! Save me a slice 😋",
          timestamp: '7 hours ago'
        }
      ]
    },
    {
      id: '6',
      username: 'Coffee Artisan',
      timestamp: '10 hours ago',
      imageUrl: require('../../../assets/images/mon1.png'),
      caption: "Fresh beans just arrived! Can't wait to brew these 🌱 #CoffeeRoasting",
      likes: 345,
      comments: [
        {
          id: '1',
          username: 'Alex',
          text: 'Which origin are these beans from?',
          timestamp: '9 hours ago'
        }
      ]
    },
    {
      id: '7',
      username: 'Cafe Hopper',
      timestamp: '12 hours ago',
      imageUrl: require('../../../assets/images/mon2.png'),
      caption: "Weekend vibes at this beautiful cafe ✨ #WeekendMood",
      likes: 289,
      comments: [
        {
          id: '1',
          username: 'Rachel',
          text: "Such a lovely spot! 😍",
          timestamp: '11 hours ago'
        }
      ]
    },
    {
      id: '8',
      username: 'Tea Master',
      timestamp: '1 day ago',
      imageUrl: require('../../../assets/images/mon3.png'),
      caption: "Exploring new tea blends today 🍵 #TeaTime",
      likes: 234,
      comments: [
        {
          id: '1',
          username: 'Sophie',
          text: "Love a good tea tasting! 🫖",
          timestamp: '23 hours ago'
        }
      ]
    },
    {
      id: '9',
      username: 'Pastry Chef',
      timestamp: '1 day ago',
      imageUrl: require('../../../assets/images/mon4.png'),
      caption: "Fresh croissants hot from the oven 🥐 #BakeryLife",
      likes: 456,
      comments: [
        {
          id: '1',
          username: 'Tom',
          text: "These look perfectly flaky! 👌",
          timestamp: '23 hours ago'
        }
      ]
    },
    {
      id: '10',
      username: 'Coffee Shop',
      timestamp: '1 day ago',
      imageUrl: require('../../../assets/images/mon5.png'),
      caption: "New seasonal menu launching tomorrow! 🎉 #NewMenu #Excited",
      likes: 567,
      comments: [
        {
          id: '1',
          username: 'Anna',
          text: "Can't wait to try everything! 😋",
          timestamp: '22 hours ago'
        },
        {
          id: '2',
          username: 'James',
          text: 'The preview looks amazing!',
          timestamp: '21 hours ago'
        }
      ]
    }
  ];

  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState(samplePosts);
  
  // New states for photo and rating features
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratedCafe, setRatedCafe] = useState('');

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your photo library to select images.');
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
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while selecting images.');
      console.error(error);
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages(selectedImages.filter(imageUri => imageUri !== uri));
  };

  const handleCreatePost = () => {
    if (newPostContent.trim() || selectedImages.length > 0) {
      const newPost = {
        id: (posts.length + 1).toString(),
        username: 'You',
        timestamp: 'Just now',
        imageUrl: selectedImages.length > 0 
          ? { uri: selectedImages[0] } 
          : require('../../../assets/images/avatar3.png'),
        caption: newPostContent + (rating > 0 ? `\n\nRated ${ratedCafe}: ${rating}⭐` : ''),
        likes: 0,
        comments: []
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setSelectedImages([]);
      setRating(0);
      setRatedCafe('');
      setShowPostModal(false);
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
            <Text style={styles.createPostPlaceholder}>What's on your mind?</Text>
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
    posts.forEach((post, index) => {
      // Add the post
      result.push(<Post key={post.id} {...post} />);
      
      // After every 2 posts (0, 2, 4, etc.), add a sponsor banner
      if (index % 2 === 1 && index < posts.length - 1) {
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
        {/* Render posts with sponsor banners */}
        {renderPostsWithSponsors()}
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
                <Text style={styles.modalUserName}>You</Text>
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
                <Text style={styles.ratingText}>Your rating for {ratedCafe || 'this cafe'}: {rating} ⭐</Text>
              </View>
            )}
            
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
                <Text style={styles.modalActionText}>Add Rating</Text>
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
            <Text style={styles.ratingModalTitle}>Rate this cafe</Text>
            
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
                <Text style={styles.ratingModalCancelText}>Cancel</Text>
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
                <Text style={styles.ratingModalSubmitText}>Submit</Text>
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
});

export default withAuth(News); 