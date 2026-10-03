import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { apiRequest } from "../../api/client";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { BUSINESS_CATEGORIES } from "../../business-taxonomy";
import { ToolButton, toolStyles as s } from "../../components/OwnerTools";

type Hour = { weekday: number; opensAt: string; closesAt: string; isClosed: boolean };
const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
const englishDigits = (value: string) => value.replace(/[۰-۹]/g, c => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g, c => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
export default function Services() {
  const { token, refresh } = useBusinessSession();
  const [categories, setCategories] = useState<string[]>([]), [services, setServices] = useState<string[]>([]), [hours, setHours] = useState<Hour[]>([]);
  const [busy, setBusy] = useState(false), [ready, setReady] = useState(false), [message, setMessage] = useState("");
  useEffect(() => {
    void Promise.all([apiRequest<{ categories: string[]; services: string[] }>("/api/me/business/taxonomy", {}, token), apiRequest<{ hours: { weekday: number; opens_at: string | null; closes_at: string | null; is_closed: number }[] }>("/api/me/business/hours", {}, token)])
      .then(([t, h]) => { setCategories(t.categories); setServices(t.services); setHours(days.map((_, weekday) => { const row = h.hours.find(r => r.weekday === weekday); return { weekday, opensAt: row?.opens_at || "", closesAt: row?.closes_at || "", isClosed: Boolean(row?.is_closed) }; })); setReady(true); })
      .catch(() => setMessage("اطلاعات دریافت نشد؛ از پنل خارج و دوباره این بخش را باز کنید."));
  }, [token]);
  const available = BUSINESS_CATEGORIES.filter(c => categories.includes(c.slug)).flatMap(c => [...c.services]);
  function toggleCategory(slug: string) {
    const next = categories.includes(slug) ? categories.filter(s => s !== slug) : [...categories, slug]; setCategories(next);
    const allowed = BUSINESS_CATEGORIES.filter(c => next.includes(c.slug)).flatMap(c => [...c.services]); setServices(v => v.filter(s => allowed.includes(s)));
  }
  async function save(path: string, body: unknown) { setBusy(true); setMessage(""); try { await apiRequest(path, { method: "PUT", body: JSON.stringify(body) }, token); await refresh(); setMessage("تغییرات روی سایت و اپ ذخیره شدند."); } catch(e) { setMessage(e instanceof Error ? e.message : "ذخیره انجام نشد."); } finally { setBusy(false); } }
  const chip = (label: string, checked: boolean, onPress: () => void) => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} key={label} disabled={busy} onPress={onPress} style={{ borderWidth: 1, borderColor: checked ? "#176B4D" : "#ddd", padding: 10, borderRadius: 10, backgroundColor: checked ? "#E5EFEA" : "white" }}><Text>{label}</Text></Pressable>;
  return <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><View style={s.panel}><Text style={s.title}>دسته‌ها و خدمات واقعی</Text><View style={s.row}>{BUSINESS_CATEGORIES.map(c => chip(c.label, categories.includes(c.slug), () => toggleCategory(c.slug)))}</View><Text style={s.text}>خدماتی را که ارائه می‌دهید انتخاب کنید.</Text><View style={s.row}>{available.map(service => chip(service, services.includes(service), () => setServices(v => v.includes(service) ? v.filter(s => s !== service) : [...v, service])))}</View><ToolButton title="ذخیره خدمات" disabled={busy || !ready || !categories.length || !services.length} onPress={() => void save("/api/me/business/taxonomy", { categories, services })} /></View><View style={s.panel}><Text style={s.title}>ساعت کاری</Text><Text style={s.text}>ساعت با قالب 09:00 وارد شود. روزهای بدون فعالیت را تعطیل کنید.</Text>{hours.map(h => <View key={h.weekday}><Text style={s.text}>{days[h.weekday]}</Text><View style={s.row}><Text>تعطیل</Text><Switch disabled={busy} value={h.isClosed} onValueChange={isClosed => setHours(v => v.map(row => row.weekday === h.weekday ? { ...row, isClosed } : row))} /></View>{!h.isClosed && <View style={s.row}><TextInput accessibilityLabel={`شروع ${days[h.weekday]}`} style={[s.input, { width: "45%", textAlign: "center" }]} placeholder="شروع 09:00" value={h.opensAt} maxLength={5} onChangeText={opensAt => setHours(v => v.map(row => row.weekday === h.weekday ? { ...row, opensAt: englishDigits(opensAt) } : row))} /><TextInput accessibilityLabel={`پایان ${days[h.weekday]}`} style={[s.input, { width: "45%", textAlign: "center" }]} placeholder="پایان 18:00" value={h.closesAt} maxLength={5} onChangeText={closesAt => setHours(v => v.map(row => row.weekday === h.weekday ? { ...row, closesAt: englishDigits(closesAt) } : row))} /></View>}</View>)}<ToolButton title="ذخیره ساعت کاری" disabled={busy || !ready} onPress={() => { if (hours.some(h => !h.isClosed && (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h.opensAt) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(h.closesAt) || h.opensAt >= h.closesAt))) { setMessage("ساعت شروع و پایان روزهای باز را درست وارد کنید؛ پایان باید بعد از شروع باشد."); return; } void save("/api/me/business/hours", { hours }); }} /></View>{message ? <Text accessibilityRole="alert" style={s.text}>{message}</Text> : null}</ScrollView>;
}
