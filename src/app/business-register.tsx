import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError, normalizeIranPhone } from "../api/client";
import { useBusinessSession } from "../auth/BusinessSessionContext";
import { ErrorText, Field, SubmitButton } from "../components/AuthForm";
import { colors } from "../theme";

const categories = [
  { slug: "curtain", label: "پرده", service: "پرده زبرا" }, { slug: "flooring", label: "کفپوش", service: "نصب کفپوش" },
  { slug: "carpet", label: "موکت", service: "نصب موکت" }, { slug: "wallpaper", label: "کاغذ دیواری", service: "کاغذ دیواری" },
  { slug: "interior-design", label: "طراحی داخلی", service: "طراحی داخلی" }, { slug: "smart-home", label: "خانه هوشمند", service: "طراحی و اجرای سیستم هوشمند" },
];
const errors: Record<string, string> = { PHONE_IN_USE: "این شماره قبلاً ثبت شده؛ از صفحه ورود استفاده کنید.", EMAIL_IN_USE: "این ایمیل قبلاً استفاده شده است.", INVALID_EXISTING_PASSWORD: "رمز حساب موجود درست نیست.", INVALID_PHONE: "شماره موبایل معتبر نیست.", INVALID_PASSWORD: "رمز عبور معتبر نیست.", INCOMPLETE_PROFILE: "اطلاعات معرفی کسب‌وکار را کامل‌تر کنید." };

export default function BusinessRegisterScreen() {
  const { register } = useBusinessSession();
  const [form, setForm] = useState({ ownerName: "", phone: "", password: "", businessName: "", city: "", area: "", description: "" });
  const [category, setCategory] = useState(categories[0]); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (value: string) => setForm((old) => ({ ...old, [key]: value }));
  async function submit() {
    if (busy) return;
    const phone = normalizeIranPhone(form.phone);
    if (!form.ownerName.trim() || !form.businessName.trim() || !form.city.trim() || !/^09\d{9}$/.test(phone) || form.password.length < 8 || form.description.trim().length < 20) { setError("همه موارد را کامل کنید؛ معرفی کسب‌وکار باید حداقل ۲۰ حرف باشد."); return; }
    setBusy(true); setError("");
    try { await register({ ...form, phone, ownerName: form.ownerName.trim(), businessName: form.businessName.trim(), city: form.city.trim(), area: form.area.trim(), description: form.description.trim(), categories: [category.slug], services: [category.service], serviceAreas: [form.area.trim() || form.city.trim()], businessType: "store" }); router.replace("/owner"); }
    catch (e) { const code = e instanceof ApiError ? e.code : ""; setError(errors[code] || (e instanceof Error ? e.message : "ثبت انجام نشد.")); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>ساخت حساب و ثبت کسب‌وکار</Text><Text style={styles.intro}>این حساب در سایت و اپ یکی است. بعد از ثبت، درخواست‌های مشتریان سایت را همین‌جا دریافت و مدیریت می‌کنید.</Text>
    <Field label="نام و نام خانوادگی مدیر" value={form.ownerName} onChangeText={set("ownerName")} placeholder="نام صاحب کسب‌وکار" />
    <Field label="شماره موبایل" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" placeholder="09123456789" />
    <Field label="رمز عبور" value={form.password} onChangeText={set("password")} secureTextEntry placeholder="حداقل ۸ حرف" />
    <Field label="نام کسب‌وکار" value={form.businessName} onChangeText={set("businessName")} placeholder="مثلاً پرده‌سرای ..." />
    <Field label="شهر" value={form.city} onChangeText={set("city")} placeholder="مثلاً کرج" /><Field label="محله یا محدوده خدمت" value={form.area} onChangeText={set("area")} placeholder="مثلاً گوهردشت" />
    <Text style={styles.label}>دسته کسب‌وکار</Text><View style={styles.chips}>{categories.map((item) => <Pressable key={item.slug} onPress={() => setCategory(item)} style={[styles.chip, category.slug === item.slug && styles.chipActive]}><Text style={[styles.chipText, category.slug === item.slug && styles.chipTextActive]}>{item.label}</Text></Pressable>)}</View>
    <Field label="معرفی کوتاه کسب‌وکار" value={form.description} onChangeText={set("description")} multiline numberOfLines={4} placeholder="خدمات، سابقه و مزیت کسب‌وکارتان را بنویسید…" />
    <ErrorText>{error}</ErrorText><SubmitButton title="ثبت و ورود به پنل" busy={busy} onPress={submit} /><Pressable onPress={() => router.replace("/business-login")}><Text style={styles.link}>قبلاً ثبت‌نام کرده‌ام؛ ورود</Text></Pressable>
  </ScrollView></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 20, gap: 14, paddingBottom: 44 }, title: { color: colors.ink, fontSize: 25, fontWeight: "900", textAlign: "right" }, intro: { color: colors.muted, lineHeight: 24, textAlign: "right", marginBottom: 4 }, label: { color: colors.ink, fontWeight: "800", textAlign: "right" }, chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }, chip: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 20 }, chipActive: { backgroundColor: colors.green, borderColor: colors.green }, chipText: { color: colors.ink, fontWeight: "700" }, chipTextActive: { color: colors.white }, link: { color: colors.green, fontWeight: "900", textAlign: "center", padding: 10 } });
