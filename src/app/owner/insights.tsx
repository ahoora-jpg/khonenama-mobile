import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { apiRequest } from "../../api/client";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { toolStyles as s } from "../../components/OwnerTools";
type Review = { id: number; rating: number; title: string; body: string; status: string };
export default function Insights() {
  const { token } = useBusinessSession();
  const [totals, setTotals] = useState<Record<string, number>>({}), [reviews, setReviews] = useState<Review[]>([]), [message, setMessage] = useState("در حال دریافت…");
  useEffect(() => { void Promise.all([apiRequest<{ totals: Record<string, number> }>("/api/me/business/analytics", {}, token), apiRequest<{ reviews: Review[] }>("/api/me/business/reviews", {}, token)]).then(([a, r]) => { setTotals(a.totals); setReviews(r.reviews); setMessage(""); }).catch(() => setMessage("دریافت اطلاعات انجام نشد؛ این بخش را دوباره باز کنید.")); }, [token]);
  return <ScrollView style={s.page} contentContainerStyle={s.content}><View style={s.panel}><Text style={s.title}>آمار واقعی ۳۰ روز گذشته</Text>{[["profileViews", "بازدید پروفایل"], ["phoneClicks", "کلیک تماس"], ["whatsappClicks", "کلیک واتساپ"], ["websiteClicks", "کلیک وب‌سایت"], ["instagramClicks", "کلیک اینستاگرام"], ["quoteStarts", "شروع درخواست"], ["quoteSubmits", "ثبت درخواست"]].map(([key, label]) => <Text key={key} style={s.text}>{label}: {(totals[key] || 0).toLocaleString("fa-IR")}</Text>)}</View><View style={s.panel}><Text style={s.title}>نظر مشتریان</Text>{reviews.length ? reviews.map(r => <View key={r.id}><Text style={s.text}>{r.title || "مشتری"} · {r.rating} از ۵ · {r.status === "published" ? "منتشرشده" : "در انتظار بررسی"}</Text><Text style={s.text}>{r.body}</Text></View>) : <Text style={s.text}>{message || "هنوز نظری ثبت نشده است."}</Text>}</View>{message ? <Text style={s.text}>{message}</Text> : null}</ScrollView>;
}
