import { Stack } from 'expo-router/stack';

export default function App() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="pages" />
    </Stack>
  );
} 