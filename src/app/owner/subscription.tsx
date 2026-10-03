import { ScrollView, Text, View } from "react-native";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { toolStyles as s } from "../../components/OwnerTools";
export default function Subscription() {
  const { profile } = useBusinessSession();
  const current = profile?.business.plan;
  return <ScrollView style={s.page} contentContainerStyle={s.content}><View style={s.panel}><Text style={s.title}>اشتراک فعلی: {current?.name || "پایه"}</Text><Text style={s.text}>{current?.ends_at ? `پایان اعتبار: ${new Date(current.ends_at).toLocaleDateString("fa-IR")}` : "امکانات پایه رایگان در دسترس‌اند."}</Text><Text style={s.text}>اشتراکی که مدیر سایت برای شما فعال کند، در همین حساب سایت و اپ اعمال می‌شود.</Text></View>{[["پایه", "۱۰ عکس نمونه‌کار جدا از تصویر اصلی و پروفایل، لینک اختصاصی و کد تصویری"], ["حرفه‌ای", "۳۰ تصویر و ۵ آلبوم نمونه‌کار"], ["ویژه", "۶۰ تصویر و ۱۰ آلبوم نمونه‌کار"]].map(([name, description]) => <View key={name} style={s.panel}><Text style={s.title}>{name}</Text><Text style={s.text}>{description}</Text></View>)}<View style={s.panel}><Text style={s.text}>خرید اشتراک پس از نهایی شدن قیمت و اتصال پرداخت فعال می‌شود. فعلاً پرداختی داخل اپ انجام نمی‌شود.</Text></View></ScrollView>;
}
