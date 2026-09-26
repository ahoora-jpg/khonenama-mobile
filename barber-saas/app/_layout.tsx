import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerBackTitle: 'بازگشت',
          contentStyle: { backgroundColor: '#F7F7F5' }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="book" options={{ title: 'رزرو نوبت' }} />
        <Stack.Screen name="login" options={{ title: 'ورود' }} />
        <Stack.Screen name="admin" options={{ title: 'مدیریت آرایشگاه' }} />
      </Stack>
    </>
  );
}
