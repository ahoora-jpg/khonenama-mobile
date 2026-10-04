import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { apiRequest } from "../../api/client";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { ToolButton, toolStyles as s } from "../../components/OwnerTools";
type Review = { id: number; rating: number; title: string; body: string; status: string; reply?: string };
export default function Insights() {
  const { token } = useBusinessSession();
  const [drafts, setDrafts] = useState<Record<number,string>>({});
  const [saving, setSaving] = useState(false);
  async function saveReply(review: Review) {
    setSaving(true);
    try {
      const body = (drafts[review.id] ?? review.reply ?? "").trim();
      await apiRequest("/api/me/business/reviews", { method: "POST", body: JSON.stringify({ reviewId: review.id, body }) }, token);
      setReviews(items => items.map(item => item.id === review.id ? { ...item, reply: body } : item)); setMessage("پاسخ ذخیره شد.");
    } catch { setMessage("ذخیره پاسخ انجام نشد؛ متن باید بین ۳ و ۱۵۰۰ نویسه باشد."); }
    finally { setSaving(false); }
  }
  const [totals, setTotals] = useState<Record<string, number>>({}), [reviews, setReviews] = useState<Review[]>([]), [message, setMessage] = useState("در حال دریافت…");
  useEffect(() => { void Promise.all([apiRequest<{ totals: Record<string, number> }>("/api/me/business/analytics", {}, token), apiRequest<{ reviews: Review[] }>("/api/me/business/reviews", {}, token)]).then(([a, r]) => { setTotals(a.totals); setReviews(r.reviews); setMessage(""); }).catch(() => setMessage("دریافت اطلاعات انجام نشد؛ این بخش را دوباره باز کنید.")); }, [token]);
  return <ScrollView style={s.page} contentContainerStyle={s.content}><View style={s.panel}><Text style={s.title}>آمار واقعی ۳۰ روز گذشته</Text>{[["profileViews", "بازدید پروفایل"], ["phoneClicks", "کلیک تماس"], ["whatsappClicks", "کلیک واتساپ"], ["websiteClicks", "کلیک وب‌سایت"], ["instagramClicks", "کلیک اینستاگرام"], ["quoteStarts", "شروع درخواست"], ["quoteSubmits", "ثبت درخواست"], ["proposalsSent", "پیشنهادهای ارسال‌شده"], ["proposalsAccepted", "پیشنهادهای انتخاب‌شده"]].map(([key, label]) => <Text key={key} style={s.text}>{label}: {(totals[key] || 0).toLocaleString("fa-IR")}</Text>)}</View><View style={s.panel}><Text style={s.title}>نظر مشتریان</Text><Text style={s.text}>انتخاب پیشنهاد یا کلیک تماس به معنی خرید و پرداخت قطعی نیست.</Text>{reviews.length ? reviews.map(r => <View key={r.id}><Text style={s.text}>{r.title || "مشتری"} · {r.rating} از ۵ · {r.status === "published" ? "منتشرشده" : "در انتظار بررسی"}</Text><Text style={s.text}>{r.body}</Text>{r.status === "published" && <><TextInput accessibilityLabel="پاسخ به نظر مشتری" style={s.input} multiline maxLength={1500} value={drafts[r.id] ?? r.reply ?? ""} onChangeText={value => setDrafts(items => ({ ...items, [r.id]: value }))} /><ToolButton title="ثبت پاسخ" disabled={saving} onPress={() => void saveReply(r)} /></>}</View>) : <Text style={s.text}>{message || "هنوز نظری ثبت نشده است."}</Text>}</View>{message ? <Text style={s.text}>{message}</Text> : null}</ScrollView>;
}
