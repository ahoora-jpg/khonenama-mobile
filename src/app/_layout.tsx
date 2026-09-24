import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerBackTitle: "بازگشت", headerTintColor: colors.green, headerTitleAlign: "center", contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ title: "جست‌وجوی خونه‌نما" }} />
        <Stack.Screen name="business/[slug]" options={{ title: "پروفایل کسب‌وکار" }} />
      </Stack>
    </>
  );
}
