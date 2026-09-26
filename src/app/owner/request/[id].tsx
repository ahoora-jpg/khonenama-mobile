import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../../theme";
import { mockRequests, statusLabels, type RequestStatus } from "../../../ownerData";
import { ScreenState } from "../../../components/ScreenState";

export default function RequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = mockRequests.find((request) => request.id === id);
  const [status, setStatus] = useState<RequestStatus>(item?.status || "new");
  const [price, setPrice] = useState("");
  if (!item) return <ScreenState title="درخواست پیدا نشد" message="ممکن است این درخواست حذف یا منقضی شده باشد." />;
  const update = (next: RequestStatus) => { setStatus(next); Alert.alert("وضعیت به‌روزرسانی شد", statusLabels[next]); };
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.panel}><View style={styles.header}><Text style={styles.title}>{item.title}</Text><Text style={styles.id}>{item.id}</Text></View><Text style={styles.customer}>{item.customer} · {item.area}</Text><Text style={styles.description}>{item.description}</Text><Text style={styles.meta}>زمان ثبت: {item.createdAt}</Text><Text style={styles.meta}>بودجه: {item.budget}</Text><Text style={styles.status}>وضعیت فعلی: {statusLabels[status]}</Text></View>
    <View style={styles.panel}><Text style={styles.section}>پیشنهاد قیمت</Text><TextInput value={price} onChangeText={setPrice} placeholder="مثلاً ۱۲٬۵۰۰٬۰۰۰ تومان" textAlign="right" style={styles.input} keyboardType="numeric"/><Pressable style={styles.primary} onPress={() => price ? update("following") : Alert.alert("مبلغ را وارد کنید")}><Text style={styles.primaryText}>ارسال پیشنهاد و شروع مذاکره</Text></Pressable></View>
    <View style={styles.panel}><Text style={styles.section}>اقدام سریع</Text><View style={styles.actions}><Pressable style={styles.secondary} onPress={() => update("accepted")}><Text style={styles.secondaryText}>قبول درخواست</Text></Pressable><Pressable style={styles.secondary} onPress={() => update("doing")}><Text style={styles.secondaryText}>شروع کار</Text></Pressable><Pressable style={styles.secondary} onPress={() => update("done")}><Text style={styles.secondaryText}>انجام شد</Text></Pressable><Pressable style={styles.reject} onPress={() => update("rejected")}><Text style={styles.rejectText}>رد درخواست</Text></Pressable></View></View>
    <View style={styles.mock}><Text style={styles.mockText}>این صفحه فعلاً با داده نمونه کار می‌کند؛ تغییر وضعیت تا اتصال Backend فقط در همین نشست نگه‌داری می‌شود.</Text></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 16, paddingBottom: 40 }, panel: { backgroundColor: colors.white, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.line, marginBottom: 12 }, header: { flexDirection: "row-reverse", justifyContent: "space-between" }, title: { color: colors.ink, fontSize: 21, fontWeight: "900", textAlign: "right" }, id: { color: colors.muted, fontSize: 11 }, customer: { color: colors.green, fontWeight: "800", textAlign: "right", marginTop: 9 }, description: { color: colors.ink, textAlign: "right", lineHeight: 25, marginTop: 15 }, meta: { color: colors.muted, textAlign: "right", marginTop: 8 }, status: { color: colors.gold, textAlign: "right", fontWeight: "900", marginTop: 14 }, section: { color: colors.ink, fontSize: 18, fontWeight: "900", textAlign: "right", marginBottom: 12 }, input: { height: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, backgroundColor: "#FAFBFA" }, primary: { height: 49, backgroundColor: colors.green, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 10 }, primaryText: { color: colors.white, fontWeight: "900" }, actions: { gap: 9 }, secondary: { height: 46, borderRadius: 13, backgroundColor: colors.greenSoft, alignItems: "center", justifyContent: "center" }, secondaryText: { color: colors.green, fontWeight: "900" }, reject: { height: 46, borderRadius: 13, backgroundColor: "#FDECEA", alignItems: "center", justifyContent: "center" }, rejectText: { color: "#A53B32", fontWeight: "900" }, mock: { padding: 14 }, mockText: { textAlign: "right", color: colors.muted, fontSize: 12, lineHeight: 20 },
});
