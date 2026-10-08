import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { apiRequest } from "../../api/client";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { ScreenState } from "../../components/ScreenState";
import { colors } from "../../theme";

import type { QuoteTerms } from '../../quote-terms';
export type Lead = {revision?:string;terms?:QuoteTerms;recipient_status?:string;agreed?:{amount:number}; id: number; customer_name: string; customer_phone: string; request_text: string; city: string; area: string; budget_min: number | null; budget_max: number | null; status: string; created_at: string; quote_amount: number | null; quote_message: string | null; quote_status: string | null };
const labels: Record<string, string> = { open: "جدید", matched: "در حال پیگیری", closed: "بسته‌شده", cancelled: "لغوشده" };

export default function RequestsScreen() {
  const { token } = useBusinessSession();
  const [data, setData] = useState<Lead[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { const result = await apiRequest<{ ok: true; leads: Lead[] }>("/api/me/business/leads", {}, token); setError(""); setData(result.leads); }
    catch (e) { setError(e instanceof Error ? e.message : "خطا در دریافت درخواست‌ها"); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => {
    let active = true;
    apiRequest<{ ok: true; leads: Lead[] }>("/api/me/business/leads", {}, token)
      .then((result) => { if (active) { setError(""); setData(result.leads); } })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : "خطا در دریافت درخواست‌ها"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);
  useEffect(()=>{const listener=AppState.addEventListener("change",state=>{if(state==="active")void load();});return()=>listener.remove();},[load]);
  if (loading) return <ScreenState title="در حال دریافت درخواست‌ها" message="کمی صبر کنید…" />;
  if (error) return <ScreenState title="ارتباط برقرار نشد" message={error} onRetry={() => { setLoading(true); void load(); }} />;
  return <View style={styles.page}><FlatList data={data} keyExtractor={(item) => String(item.id)} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />} contentContainerStyle={styles.list} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => router.push(`/owner/request/${item.id}`)}>
    <View style={styles.row}><Text style={styles.title}>درخواست #{item.id}</Text><Text style={styles.badge}>{labels[item.recipient_status || item.status] || item.status}</Text></View>
    <Text style={styles.customer}>{item.customer_name} · {[item.city, item.area].filter(Boolean).join("، ")}</Text><Text style={styles.description} numberOfLines={3}>{item.request_text}</Text>
    <View style={styles.footer}><Text style={styles.status}>{item.quote_status === "sent" ? "پیشنهاد ارسال شده" : "نیازمند پاسخ"}</Text><Text style={styles.time}>{new Date(item.created_at).toLocaleDateString("fa-IR")}</Text></View>
  </Pressable>} ListEmptyComponent={<Text style={styles.empty}>فعلاً درخواست جدیدی برای کسب‌وکار شما ثبت نشده است.</Text>} /></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.cream }, list: { padding: 16, paddingBottom: 40 }, card: { backgroundColor: colors.white, padding: 17, borderRadius: 19, borderWidth: 1, borderColor: colors.line, marginBottom: 12 }, row: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }, title: { color: colors.ink, fontSize: 17, fontWeight: "900", textAlign: "right" }, badge: { color: colors.green, backgroundColor: colors.greenSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, overflow: "hidden", fontSize: 11 }, customer: { color: colors.green, textAlign: "right", marginTop: 8, fontWeight: "700" }, description: { color: colors.muted, lineHeight: 22, textAlign: "right", marginTop: 8 }, footer: { flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 13 }, status: { color: colors.gold, fontWeight: "800" }, time: { color: colors.muted, fontSize: 12 }, empty: { color: colors.muted, textAlign: "center", marginTop: 60, lineHeight: 24 } });
