import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { apiRequest } from "../../api/client";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { colors } from "../../theme";

type FormState = { name: string; description: string; city: string; area: string; address: string; phone: string; whatsapp: string; website: string; instagram: string };
const emptyForm: FormState = { name: "", description: "", city: "", area: "", address: "", phone: "", whatsapp: "", website: "", instagram: "" };

export default function OwnerProfile() {
  const { token, profile, refresh } = useBusinessSession();
  const [form, setForm] = useState<FormState>(() => {
    const business = profile?.business;
    return business ? { name: business.name || "", description: business.description || "", city: business.city || "", area: business.area || "", address: business.address || "", phone: business.phone || "", whatsapp: business.whatsapp || "", website: business.website || "", instagram: business.instagram || "" } : emptyForm;
  });
  const [ownerPaused, setOwnerPaused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingVisibility, setLoadingVisibility] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiRequest<{ ok: true; ownerPaused: boolean }>("/api/me/business/visibility", {}, token)
      .then((result) => setOwnerPaused(result.ownerPaused)).catch(() => undefined).finally(() => setLoadingVisibility(false));
  }, [token]);

  function update(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })); }

  async function save() {
    if (form.name.trim().length < 2 || form.city.trim().length < 2 || form.description.trim().length < 20) {
      Alert.alert("اطلاعات ناقص", "نام، شهر و معرفی حداقل ۲۰ حرفی را کامل کنید."); return;
    }
    setSaving(true);
    try {
      await apiRequest("/api/me/business", { method: "PATCH", body: JSON.stringify(form) }, token);
      await refresh();
      Alert.alert("ذخیره شد", "اطلاعات کسب‌وکار با موفقیت به‌روزرسانی شد.");
    } catch (error) { Alert.alert("خطا", error instanceof Error ? error.message : "ذخیره اطلاعات انجام نشد."); }
    finally { setSaving(false); }
  }

  async function changeVisibility(value: boolean) {
    const previous = ownerPaused; setOwnerPaused(value);
    try { await apiRequest("/api/me/business/visibility", { method: "PATCH", body: JSON.stringify({ ownerPaused: value }) }, token); }
    catch (error) { setOwnerPaused(previous); Alert.alert("خطا", error instanceof Error ? error.message : "تغییر وضعیت انجام نشد."); }
  }

  function requestDeletion() {
    Alert.alert("درخواست حذف حساب", "حساب فوراً حذف نمی‌شود؛ درخواست ثبت و پس از احراز مالکیت بررسی خواهد شد.", [
      { text: "انصراف", style: "cancel" },
      { text: "ثبت درخواست", style: "destructive", onPress: async () => {
        try {
          const result = await apiRequest<{ ok: true; requestId: string }>("/api/account-deletion", { method: "POST", body: JSON.stringify({ reason: "درخواست از اپ اندروید" }) }, token);
          Alert.alert("درخواست ثبت شد", `کد پیگیری: ${result.requestId}`);
        } catch (error) { Alert.alert("خطا", error instanceof Error ? error.message : "ثبت درخواست انجام نشد."); }
      } },
    ]);
  }

  const services = profile?.business.services || [];
  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.status}><View style={styles.statusCopy}><Text style={styles.statusTitle}>نمایش و دریافت درخواست</Text><Text style={styles.statusText}>{ownerPaused ? "موقتاً متوقف" : "فعال"}</Text></View><Switch disabled={loadingVisibility} value={!ownerPaused} onValueChange={(active) => void changeVisibility(!active)} trackColor={{ true: colors.greenSoft }} thumbColor={!ownerPaused ? colors.green : colors.muted} /></View>
    <View style={styles.panel}>
      <Text style={styles.title}>اطلاعات واقعی کسب‌وکار</Text><Text style={styles.caption}>تغییرات این بخش در سایت و حساب کسب‌وکار ذخیره می‌شوند.</Text>
      <Field label="نام کسب‌وکار" value={form.name} onChangeText={(value) => update("name", value)} />
      <Field label="شهر" value={form.city} onChangeText={(value) => update("city", value)} />
      <Field label="محله یا محدوده" value={form.area} onChangeText={(value) => update("area", value)} />
      <Field label="شماره تماس" value={form.phone} onChangeText={(value) => update("phone", value)} keyboardType="phone-pad" />
      <Field label="واتساپ" value={form.whatsapp} onChangeText={(value) => update("whatsapp", value)} keyboardType="phone-pad" />
      <Field label="نشانی" value={form.address} onChangeText={(value) => update("address", value)} multiline />
      <Field label="وب‌سایت" value={form.website} onChangeText={(value) => update("website", value)} autoCapitalize="none" keyboardType="url" />
      <Field label="اینستاگرام" value={form.instagram} onChangeText={(value) => update("instagram", value)} autoCapitalize="none" />
      <Field label="معرفی کسب‌وکار" value={form.description} onChangeText={(value) => update("description", value)} multiline />
      <Text style={styles.label}>خدمات ثبت‌شده</Text><View style={styles.tags}>{services.length ? services.map((service) => <Text key={service.id} style={styles.tag}>{service.name}</Text>) : <Text style={styles.empty}>هنوز خدمتی ثبت نشده است.</Text>}</View>
      <Pressable accessibilityRole="button" disabled={saving} style={[styles.button, saving && styles.disabled]} onPress={() => void save()}><Text style={styles.buttonText}>{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</Text></Pressable>
    </View>
    <View style={styles.verify}><Text style={styles.verifyTitle}>وضعیت مالکیت: {profile?.business.verification_status === "verified" ? "تأییدشده" : "در انتظار بررسی"}</Text><Text style={styles.verifyText}>تکمیل پروفایل: {profile?.business.completion ?? 0}٪</Text></View>
    <View style={styles.legal}><Text style={styles.legalTitle}>حریم خصوصی و حساب</Text><Pressable onPress={() => Linking.openURL("https://khonenama.ir/privacy")}><Text style={styles.legalLink}>حریم خصوصی</Text></Pressable><Pressable onPress={() => Linking.openURL("https://khonenama.ir/help")}><Text style={styles.legalLink}>راهنما و پشتیبانی</Text></Pressable><Pressable onPress={requestDeletion}><Text style={styles.deleteLink}>درخواست حذف حساب</Text></Pressable></View>
  </ScrollView>;
}

