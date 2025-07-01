import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, debugLog } from '../config/constants';

class ChatService {
  private baseUrl = `${API_URL}/chat`;

  private async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    debugLog('ChatService: Getting headers', { 
      hasToken: !!token,
      tokenLength: token?.length || 0,
      apiUrl: this.baseUrl
    });
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async createChatRoom(participants: string[], isGroup: boolean, name?: string) {
    try {
      debugLog('ChatService: Creating chat room', { 
        participants, 
        isGroup, 
        name,
        url: `${this.baseUrl}/room`
      });

      const headers = await this.getHeaders();
      const body = {
        participants,
        isGroup,
        name
      };

      debugLog('ChatService: Request details', { headers, body });

      const response = await fetch(`${this.baseUrl}/room`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      debugLog('ChatService: Response received', { 
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        debugLog('ChatService: Error response body', { errorText });
        throw new Error(`Failed to create chat room: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      debugLog('ChatService: ✅ Chat room created successfully', { data });
      return data;
      
    } catch (error) {
      debugLog('ChatService: ❌ Error creating chat room', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  async getChatHistory(roomId: string) {
    try {
      debugLog('ChatService: Getting chat history', { 
        roomId,
        url: `${this.baseUrl}/message/${roomId}`
      });

      const response = await fetch(`${this.baseUrl}/message/${roomId}`, {
        headers: await this.getHeaders()
      });

      debugLog('ChatService: Chat history response', { 
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        debugLog('ChatService: Error getting chat history', { errorText });
        throw new Error(`Failed to get chat history: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      debugLog('ChatService: ✅ Chat history retrieved', { 
        messageCount: Array.isArray(data) ? data.length : 'N/A'
      });
      return data;
      
    } catch (error) {
      debugLog('ChatService: ❌ Error getting chat history', { error });
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  async getChatRooms() {
    try {
      debugLog('ChatService: Getting chat rooms', { 
        url: `${this.baseUrl}/rooms`
      });

      const response = await fetch(`${this.baseUrl}/rooms`, {
        headers: await this.getHeaders()
      });

      debugLog('ChatService: Chat rooms response', { 
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        debugLog('ChatService: Error getting chat rooms', { errorText });
        throw new Error(`Failed to get chat rooms: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      debugLog('ChatService: ✅ Chat rooms retrieved', { 
        roomCount: Array.isArray(data) ? data.length : 'N/A'
      });
      return data;
      
    } catch (error) {
      debugLog('ChatService: ❌ Error getting chat rooms', { error });
      console.error('Error getting chat rooms:', error);
      throw error;
    }
  }

  // Thêm method test connection
  async testConnection() {
    try {
      debugLog('ChatService: Testing connection...');
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        debugLog('ChatService: ❌ No token found for testing');
        return { success: false, error: 'No token' };
      }

      const response = await fetch(`${this.baseUrl}/test`, {
        headers: await this.getHeaders()
      });

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };

      debugLog('ChatService: Connection test result', result);
      return result;
      
    } catch (error) {
      const result = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      debugLog('ChatService: ❌ Connection test failed', result);
      return result;
    }
  }
}

export default new ChatService(); 