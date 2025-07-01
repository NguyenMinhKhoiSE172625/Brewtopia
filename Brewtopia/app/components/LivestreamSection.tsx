import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import SocketService from '../services/socketService';
import { Ionicons } from '@expo/vector-icons';

const CHANNEL_NAME = 'mainstream';

const LivestreamSection = () => {
  const [viewerCount, setViewerCount] = useState(0);
  const [joinMsg, setJoinMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    SocketService.connect();
    SocketService.emit('joinRoom', CHANNEL_NAME);
    SocketService.on('viewerCount', (count: number) => setViewerCount(count));
    SocketService.on('user-joined', (user: string) => {
      setJoinMsg(`${user} vừa vào livestream!`);
      if (Platform.OS === 'android') ToastAndroid.show(`${user} vừa vào livestream!`, ToastAndroid.SHORT);
    });
    SocketService.on('user-left', (user: string) => {
      setJoinMsg(`${user} vừa rời livestream!`);
      if (Platform.OS === 'android') ToastAndroid.show(`${user} vừa rời livestream!`, ToastAndroid.SHORT);
    });
    return () => {
      SocketService.emit('leaveRoom', CHANNEL_NAME);
      SocketService.removeListener('viewerCount');
      SocketService.removeListener('user-joined');
      SocketService.removeListener('user-left');
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="videocam" size={22} color="#E91E63" style={{marginRight: 8}} />
        <Text style={styles.title}>Livestream Cafe</Text>
        <View style={styles.viewerBox}>
          <Ionicons name="eye" size={18} color="#fff" />
          <Text style={styles.viewerText}>{viewerCount}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/pages/stream/livestream-view?streamId=mainstream')}>
        <Text style={styles.buttonText}>Vào xem Livestream</Text>
      </TouchableOpacity>
      {!!joinMsg && <Text style={styles.joinMsg}>{joinMsg}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 16,
    padding: 18,
    shadowColor: '#E91E63',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E91E63',
    flex: 1,
  },
  viewerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
  },
  viewerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  joinMsg: {
    marginTop: 10,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default LivestreamSection; 