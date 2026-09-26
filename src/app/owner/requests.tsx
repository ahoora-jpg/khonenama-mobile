import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";
import { mockRequests, statusLabels, type RequestStatus } from "../../ownerData";

const tabs: { label: string; statuses: RequestStatus[] }[] = [
  { label: "همه", statuses: ["new", "following", "accepted", "doing", "done", "closed", "rejected"] },
  { label: "جدید", statuses: ["new"] }, { label: "پیگیری", statuses: ["following", "accepted", "doing"] }, { label: "تمام‌شده", statuses: ["done", "closed"] },
];

export default function RequestsScreen() {
  const [active, setActive] = useState(0);
  const data = useMemo(() => mockRequests.filter((item) => tabs[active].statuses.includes(item.status)), [active]);
  return <View style={styles.page}>
    <View style={styles.tabs}>{tabs.map((tab, index) => <Pressable key={tab.label} style={[styles.tab, active === index && styles.activeTab]} onPress={() => setActive(index)}><Text style={[styles.tabText, active === index && styles.activeText]}>{tab.label}</Text></Pressable>)}</View>
    <FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => router.push(`/owner/request/${item.id}`)}>
      <View style={styles.row}><Text style={styles.title}>{item.title}</Text><Text style={[styles.badge, item.urgency === "فوری" && styles.urgent]}>{item.urgency}</Text></View>
      <Text style={styles.customer}>{item.customer} · {item.area}</Text><Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.footer}><Text style={styles.status}>{statusLabels[item.status]}</Text><Text style={styles.time}>{item.createdAt}</Text></View>
    </Pressable>} ListEmptyComponent={<Text style={styles.empty}>درخواستی در این بخش وجود ندارد.</Text>} />
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, tabs: { flexDirection: "row-reverse", padding: 12, gap: 7, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.line }, tab: { flex: 1, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }, activeTab: { backgroundColor: colors.green }, tabText: { color: colors.muted, fontSize: 12, fontWeight: "800" }, activeText: { color: colors.white },
  list: { padding: 16, paddingBottom: 40 }, card: { backgroundColor: colors.white, padding: 17, borderRadius: 19, borderWidth: 1, borderColor: colors.line, marginBottom: 12 }, row: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }, title: { color: colors.ink, fontSize: 17, fontWeight: "900", textAlign: "right", flex: 1 }, badge: { color: colors.green, backgroundColor: colors.greenSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, overflow: "hidden", fontSize: 11 }, urgent: { color: "#A53B32", backgroundColor: "#FDECEA" }, customer: { color: colors.green, textAlign: "right", marginTop: 8, fontWeight: "700" }, description: { color: colors.muted, lineHeight: 22, textAlign: "right", marginTop: 8 }, footer: { flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 13 }, status: { color: colors.gold, fontWeight: "800" }, time: { color: colors.muted, fontSize: 12 }, empty: { color: colors.muted, textAlign: "center", marginTop: 60 },
});
