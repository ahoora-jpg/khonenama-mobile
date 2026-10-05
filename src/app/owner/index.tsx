import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";
import { useBusinessSession } from "../../auth/BusinessSessionContext";

export default function OwnerDashboard() {
  const { profile, logout } = useBusinessSession();
  const stats = [["درخواست‌های دریافتی", String(profile?.business.leadCount ?? 0)], ["تکمیل پروفایل", `${profile?.business.completion ?? 0}٪`], ["وضعیت", profile?.business.verification_status === "verified" ? "تأییدشده" : "در انتظار تأیید"]];
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.modeBar}><Text style={styles.modeTitle}>حالت کسب‌وکار</Text><Pressable onPress={() => router.replace("/")}><Text style={styles.switch}>تغییر به حالت مشتری</Text></Pressable></View>
      <View style={styles.hero}><Text style={styles.eyebrow}>سلام {profile?.owner.fullName || "مدیر کسب‌وکار"}</Text><Text style={styles.title}>{profile?.business.name || "مدیریت کسب‌وکار"}</Text><Text style={styles.subtitle}>درخواست‌هایی که مشتریان از سایت خونه‌نما می‌فرستند اینجا قابل پیگیری هستند.</Text></View>
      <View style={styles.stats}>{stats.map(([label, value]) => <View key={label} style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>)}</View>
      {profile?.business.moderation?.reason && <Text style={styles.subtitle}>دلیل وضعیت غرفه: {profile.business.moderation.reason}؛ اطلاعات را در پروفایل اصلاح کنید یا از پشتیبانی با موضوع اعتراض به وضعیت غرفه پیگیری کنید.</Text>}
      <Text style={styles.sectionTitle}>دسترسی سریع</Text>
      <View style={styles.actions}>
        <Action title="تصاویر و آلبوم‌ها" caption="عکاسی، آپلود و مدیریت نمونه‌کار" onPress={() => router.push("/owner/gallery")} />
        <Action title="لینک و کد تصویری" caption="اشتراک‌گذاری گالری با مشتری" onPress={() => router.push("/owner/public-link")} />
        <Action title="اشتراک" caption="اعتبار و ظرفیت امکانات" onPress={() => router.push("/owner/subscription")} />
        <Action title="خدمات و ساعت کاری" caption="انتخاب خدمات واقعی و روزهای فعالیت" onPress={() => router.push("/owner/services")} />
        <Action title="آمار و نظر مشتریان" caption="بازدید، تماس و بازخورد واقعی" onPress={() => router.push("/owner/insights")} />
        <Action title="درخواست‌ها" caption="مشاهده و پیگیری" onPress={() => router.push("/owner/requests")} />
        <Action title="ارتباط با مشتری" caption="راه‌های پاسخ‌گویی به درخواست" onPress={() => router.push("/owner/messages")} />
        <Action title="کمپین و جشنواره" caption="پیشنهاد اختصاصی و همکاری با همکاران" onPress={() => router.push("/owner/campaigns")} />
        <Action title="پشتیبانی" caption="گزارش مشکل و کد پیگیری" onPress={() => router.push("/support")} />
        <Action title="پروفایل" caption="اطلاعات و خدمات" onPress={() => router.push("/owner/profile")} />
      </View>
      <Pressable style={styles.logout} onPress={async () => { await logout(); router.replace("/business-login"); }}><Text style={styles.logoutText}>خروج از حساب کسب‌وکار</Text></Pressable>
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
  logout: { marginTop: 22, padding: 15, alignItems: "center" }, logoutText: { color: "#A33A32", fontWeight: "800" },
});
