import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
  imageUrl: any;
  caption: string;
  likes: number;
  comments: Comment[];
}

export default function Post({ id, username, timestamp, imageUrl, caption, likes: initialLikes, comments: initialComments }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

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

      <Image 
        source={imageUrl}
        style={styles.postImage}
        resizeMode="cover"
      />

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
}); 