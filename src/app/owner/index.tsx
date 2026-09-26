import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";
import { mockRequests } from "../../ownerData";

const stats = [
  ["درخواست جدید", String(mockRequests.filter((item) => item.status === "new").length)],
  ["در حال پیگیری", String(mockRequests.filter((item) => ["following", "accepted", "doing"].includes(item.status)).length)],
  ["پیام خوانده‌نشده", "۲"], ["امتیاز", "۴٫۸"],
];

export default function OwnerDashboard() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.modeBar}><Text style={styles.modeTitle}>حالت کسب‌وکار</Text><Pressable onPress={() => router.replace("/")}><Text style={styles.switch}>تغییر به حالت مشتری</Text></Pressable></View>
      <View style={styles.hero}><Text style={styles.eyebrow}>امروز آماده پاسخ‌گویی هستید</Text><Text style={styles.title}>مدیریت کسب‌وکار</Text><Text style={styles.subtitle}>درخواست‌های جدید را سریع ببینید و به مشتری پاسخ دهید.</Text></View>
      <View style={styles.stats}>{stats.map(([label, value]) => <View key={label} style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>)}</View>
      <Text style={styles.sectionTitle}>دسترسی سریع</Text>
      <View style={styles.actions}>
        <Action title="درخواست‌ها" caption="مشاهده و پیگیری" onPress={() => router.push("/owner/requests")} />
        <Action title="پیام‌ها" caption="گفتگو با مشتری" onPress={() => router.push("/owner/messages")} />
        <Action title="پروفایل" caption="اطلاعات و خدمات" onPress={() => router.push("/owner/profile")} />
      </View>
      <View style={styles.notice}><Text style={styles.noticeTitle}>نسخه آزمایشی</Text><Text style={styles.noticeText}>اطلاعات این پنل فعلاً نمونه هستند و پس از آماده‌شدن API به اطلاعات واقعی متصل می‌شوند.</Text></View>
    </ScrollView>
  );
}

function Action({ title, caption, onPress }: { title: string; caption: string; onPress: () => void }) {
  return <Pressable style={styles.action} onPress={onPress}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionCaption}>{caption}</Text></Pressable>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 18, paddingBottom: 40 },
  modeBar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }, modeTitle: { color: colors.ink, fontWeight: "900" }, switch: { color: colors.green, fontWeight: "800", fontSize: 12 },
  hero: { backgroundColor: colors.green, padding: 22, borderRadius: 24 }, eyebrow: { color: "#CFE2D8", textAlign: "right" }, title: { color: colors.white, fontSize: 27, fontWeight: "900", textAlign: "right", marginTop: 8 }, subtitle: { color: "#E5EFEA", lineHeight: 24, textAlign: "right", marginTop: 8 },
  stats: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginTop: 14 }, stat: { width: "48%", backgroundColor: colors.white, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.line }, statValue: { color: colors.green, fontSize: 25, fontWeight: "900", textAlign: "right" }, statLabel: { color: colors.muted, textAlign: "right", marginTop: 4 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: "900", textAlign: "right", marginTop: 26, marginBottom: 12 }, actions: { gap: 10 }, action: { backgroundColor: colors.white, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.line }, actionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", textAlign: "right" }, actionCaption: { color: colors.muted, textAlign: "right", marginTop: 4 },
  notice: { backgroundColor: "#FFF8EA", padding: 16, borderRadius: 18, marginTop: 20 }, noticeTitle: { color: colors.gold, fontWeight: "900", textAlign: "right" }, noticeText: { color: colors.muted, lineHeight: 22, textAlign: "right", marginTop: 5 },
});
