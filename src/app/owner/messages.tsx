import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";

export default function MessagesScreen() {
  return <View style={styles.page}><View style={styles.card}><Text style={styles.title}>پیام ساختگی نمایش داده نمی‌شود</Text><Text style={styles.text}>گفت‌وگوی مستقل هنوز به Backend متصل نشده است. ارتباط فعلی با مشتری از پرونده واقعی هر درخواست و شماره تماس ثبت‌شده انجام می‌شود.</Text><Pressable style={styles.button} onPress={() => router.replace("/owner/requests")}><Text style={styles.buttonText}>رفتن به درخواست‌های واقعی</Text></Pressable></View></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream, padding: 18, justifyContent: "center" }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 22 }, title: { color: colors.ink, fontSize: 21, fontWeight: "900", textAlign: "right" }, text: { color: colors.muted, textAlign: "right", lineHeight: 24, marginTop: 10 }, button: { minHeight: 48, borderRadius: 14, backgroundColor: colors.green, justifyContent: "center", alignItems: "center", marginTop: 18 }, buttonText: { color: colors.white, fontWeight: "900" },
});
