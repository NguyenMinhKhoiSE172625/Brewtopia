import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import 'react-native-gesture-handler';
import { LogBox, Platform } from 'react-native';

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

  // Don't render anything until the fonts are loaded.
  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'fade',
    }} />
  );
}
