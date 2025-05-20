import React, { useEffect, useState } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user_data');
        
        if (!token || !userData) {
          setIsAuthenticated(false);
          Alert.alert(
            "Phiên đăng nhập đã hết hạn",
            "Vui lòng đăng nhập lại để tiếp tục",
            [
              {
                text: "Đăng nhập",
                onPress: () => router.replace('/pages/roles/role')
              }
            ],
            { cancelable: false }
          );
          return false;
        }
        
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        return false;
      }
    };

    // Handle back button press
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          if (!isAuthenticated) {
            Alert.alert(
              "Phiên đăng nhập đã hết hạn",
              "Vui lòng đăng nhập lại để tiếp tục",
              [
                {
                  text: "Đăng nhập",
                  onPress: () => router.replace('/pages/roles/role')
                }
              ],
              { cancelable: false }
            );
            return true; // Prevent default behavior
          }
          return false; // Allow default behavior
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, [isAuthenticated])
    );

    // Check auth status when component mounts and when screen comes into focus
    useEffect(() => {
      checkAuth();
    }, []);

    useFocusEffect(
      React.useCallback(() => {
        checkAuth();
      }, [])
    );

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 