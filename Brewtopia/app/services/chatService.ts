import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

class ChatService {
  private baseUrl = `${API_URL}/chat`;

  private async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async createChatRoom(participants: string[], isGroup: boolean, name?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/room`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          participants,
          isGroup,
          name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  async getChatHistory(roomId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/message/${roomId}`, {
        headers: await this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get chat history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  async getChatRooms() {
    try {
      const response = await fetch(`${this.baseUrl}/rooms`, {
        headers: await this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get chat rooms');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      throw error;
    }
  }
}

export default new ChatService(); 