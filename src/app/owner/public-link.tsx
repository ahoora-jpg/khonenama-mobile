import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Share, Text, TextInput, View } from "react-native";
import { SvgXml } from "react-native-svg";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { API_BASE, apiRequest } from "../../api/client";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { ToolButton, toolStyles as s } from "../../components/OwnerTools";

export default function PublicLink() {
  const { token, profile, refresh } = useBusinessSession();
  const [slug, setSlug] = useState(profile?.business.slug || ""), [svg, setSvg] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const publicUrl = `${API_BASE}/business/${profile?.business.slug || ""}`;
  const galleryUrl = `${API_BASE}/g/${profile?.business.id || ""}`;
  const loadQr = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/me/business/qr`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("دریافت کد تصویری انجام نشد؛ دوباره تلاش کنید.");
    const xml = await response.text();
    if (!xml.includes("<svg")) throw new Error("کد تصویری معتبر دریافت نشد.");
    setSvg(xml);
  }, [token]);
  useEffect(() => { void Promise.resolve().then(loadQr).catch(e => setError(e.message)); }, [loadQr]);
  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError(""); try { await action(); } catch(e) { setError(e instanceof Error ? e.message : "عملیات انجام نشد."); } finally { setBusy(false); }
  }
  async function shareQr() {
    if (!(await Sharing.isAvailableAsync())) { await Share.share({ message: `از آلبوم کارهای ما دیدن کنید\n${galleryUrl}` }); return; }
    const path = `${FileSystem.cacheDirectory}khonenama-gallery-${profile?.business.id}.svg`;
    await FileSystem.writeAsStringAsync(path, svg);
    try { await Sharing.shareAsync(path, { mimeType: "image/svg+xml", dialogTitle: "کد تصویری گالری کسب‌وکار", UTI: "public.svg-image" }); }
    finally { await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => undefined); }
  }
  return <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <View style={s.panel}><Text style={s.title}>لینک اختصاصی کسب‌وکار</Text><Text selectable style={[s.text, { writingDirection: "ltr" }]}>{publicUrl}</Text><ToolButton title="اشتراک‌گذاری لینک" disabled={!profile} onPress={() => void run(() => Share.share({ message: publicUrl }))} /><TextInput accessibilityLabel="نام لینک اختصاصی" style={[s.input, { textAlign: "left" }]} value={slug} onChangeText={setSlug} autoCapitalize="none" autoCorrect={false} maxLength={100} /><ToolButton title="ذخیره لینک" disabled={busy || !slug.trim()} onPress={() => Alert.alert("تغییر لینک", "لینک قبلی به نشانی جدید هدایت می‌شود؛ کد تصویری ثابت می‌ماند.", [{ text: "انصراف" }, { text: "ذخیره", onPress: () => void run(async () => { await apiRequest("/api/me/business/public-link", { method: "PATCH", body: JSON.stringify({ slug }) }, token); await refresh(); }) }])} /></View>
    <View style={s.panel}><Text style={s.title}>از آلبوم کارهای ما دیدن کنید</Text>{svg ? <View style={{ alignItems: "center", backgroundColor: "white", padding: 8 }}><SvgXml xml={svg} width={240} height={240} /></View> : <Text style={s.text}>در حال دریافت کد تصویری…</Text>}<Text style={s.text}>اسکن این کد مستقیماً گالری همین کسب‌وکار را باز می‌کند. با تغییر نام لینک، کد ثابت می‌ماند. اگر نمایش کسب‌وکار متوقف باشد، صفحه عمومی باز نمی‌شود.</Text><ToolButton title="اشتراک‌گذاری کد برای چاپ" disabled={busy || !svg} onPress={() => void run(shareQr)} /><ToolButton title="باز کردن گالری" onPress={() => void run(() => Linking.openURL(galleryUrl))} /><ToolButton title="دریافت دوباره کد" disabled={busy} onPress={() => void run(loadQr)} />{error ? <Text accessibilityRole="alert" style={s.text}>{error}</Text> : null}</View>
  </ScrollView>;
}
