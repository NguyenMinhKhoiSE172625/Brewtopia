import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log('LOGIN RESPONSE:', data);
    if (data.token) {
      console.log('Login successful, cafeId:', data.cafeId);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('cafeId', data.cafeId);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const api = {
  login
};

export default api; 