function Field({ label, multiline, ...props }: { label: string; multiline?: boolean } & React.ComponentProps<typeof TextInput>) {
  return <><Text style={styles.label}>{label}</Text><TextInput {...props} multiline={multiline} textAlign="right" textAlignVertical={multiline ? "top" : "center"} style={[styles.input, multiline && styles.multiline]} /></>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 16, paddingBottom: 40 },
  status: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderRadius: 18, padding: 17, borderWidth: 1, borderColor: colors.line }, statusCopy: { flex: 1 }, statusTitle: { color: colors.ink, fontWeight: "900", textAlign: "right" }, statusText: { color: colors.green, textAlign: "right", marginTop: 4, fontSize: 12 },
  panel: { backgroundColor: colors.white, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.line, marginTop: 12 }, title: { color: colors.ink, fontSize: 20, fontWeight: "900", textAlign: "right" }, caption: { color: colors.muted, textAlign: "right", marginTop: 5, lineHeight: 20, fontSize: 11 }, label: { color: colors.muted, textAlign: "right", marginTop: 15, marginBottom: 6, fontSize: 12 },
  input: { minHeight: 49, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 10, color: colors.ink, backgroundColor: "#FAFBFA" }, multiline: { minHeight: 92 }, tags: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 7 }, tag: { color: colors.green, backgroundColor: colors.greenSoft, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, overflow: "hidden" }, empty: { color: colors.muted, textAlign: "right" },
  button: { height: 50, borderRadius: 14, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", marginTop: 22 }, disabled: { opacity: 0.6 }, buttonText: { color: colors.white, fontWeight: "900" }, verify: { backgroundColor: "#FFF8EA", borderRadius: 18, padding: 16, marginTop: 12 }, verifyTitle: { color: colors.gold, fontWeight: "900", textAlign: "right" }, verifyText: { color: colors.muted, lineHeight: 21, textAlign: "right", marginTop: 6 },
  legal: { backgroundColor: colors.white, borderRadius: 18, padding: 16, marginTop: 12, gap: 12 }, legalTitle: { color: colors.ink, fontWeight: "900", textAlign: "right" }, legalLink: { color: colors.green, fontWeight: "800", textAlign: "right" }, deleteLink: { color: "#A33A32", fontWeight: "800", textAlign: "right" },
});
