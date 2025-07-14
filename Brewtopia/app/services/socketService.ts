import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { SOCKET_URL, debugLog } from '../config/constants';

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;
  private listeners: { [key: string]: ((...args: any[]) => void)[] } = {};
  private connectionAttempts = 0;
  private maxRetries = 3;

  constructor() {
    debugLog('SocketService: Initializing...');
    // Không tự động khởi tạo socket, để cho manual connect() gọi
  }

  private async initializeSocket() {
    try {
      debugLog('SocketService: Getting token from AsyncStorage...');
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        debugLog('SocketService: No token found, skipping socket connection');
        return;
      }

      debugLog('SocketService: Token found, connecting to socket...', { 
        url: SOCKET_URL,
        hasToken: !!token 
      });

      this.socket = io(SOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        forceNew: true,
        timeout: 10000, // 10 giây timeout
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: this.maxRetries
      });

      this.socket.on('connect', () => {
        debugLog('SocketService: Connected successfully!', { 
          socketId: this.socket?.id,
          connected: this.socket?.connected 
        });
        this.connectionAttempts = 0;
        
        // Đăng ký lại tất cả listeners đã được store
        this.registerStoredListeners();
      });

      this.socket.on('disconnect', (reason) => {
        debugLog('SocketService: Disconnected', { reason });
      });

      this.socket.on('connect_error', (err) => {
        this.connectionAttempts++;
        debugLog('SocketService: Connection error', { 
          error: err.message,
          attempt: this.connectionAttempts,
          maxRetries: this.maxRetries
        });
        
        if (this.connectionAttempts >= this.maxRetries) {
          debugLog('SocketService: Max connection attempts reached, giving up');
        }
      });

      this.socket.on('error', (error) => {
        debugLog('SocketService: Socket error', { error });
      });

      // Test connection sau 2 giây
      setTimeout(() => {
        this.testConnection();
      }, 2000);

    } catch (error) {
      debugLog('SocketService: Error during initialization', { error });
    }
  }

  private testConnection() {
    if (this.socket) {
      debugLog('SocketService: Testing connection...', {
        connected: this.socket.connected,
        id: this.socket.id
      });
      
      if (!this.socket.connected) {
        debugLog('SocketService: ❌ Socket not connected!');
      } else {
        debugLog('SocketService: ✅ Socket connected successfully!');
      }
    } else {
      debugLog('SocketService: ❌ Socket instance not available!');
    }
  }

  private registerStoredListeners() {
    if (!this.socket) return;
    
    debugLog('SocketService: Registering stored listeners', { 
      events: Object.keys(this.listeners),
      totalListeners: Object.values(this.listeners).reduce((acc, arr) => acc + arr.length, 0)
    });
    
    Object.entries(this.listeners).forEach(([event, callbacks]) => {
      callbacks.forEach(callback => {
        this.socket!.on(event, callback);
      });
    });
    
    debugLog('SocketService: ✅ All stored listeners registered');
  }

  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
    debugLog('SocketService: Current user set', { userId });
  }

  public async connect(): Promise<boolean> {
    debugLog('SocketService: Manual connect called');
    
    if (!this.socket) {
      await this.initializeSocket();
    } else if (!this.socket.connected) {
      this.socket.connect();
    }

    // Wait for connection với timeout
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        debugLog('SocketService: Already connected');
        resolve(true);
        return;
      }

      const timeout = setTimeout(() => {
        debugLog('SocketService: Connection timeout');
        resolve(false);
      }, 5000);

      const onConnect = () => {
        clearTimeout(timeout);
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        debugLog('SocketService: Connection successful');
        resolve(true);
      };

      const onError = () => {
        clearTimeout(timeout);
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        debugLog('SocketService: Connection failed');
        resolve(false);
      };

      this.socket?.on('connect', onConnect);
      this.socket?.on('connect_error', onError);
    });
  }

  public disconnect() {
    debugLog('SocketService: Disconnecting...');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public async joinRoom(roomId: string, userId?: string): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('token');
      let realUserId = userId;
      
      if (!realUserId && token) {
        const decoded: any = jwtDecode(token);
        realUserId = decoded.id || decoded._id || decoded.sub || decoded.userId;
      }
      
      debugLog('SocketService: Joining room', { 
        roomId, 
        userId: realUserId,
        socketConnected: this.socket?.connected 
      });
      
      if (this.socket && this.socket.connected) {
        this.socket.emit('joinRoom', roomId, realUserId);
        debugLog('SocketService: ✅ Join room event emitted');
        return true;
      } else {
        debugLog('SocketService: ❌ Cannot join room - socket not connected');
        return false;
      }
    } catch (e) {
      debugLog('SocketService: Error joining room', { error: e });
      return false;
    }
  }

  public leaveRoom(roomId: string, userId: string) {
    debugLog('SocketService: Leaving room', { roomId, userId });
    if (this.socket && this.socket.connected) {
      this.socket.emit('leaveRoom', roomId, userId);
    }
  }

  public sendMessage(message: {
    chatId: string;
    senderId: string;
    message: string;
  }) {
    debugLog('SocketService: Sending message', { 
      chatId: message.chatId,
      senderId: message.senderId,
      messageLength: message.message.length,
      socketConnected: this.socket?.connected
    });
    
    if (this.socket && this.socket.connected) {
      this.socket.emit('sendMessage', message);
      debugLog('SocketService: ✅ Message sent');
    } else {
      debugLog('SocketService: ❌ Cannot send message - socket not connected');
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    debugLog('SocketService: Registering listener', { event, socketExists: !!this.socket, socketConnected: this.socket?.connected });
    
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
      debugLog('SocketService: ✅ Listener registered on socket', { event });
    } else {
      debugLog('SocketService: ⚠️ Listener stored, will register when socket connects', { event });
    }
  }

  public removeListener(event: string) {
    debugLog('SocketService: Removing listener', { event });
    if (this.socket && this.listeners[event]) {
      (this.listeners[event] as ((...args: any[]) => void)[]).forEach(callback => {
        this.socket?.off(event, callback);
      });
      this.listeners[event] = [];
    }
  }

  public emit(event: string, ...args: any[]) {
    debugLog('SocketService: Emitting event', { event, argsLength: args.length });
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, ...args);
    } else {
      debugLog('SocketService: ❌ Cannot emit - socket not connected');
    }
  }

  // Thêm method để check trạng thái
  public getConnectionStatus() {
    const status = {
      hasSocket: !!this.socket,
      connected: this.socket?.connected || false,
      socketId: this.socket?.id,
      currentUserId: this.currentUserId,
      connectionAttempts: this.connectionAttempts
    };
    
    debugLog('SocketService: Connection status', status);
    return status;
  }
}

export default new SocketService(); 