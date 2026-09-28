import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiRequest } from "../../../api/client";
import { useBusinessSession } from "../../../auth/BusinessSessionContext";
import { ScreenState } from "../../../components/ScreenState";
import { colors } from "../../../theme";
import type { Lead } from "../requests";

const labels: Record<string, string> = { open: "جدید", matched: "در حال پیگیری", closed: "بسته‌شده", cancelled: "لغوشده" };
export default function RequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { token } = useBusinessSession();
  const [item, setItem] = useState<Lead | null>(null); const [loading, setLoading] = useState(true); const [loadError, setLoadError] = useState(""); const [price, setPrice] = useState(""); const [message, setMessage] = useState(""); const [sending, setSending] = useState(false);
  const load = useCallback(async () => { try { const result = await apiRequest<{ ok: true; leads: Lead[] }>("/api/me/business/leads", {}, token); setLoadError(""); setItem(result.leads.find((lead) => String(lead.id) === String(id)) || null); } catch (error) { setLoadError(error instanceof Error ? error.message : "دریافت درخواست انجام نشد."); } finally { setLoading(false); } }, [id, token]);
  useEffect(() => {
    let active = true;
    apiRequest<{ ok: true; leads: Lead[] }>("/api/me/business/leads", {}, token)
      .then((result) => { if (active) { setLoadError(""); setItem(result.leads.find((lead) => String(lead.id) === String(id)) || null); } })
      .catch((error) => { if (active) setLoadError(error instanceof Error ? error.message : "دریافت درخواست انجام نشد."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, token]);
  async function update(payload: Record<string, unknown>, success: string) { if (sending) return; setSending(true); try { await apiRequest("/api/me/business/leads", { method: "PATCH", body: JSON.stringify({ leadId: Number(id), ...payload }) }, token); Alert.alert("انجام شد", success); await load(); } catch (e) { Alert.alert("خطا", e instanceof Error ? e.message : "عملیات انجام نشد"); } finally { setSending(false); } }
  if (loading) return <ScreenState title="در حال دریافت درخواست" message="کمی صبر کنید…" />;
  if (loadError) return <ScreenState title="ارتباط برقرار نشد" message={loadError} onRetry={() => { setLoading(true); void load(); }} />;
  if (!item) return <ScreenState title="درخواست پیدا نشد" message="ممکن است این درخواست حذف شده باشد." />;
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}><View style={styles.panel}><Text style={styles.title}>درخواست #{item.id}</Text><Text style={styles.customer}>{item.customer_name} · {item.customer_phone}</Text><Text style={styles.description}>{item.request_text}</Text><Text style={styles.meta}>محدوده: {[item.city, item.area].filter(Boolean).join("، ")}</Text><Text style={styles.meta}>وضعیت: {labels[item.status] || item.status}</Text></View>
    <View style={styles.panel}><Text style={styles.section}>ارسال پیشنهاد به مشتری</Text><TextInput accessibilityLabel="مبلغ پیشنهادی به تومان" value={price} onChangeText={setPrice} placeholder="مبلغ پیشنهادی (تومان)" textAlign="right" style={styles.input} keyboardType="numeric"/><TextInput accessibilityLabel="توضیح پیشنهاد و زمان انجام" value={message} onChangeText={setMessage} placeholder="توضیح پیشنهاد و زمان انجام" textAlign="right" style={[styles.input, styles.message]} multiline/><Pressable accessibilityRole="button" accessibilityState={{ disabled: sending, busy: sending }} disabled={sending} style={styles.primary} onPress={() => update({ action: "quote", amount: price, message }, "پیشنهاد شما برای مشتری ثبت شد.")}><Text style={styles.primaryText}>{sending ? "در حال ارسال…" : "ارسال پیشنهاد"}</Text></Pressable></View>
    <View style={styles.panel}><Text style={styles.section}>وضعیت درخواست</Text><View style={styles.actions}><Pressable style={styles.secondary} onPress={() => update({ action: "status", status: "matched" }, "درخواست در حال پیگیری است.")}><Text style={styles.secondaryText}>در حال پیگیری</Text></Pressable><Pressable style={styles.secondary} onPress={() => update({ action: "status", status: "closed" }, "درخواست بسته شد.")}><Text style={styles.secondaryText}>بستن درخواست</Text></Pressable></View></View>
  </ScrollView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 16, paddingBottom: 40 }, panel: { backgroundColor: colors.white, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.line, marginBottom: 12 }, title: { color: colors.ink, fontSize: 21, fontWeight: "900", textAlign: "right" }, customer: { color: colors.green, fontWeight: "800", textAlign: "right", marginTop: 9 }, description: { color: colors.ink, textAlign: "right", lineHeight: 25, marginTop: 15 }, meta: { color: colors.muted, textAlign: "right", marginTop: 8 }, section: { color: colors.ink, fontSize: 18, fontWeight: "900", textAlign: "right", marginBottom: 12 }, input: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, backgroundColor: "#FAFBFA", marginBottom: 10 }, message: { minHeight: 90, paddingTop: 12 }, primary: { height: 49, backgroundColor: colors.green, borderRadius: 14, alignItems: "center", justifyContent: "center" }, primaryText: { color: colors.white, fontWeight: "900" }, actions: { gap: 9 }, secondary: { height: 46, borderRadius: 13, backgroundColor: colors.greenSoft, alignItems: "center", justifyContent: "center" }, secondaryText: { color: colors.green, fontWeight: "900" } });
