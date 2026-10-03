import { useState } from "react";
import { Linking, Text, TextInput, View } from "react-native";
import { apiRequest, normalizeIranPhone } from "../api/client";
import { ToolButton, toolStyles as s } from "./OwnerTools";
export function BusinessQuote({ slug, name }: { slug: string; name: string }) {
  const [customerName, setName] = useState(""), [customerPhone, setPhone] = useState(""), [area, setArea] = useState(""), [requestText, setRequest] = useState("");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [code, setCode] = useState("");
  async function send() {
    if (busy) return;
    const phone = normalizeIranPhone(customerPhone);
    if (customerName.trim().length < 2 || !/^09\d{9}$/.test(phone) || requestText.trim().length < 10) { setMessage("نام، شماره موبایل معتبر و توضیح حداقل ۱۰ حرفی را وارد کنید."); return; }
    setBusy(true); setMessage("");
    try { const result = await apiRequest<{ requestCode: string }>(`/api/business/${encodeURIComponent(slug)}/lead`, { method: "POST", body: JSON.stringify({ customerName, customerPhone: phone, area, requestText, website: "", budgetMin: "", budgetMax: "" }) }); setCode(result.requestCode); setRequest(""); setPhone(""); }
    catch(e) { setMessage(e instanceof Error ? e.message : "ثبت درخواست انجام نشد."); }
    finally { setBusy(false); }
  }
  return <View style={[s.panel, { margin: 16, marginBottom: 0 }]}><Text style={s.title}>درخواست خصوصی از {name}</Text>{code ? <><Text style={s.text}>درخواست ثبت شد. کد پیگیری: {code}</Text><ToolButton title="پیگیری پاسخ" onPress={() => void Linking.openURL(`https://khonenama.ir/request-status?code=${encodeURIComponent(code)}`)} /></> : <><TextInput style={s.input} placeholder="نام شما" value={customerName} onChangeText={setName} maxLength={100} /><TextInput style={s.input} placeholder="شماره موبایل" keyboardType="phone-pad" value={customerPhone} onChangeText={setPhone} maxLength={20} /><TextInput style={s.input} placeholder="محدوده خدمت" value={area} onChangeText={setArea} maxLength={100} /><TextInput style={s.input} placeholder="چه خدمتی نیاز دارید؟" multiline value={requestText} onChangeText={setRequest} maxLength={2000} /><Text style={s.text}>اطلاعات درخواست برای همین کسب‌وکار ارسال می‌شود و در صفحه عمومی دیده نمی‌شود.</Text><ToolButton title={busy ? "در حال ارسال…" : "ارسال درخواست"} disabled={busy} onPress={() => void send()} />{message ? <Text style={s.text}>{message}</Text> : null}</>}</View>;
}
