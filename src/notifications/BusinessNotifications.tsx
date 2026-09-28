import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { apiRequest } from "../api/client";
import { useBusinessSession } from "../auth/BusinessSessionContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function openNotification(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;
  if (typeof url === "string" && /^\/owner(?:\/|$)/.test(url)) router.push(url as never);
}

export function BusinessNotifications() {
  const { token } = useBusinessSession();

  useEffect(() => {
    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) openNotification(last.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => openNotification(response.notification));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!token || !Device.isDevice) return;
    let active = true;
    void (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("business-requests", {
          name: "درخواست‌های کسب‌وکار",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 150, 250],
          lightColor: "#176B4D",
        });
      }
      const current = await Notifications.getPermissionsAsync();
      const permission = current.status === "granted" ? current : await Notifications.requestPermissionsAsync();
      if (permission.status !== "granted" || !active) return;
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) return;
      const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      if (active) await apiRequest("/api/me/business/push-token", { method: "POST", body: JSON.stringify({ token: pushToken, platform: Platform.OS }) }, token);
    })().catch(() => undefined);
    return () => { active = false; };
  }, [token]);

  return null;
}
