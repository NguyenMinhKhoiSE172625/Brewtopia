import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import ApiService from './app/utils/ApiService';

// Test component để kiểm tra Comments API
export default function TestCommentsComponent() {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [testPostId] = useState('683ffd4cb01d7ad4249c4d7c'); // Test post ID

  const testGetComments = async () => {
    try {
      setLoading(true);
      console.log('Testing GET /comments with body...');
      
      const response = await ApiService.posts.getComments(testPostId, 'Post');
      console.log('Comments API Response:', response);
      
      setComments(response.comments);
      Alert.alert('Success', `Loaded ${response.comments.length} comments`);
    } catch (error) {
      console.error('Error testing comments API:', error);
      Alert.alert('Error', `Failed to load comments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCommentsWithQuery = async () => {
    try {
      setLoading(true);
      console.log('Testing GET /comments with query params...');
      
      const response = await ApiService.posts.getCommentsWithQuery(testPostId, 'Post');
      console.log('Comments API Response (Query):', response);
      
      setComments(response.comments);
      Alert.alert('Success', `Loaded ${response.comments.length} comments`);
    } catch (error) {
      console.error('Error testing comments API with query:', error);
      Alert.alert('Error', `Failed to load comments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAddComment = async () => {
    try {
      setLoading(true);
      console.log('Testing POST /comments...');

      const response = await ApiService.posts.addComment(testPostId, 'Test comment from mobile app', 'Post');
      console.log('Add Comment API Response:', response);

      Alert.alert('Success', `Comment added successfully! ID: ${response._id}`);
    } catch (error) {
      console.error('Error testing add comment API:', error);
      Alert.alert('Error', `Failed to add comment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments API Test</Text>
      <Text style={styles.subtitle}>Test Post ID: {testPostId}</Text>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6E543C" />
          <Text style={styles.loadingText}>Testing API...</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testGetComments}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test GET /comments (with body)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testGetCommentsWithQuery}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test GET /comments (with query)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testAddComment}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test POST /comments (Create Comment)</Text>
      </TouchableOpacity>
      
      {comments.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Comments ({comments.length}):</Text>
          {comments.slice(0, 3).map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Text style={styles.commentUser}>{comment.user?.name || 'Unknown'}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6E543C',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6E543C',
  },
  button: {
    backgroundColor: '#6E543C',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6E543C',
    marginBottom: 10,
  },
  commentItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#6E543C',
  },
  commentContent: {
    color: '#333',
    marginTop: 5,
  },
});
