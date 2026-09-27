import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme";
import { AppErrorBoundary } from "../components/AppErrorBoundary";
import { BusinessSessionProvider } from "../auth/BusinessSessionContext";

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <BusinessSessionProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerBackTitle: "بازگشت", headerTintColor: colors.green, headerTitleAlign: "center", contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ title: "جست‌وجوی خونه‌نما" }} />
        <Stack.Screen name="business/[slug]" options={{ title: "پروفایل کسب‌وکار" }} />
        <Stack.Screen name="business-login" options={{ title: "ورود صاحب کسب‌وکار" }} />
        <Stack.Screen name="business-register" options={{ title: "ثبت کسب‌وکار" }} />
        <Stack.Screen name="owner" options={{ headerShown: false }} />
      </Stack>
      </BusinessSessionProvider>
    </AppErrorBoundary>
  );
}
