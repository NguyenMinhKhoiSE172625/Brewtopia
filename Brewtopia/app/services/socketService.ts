import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.initializeSocket();
  }

  private async initializeSocket() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      this.socket = io('http://10.0.2.2:4000', {
        auth: {
          token
        },
        transports: ['websocket'],
        forceNew: true,
      });

      this.socket.on('connect', () => {
      });

      this.socket.on('disconnect', () => {
      });

      this.socket.on('connect_error', (err) => {
      });

      this.socket.on('error', (error) => {
      });

    } catch (error) {
    }
  }

  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  public connect() {
    if (!this.socket) {
      this.initializeSocket();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public async joinRoom(roomId: string, userId?: string) {
    try {
      const token = await AsyncStorage.getItem('token');
      let realUserId = userId;
      if (!realUserId && token) {
        const decoded: any = jwt_decode(token);
        realUserId = decoded.id || decoded._id || decoded.sub || decoded.userId;
      }
      if (this.socket) {
        this.socket.emit('joinRoom', roomId, realUserId);
      }
    } catch (e) {
    }
  }

  public leaveRoom(roomId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('leaveRoom', roomId, userId);
    }
  }

  public sendMessage(message: {
    chatId: string;
    senderId: string;
    message: string;
  }) {
    if (this.socket) {
      this.socket.emit('sendMessage', message);
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public removeListener(event: string) {
    if (this.socket && this.listeners[event]) {
      (this.listeners[event] as ((...args: any[]) => void)[]).forEach(callback => {
        this.socket?.off(event, callback);
      });
      this.listeners[event] = [];
    }
  }

  public emit(event: string, ...args: any[]) {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }
}

export default new SocketService(); 