import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme";
import { AppErrorBoundary } from "../components/AppErrorBoundary";

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerBackTitle: "بازگشت", headerTintColor: colors.green, headerTitleAlign: "center", contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ title: "جست‌وجوی خونه‌نما" }} />
        <Stack.Screen name="business/[slug]" options={{ title: "پروفایل کسب‌وکار" }} />
        <Stack.Screen name="owner/index" options={{ title: "پنل کسب‌وکار" }} />
        <Stack.Screen name="owner/requests" options={{ title: "درخواست‌ها" }} />
        <Stack.Screen name="owner/request/[id]" options={{ title: "جزئیات درخواست" }} />
        <Stack.Screen name="owner/messages" options={{ title: "پیام‌ها" }} />
        <Stack.Screen name="owner/profile" options={{ title: "پروفایل کسب‌وکار" }} />
      </Stack>
    </AppErrorBoundary>
  );
}
