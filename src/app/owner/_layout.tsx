import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { colors } from "../../theme";

export default function OwnerLayout() {
  const { loading, token } = useBusinessSession();
  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.green} size="large" /></View>;
  if (!token) return <Redirect href="/business-login" />;
  return <Stack screenOptions={{ headerBackTitle: "بازگشت", headerTintColor: colors.green, headerTitleAlign: "center", contentStyle: { backgroundColor: colors.cream } }}>
    <Stack.Screen name="index" options={{ title: "مدیریت کسب‌وکار" }} />
    <Stack.Screen name="requests" options={{ title: "درخواست‌ها" }} />
    <Stack.Screen name="request/[id]" options={{ title: "جزئیات درخواست" }} />
    <Stack.Screen name="messages" options={{ title: "پیام‌ها" }} />
    <Stack.Screen name="profile" options={{ title: "پروفایل کسب‌وکار" }} />
  </Stack>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream } });
