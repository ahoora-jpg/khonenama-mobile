import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors } from "../../theme";

export default function OwnerProfile() {
  const [active, setActive] = useState(true);
  const [name, setName] = useState("دکوراسیون خانه سبز");
  const [phone, setPhone] = useState("۰۲۶۳۲۵۰۰۰۰۰");
  const [address, setAddress] = useState("کرج، گوهردشت");
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.status}><View><Text style={styles.statusTitle}>دریافت درخواست جدید</Text><Text style={styles.statusText}>{active ? "فعال" : "موقتاً غیرفعال"}</Text></View><Switch value={active} onValueChange={setActive} trackColor={{ true: colors.greenSoft }} thumbColor={active ? colors.green : colors.muted}/></View>
    <View style={styles.panel}><Text style={styles.title}>اطلاعات کسب‌وکار</Text><Label text="نام کسب‌وکار"/><TextInput value={name} onChangeText={setName} textAlign="right" style={styles.input}/><Label text="شماره تماس"/><TextInput value={phone} onChangeText={setPhone} textAlign="right" style={styles.input}/><Label text="نشانی و محدوده فعالیت"/><TextInput value={address} onChangeText={setAddress} textAlign="right" style={styles.input}/><Label text="خدمات"/><View style={styles.tags}>{["پرده", "کاغذ دیواری", "طراحی داخلی"].map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}</View><Pressable style={styles.button} onPress={() => Alert.alert("ذخیره شد", "تغییرات نمونه در این نشست ذخیره شد.")}><Text style={styles.buttonText}>ذخیره تغییرات</Text></Pressable></View>
    <View style={styles.verify}><Text style={styles.verifyTitle}>وضعیت مالکیت: در انتظار اتصال احراز هویت</Text><Text style={styles.verifyText}>پس از آماده‌شدن Backend، مدارک و شماره موبایل مالک از همین بخش بررسی می‌شود.</Text></View>
  </ScrollView>;
}

function Label({ text }: { text: string }) { return <Text style={styles.label}>{text}</Text>; }
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 16, paddingBottom: 40 }, status: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderRadius: 18, padding: 17, borderWidth: 1, borderColor: colors.line }, statusTitle: { color: colors.ink, fontWeight: "900", textAlign: "right" }, statusText: { color: colors.green, textAlign: "right", marginTop: 4, fontSize: 12 }, panel: { backgroundColor: colors.white, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.line, marginTop: 12 }, title: { color: colors.ink, fontSize: 20, fontWeight: "900", textAlign: "right", marginBottom: 4 }, label: { color: colors.muted, textAlign: "right", marginTop: 15, marginBottom: 6, fontSize: 12 }, input: { height: 49, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 13, color: colors.ink, backgroundColor: "#FAFBFA" }, tags: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 7 }, tag: { color: colors.green, backgroundColor: colors.greenSoft, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, overflow: "hidden" }, button: { height: 50, borderRadius: 14, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", marginTop: 22 }, buttonText: { color: colors.white, fontWeight: "900" }, verify: { backgroundColor: "#FFF8EA", borderRadius: 18, padding: 16, marginTop: 12 }, verifyTitle: { color: colors.gold, fontWeight: "900", textAlign: "right" }, verifyText: { color: colors.muted, lineHeight: 21, textAlign: "right", marginTop: 6 },
});
