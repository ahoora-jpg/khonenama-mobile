import { router } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError, normalizeIranPhone } from "../api/client";
import { useBusinessSession } from "../auth/BusinessSessionContext";
import { ErrorText, Field, SubmitButton } from "../components/AuthForm";
import { colors } from "../theme";

const messages: Record<string, string> = {
  INVALID_CREDENTIALS: "شماره تلفن یا رمز عبور درست نیست.", TOO_MANY_ATTEMPTS: "تعداد تلاش‌ها زیاد بود؛ کمی بعد دوباره امتحان کنید.",
  NO_BUSINESS: "برای این شماره هنوز کسب‌وکاری ثبت نشده است.", PASSWORD_REHASH_REQUIRED: "رمز این حساب نیاز به به‌روزرسانی دارد؛ از سایت وارد شوید.",
};

export default function BusinessLoginScreen() {
  const { login, token, loading } = useBusinessSession();
  const [phone, setPhone] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (!loading && token) router.replace("/owner"); }, [loading, token]);

  async function submit() {
    if (busy) return;
    const normalizedPhone = normalizeIranPhone(phone);
    if (!/^09\d{9}$/.test(normalizedPhone) || password.length < 8) { setError("شماره موبایل و رمز عبور حداقل ۸ حرفی را کامل وارد کنید."); return; }
    setBusy(true); setError("");
    try { await login(normalizedPhone, password); router.replace("/owner"); }
    catch (e) { const code = e instanceof ApiError ? e.code : ""; setError(messages[code] || (e instanceof Error ? e.message : "ورود انجام نشد.")); }
    finally { setBusy(false); }
  }

  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.hero}><Text style={styles.kicker}>ویژه صاحبان کسب‌وکار</Text><Text style={styles.title}>مدیریت کسب‌وکار خونه‌نما</Text><Text style={styles.copy}>با همان شماره موبایل و رمزی که در سایت ساخته‌اید وارد شوید. قبل از ورود، هیچ اطلاعات مدیریتی نمایش داده نمی‌شود.</Text></View>
    <View style={styles.form}><Field label="شماره موبایل" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="09123456789" autoComplete="tel" /><Field label="رمز عبور" value={password} onChangeText={setPassword} placeholder="حداقل ۸ حرف" secureTextEntry autoComplete="password" /><ErrorText>{error}</ErrorText><SubmitButton title="ورود به مدیریت کسب‌وکار" busy={busy} onPress={submit} /></View>
    <View style={styles.register}><Text style={styles.registerTitle}>هنوز کسب‌وکارت را ثبت نکرده‌ای؟</Text><Pressable onPress={() => router.push("/business-register")}><Text style={styles.link}>ساخت حساب و ثبت کسب‌وکار</Text></Pressable></View>
    <Pressable onPress={() => router.replace("/")}><Text style={styles.customer}>ورود به حالت مشتری</Text></Pressable>
  </ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 20, gap: 18, paddingBottom: 40 }, hero: { backgroundColor: colors.green, padding: 22, borderRadius: 24 }, kicker: { color: "#CFE2D8", textAlign: "right", fontWeight: "700" }, title: { color: colors.white, fontSize: 26, fontWeight: "900", textAlign: "right", marginTop: 8 }, copy: { color: "#E5EFEA", textAlign: "right", lineHeight: 24, marginTop: 9 }, form: { gap: 14 }, register: { backgroundColor: colors.white, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.line }, registerTitle: { color: colors.ink, textAlign: "right", fontWeight: "800" }, link: { color: colors.green, textAlign: "right", fontWeight: "900", marginTop: 9 }, customer: { color: colors.green, textAlign: "center", fontWeight: "900", padding: 10 } });
