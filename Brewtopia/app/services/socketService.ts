// Simplified SocketService without socket functionality
class SocketService {
  private currentUserId: string | null = null;

  constructor() {
    // No socket initialization
  }

  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  public async connect(): Promise<boolean> {
    // Always return false - no socket connection
    return false;
  }

  public disconnect() {
    // No-op
  }

  public async joinRoom(roomId: string, userId?: string): Promise<boolean> {
    // Always return false - no socket connection
    return false;
  }

  public leaveRoom(roomId: string, userId: string) {
    // No-op
  }

  public sendMessage(message: {
    chatId: string;
    senderId: string;
    message: string;
  }) {
    // No-op
  }

  public on(event: string, callback: (...args: any[]) => void) {
    // No-op
  }

  public removeListener(event: string) {
    // No-op
  }

  public emit(event: string, ...args: any[]) {
    // No-op
  }

  public getConnectionStatus() {
    return {
      hasSocket: false,
      connected: false,
      socketId: null,
      currentUserId: this.currentUserId,
      connectionAttempts: 0
    };
  }
}

export default new SocketService(); 