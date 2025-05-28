import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import 'react-native-gesture-handler';
import { LogBox, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './utils/ApiService';
import Config from 'react-native-config';
import DebugService from './utils/DebugService';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: Failed prop type: Invalid prop `textStyle` of type `array` supplied to `Cell`, expected `object`.',
  'Warning: Cannot update a component (`BubbleMenuComponent`) while rendering a different component (`TextInput`)',
  // Network errors that may appear during development
  'Network request failed',
]);

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'BDLifelessGrotesk': require('../assets/fonts/BDLifelessGrotesk.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the splash screen after the fonts have loaded and the
      // UI is ready.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Check network connectivity when app starts
    const checkNetworkConnection = async () => {
      try {
        // Try to fetch a reliable endpoint to test connectivity
        const connectionCheckUrl = Config.CONN_CHECK_URL || 'https://www.google.com';
        const response = await fetch(connectionCheckUrl, { 
          method: 'HEAD',
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          DebugService.log('Network connection available');
        } else {
          DebugService.logError('Network check failed with status:', response.status);
        }
      } catch (error) {
        DebugService.logError('Network connectivity issue detected:', error);
        // We don't need to block the app from loading here,
        // ApiService will handle retries when actual requests are made
      }
    };
    
    checkNetworkConnection();
  }, []);

  // Don't render anything until the fonts are loaded.
  if (!fontsLoaded) {
    return null;
  }

  return <Stack />;
}
