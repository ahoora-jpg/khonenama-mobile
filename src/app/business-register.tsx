import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError, normalizeIranPhone } from "../api/client";
import { useBusinessSession } from "../auth/BusinessSessionContext";
import { ErrorText, Field, SubmitButton } from "../components/AuthForm";
import { colors } from "../theme";
import { BUSINESS_CATEGORIES } from "../business-taxonomy";

import { ServiceGroupChoices } from "../components/ServiceGroupChoices";

const categories = BUSINESS_CATEGORIES;
const errors: Record<string, string> = { PHONE_IN_USE: "این شماره قبلاً ثبت شده؛ از صفحه ورود استفاده کنید.", EMAIL_IN_USE: "این ایمیل قبلاً استفاده شده است.", INVALID_EXISTING_PASSWORD: "رمز حساب موجود درست نیست.", INVALID_PHONE: "شماره موبایل معتبر نیست.", INVALID_PASSWORD: "رمز عبور معتبر نیست.", INCOMPLETE_PROFILE: "اطلاعات معرفی کسب‌وکار را کامل‌تر کنید." };

export default function BusinessRegisterScreen() {
  const { register } = useBusinessSession();
  const [form, setForm] = useState({ ownerName: "", phone: "", password: "", businessName: "", city: "", area: "", description: "" });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([categories[0].slug]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const availableServices = categories.filter(c => selectedCategories.includes(c.slug)).flatMap(c => [...c.services]);
  function toggleCategory(slug: string) {
    const next = selectedCategories.includes(slug) ? selectedCategories.filter(s => s !== slug) : [...selectedCategories, slug];
    setSelectedCategories(next);
    const allowed = categories.filter(c => next.includes(c.slug)).flatMap(c => [...c.services]);
    setSelectedServices(old => old.filter(s => allowed.includes(s)));
  }
  const set = (key: keyof typeof form) => (value: string) => setForm((old) => ({ ...old, [key]: value }));
  async function submit() {
    if (busy) return;
    const phone = normalizeIranPhone(form.phone);
    if (!selectedCategories.length || !selectedServices.length) { setError("حداقل یک دسته و یک خدمت واقعی انتخاب کنید."); return; }
    if (!form.ownerName.trim() || !form.businessName.trim() || !form.city.trim() || !/^09\d{9}$/.test(phone) || form.password.length < 8 || form.description.trim().length < 20) { setError("همه موارد را کامل کنید؛ معرفی کسب‌وکار باید حداقل ۲۰ حرف باشد."); return; }
    setBusy(true); setError("");
    try { await register({ ...form, phone, ownerName: form.ownerName.trim(), businessName: form.businessName.trim(), city: form.city.trim(), area: form.area.trim(), description: form.description.trim(), categories: selectedCategories, services: selectedServices, serviceAreas: [form.area.trim() ? `${form.city.trim()} / ${form.area.trim()}` : `تمام ${form.city.trim()}`], businessType: "store" }); router.replace("/owner/gallery"); }
    catch (e) { const code = e instanceof ApiError ? e.code : ""; setError(errors[code] || (e instanceof Error ? e.message : "ثبت انجام نشد.")); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>ساخت حساب و ثبت کسب‌وکار</Text><Text style={styles.intro}>این حساب در سایت و اپ یکی است. بعد از ثبت، درخواست‌های مشتریان سایت را همین‌جا دریافت و مدیریت می‌کنید.</Text>
    <View style={styles.chips}><Text style={styles.intro}>پایه رایگان: ۱۰ عکس + کاور و پروفایل
حرفه‌ای: ۳۰ عکس + ۲ ویدیو؛ ۲۵۰ هزار تومان / ۳۰ روز
ویژه: ۷۰ عکس + ۵ ویدیو؛ ۳۵۰ هزار تومان / ۳۰ روز
همه ابتدا با پایه رایگان ثبت‌نام می‌کنند. ویدیو: MP4، حداکثر ۲۰ ثانیه و ۱۵ مگابایت.</Text></View><Field label="نام و نام خانوادگی مدیر" value={form.ownerName} onChangeText={set("ownerName")} placeholder="نام صاحب کسب‌وکار" />
    <Field label="شماره موبایل" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" placeholder="09123456789" />
    <Field label="رمز عبور" value={form.password} onChangeText={set("password")} secureTextEntry placeholder="حداقل ۸ حرف" />
    <Field label="نام کسب‌وکار" value={form.businessName} onChangeText={set("businessName")} placeholder="مثلاً پرده‌سرای ..." />
    <Field label="شهر" value={form.city} onChangeText={set("city")} placeholder="نام شهر" /><Field label="محله یا محدوده خدمت" value={form.area} onChangeText={set("area")} placeholder="نام محله یا محدوده" />
    <Text style={styles.label}>دسته‌های کسب‌وکار</Text><View style={styles.chips}>{categories.map(item => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selectedCategories.includes(item.slug) }} key={item.slug} onPress={() => toggleCategory(item.slug)} style={[styles.chip, selectedCategories.includes(item.slug) && styles.chipActive]}><Text style={[styles.chipText, selectedCategories.includes(item.slug) && styles.chipTextActive]}>{item.label}</Text></Pressable>)}</View>
    <Text style={styles.label}>خدماتی که ارائه می‌دهید</Text><ServiceGroupChoices services={availableServices} selected={selectedServices} disabled={busy} onToggle={service=>setSelectedServices(v=>v.includes(service)?v.filter(x=>x!==service):[...v,service])}/>
    <Field label="معرفی کوتاه کسب‌وکار" value={form.description} onChangeText={set("description")} multiline numberOfLines={4} placeholder="خدمات، سابقه و مزیت کسب‌وکارتان را بنویسید…" />
    <ErrorText>{error}</ErrorText><SubmitButton title="ثبت و ورود به پنل" busy={busy} onPress={submit} /><Pressable onPress={() => router.replace("/business-login")}><Text style={styles.link}>قبلاً ثبت‌نام کرده‌ام؛ ورود</Text></Pressable>
  </ScrollView></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 20, gap: 14, paddingBottom: 44 }, title: { color: colors.ink, fontSize: 25, fontWeight: "900", textAlign: "right" }, intro: { color: colors.muted, lineHeight: 24, textAlign: "right", marginBottom: 4 }, label: { color: colors.ink, fontWeight: "800", textAlign: "right" }, chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }, chip: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 20 }, chipActive: { backgroundColor: colors.green, borderColor: colors.green }, chipText: { color: colors.ink, fontWeight: "700" }, chipTextActive: { color: colors.white }, link: { color: colors.green, fontWeight: "900", textAlign: "center", padding: 10 } });
