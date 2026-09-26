import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";
import { mockChats } from "../../ownerData";

export default function MessagesScreen() {
  return <View style={styles.page}><FlatList data={mockChats} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => Alert.alert(item.name, "گفتگوی کامل پس از اتصال سرویس پیام فعال می‌شود.")}>
    <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.slice(0, 1)}</Text></View><View style={styles.body}><View style={styles.row}><Text style={styles.name}>{item.name}</Text><Text style={styles.time}>{item.time}</Text></View><View style={styles.row}><Text style={styles.preview} numberOfLines={1}>{item.preview}</Text>{item.unread ? <Text style={styles.unread}>{item.unread}</Text> : null}</View><Text style={styles.request}>مرتبط با درخواست {item.id}</Text></View>
  </Pressable>} ListHeaderComponent={<Text style={styles.hint}>پیام‌های مشتریان و درخواست‌ها در یک صندوق</Text>} /></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, list: { padding: 16 }, hint: { color: colors.muted, textAlign: "right", marginBottom: 12 }, card: { flexDirection: "row-reverse", backgroundColor: colors.white, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: colors.line, marginBottom: 10, gap: 12 }, avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.greenSoft, alignItems: "center", justifyContent: "center" }, avatarText: { color: colors.green, fontWeight: "900", fontSize: 19 }, body: { flex: 1 }, row: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 10 }, name: { color: colors.ink, fontWeight: "900", fontSize: 16 }, time: { color: colors.muted, fontSize: 11 }, preview: { color: colors.muted, textAlign: "right", flex: 1, marginTop: 7 }, unread: { color: colors.white, backgroundColor: colors.green, minWidth: 21, height: 21, borderRadius: 11, textAlign: "center", lineHeight: 21, overflow: "hidden", fontSize: 11 }, request: { color: colors.gold, textAlign: "right", marginTop: 8, fontSize: 11 },
});
