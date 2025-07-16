// Simplified ChatService without chat functionality
class ChatService {
  private baseUrl = '';

  private async getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  async createChatRoom(participants: string[], isGroup: boolean, name?: string) {
    // Return empty response - no chat functionality
    return {};
  }

  async getChatHistory(roomId: string) {
    // Return empty array - no chat functionality
    return [];
  }

  async getChatRooms() {
    // Return empty array - no chat functionality
    return [];
  }

  async testConnection() {
    // Always return failure - no chat functionality
    return { success: false, error: 'Chat functionality disabled' };
  }
}

export default new ChatService(); 