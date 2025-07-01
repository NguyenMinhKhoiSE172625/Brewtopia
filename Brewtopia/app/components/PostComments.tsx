import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AppLoading from './AppLoading';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

interface PostCommentsProps {
  comments: Comment[];
  loadingComments: boolean;
  handleAddComment: () => void;
  newComment: string;
  setNewComment: (text: string) => void;
}

export default function PostComments({ comments, loadingComments, handleAddComment, newComment, setNewComment }: PostCommentsProps) {
  return (
    <View style={styles.commentsSection}>
      {loadingComments ? (
        <View style={styles.loadingContainer}>
          <AppLoading text="Loading comments..." size="small" />
        </View>
      ) : (
        <>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  commentsSection: {
    marginTop: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentItem: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#6E543C',
  },
  commentText: {
    color: '#333',
    marginTop: 2,
  },
  commentTimestamp: {
    color: '#AAA',
    fontSize: 11,
    marginTop: 2,
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#FFF',
  },
  postCommentButton: {
    backgroundColor: '#6E543C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postCommentText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
}); 