import { Stack } from 'expo-router/stack';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
  const router = useRouter();

  useEffect(() => {
    // Xử lý deep link khi app đang chạy
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      if (url.includes('brewtopia://payment-success')) {
        // Chuyển đến trang payment success
        router.replace('/pages/payment-success/payment-success');
      } else if (url.includes('brewtopia://payment-cancel')) {
        // Quay lại trang trước đó
        router.back();
      }
    };

    // Lắng nghe deep link
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Xử lý deep link khi app được mở từ deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [router]);

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