import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, ScrollView, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { toolStyles as s, ToolButton } from "../../components/OwnerTools";
import { apiRequest } from "../../api/client";
import { checkoutRequestKey, safeGatewayUrl, type SubscriptionPlan, type BillingInvoice } from "../../api/billing";
export default function Subscription() {
  const { profile, token, refresh } = useBusinessSession();
  const [plans,setPlans]=useState<SubscriptionPlan[]>([]),[invoices,setInvoices]=useState<BillingInvoice[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const busyRef=useRef(false);
  const load=useCallback(async()=>{
    try {
      const [catalog,history]=await Promise.all([apiRequest<{ok:true;plans:SubscriptionPlan[]}>("/api/billing/plans",{},token),apiRequest<{ok:true;invoices:BillingInvoice[]}>("/api/billing/history",{},token)]);
      setPlans(catalog.plans);setInvoices(history.invoices);await refresh();
    } catch(e){setMessage(e instanceof Error?e.message:"دریافت اطلاعات انجام نشد.");}
  },[token,refresh]);
  useEffect(()=>{void Promise.resolve().then(load);const listener=AppState.addEventListener("change",state=>{if(state==="active")void load();});return()=>listener.remove();},[load]);
  async function pay(plan:SubscriptionPlan){
    if(busyRef.current)return;busyRef.current=true;setBusy(true);setMessage("");
    try {
      const requestKey=checkoutRequestKey();
      const result=await apiRequest<{ok:true;id:string;redirectUrl:string}>("/api/billing/checkout",{method:"POST",body:JSON.stringify({planCode:plan.code,expectedAmountToman:plan.amountToman,expectedDurationDays:plan.durationDays,requestKey,source:"app"})},token);
      await Linking.openURL(safeGatewayUrl(result.redirectUrl));
      setMessage("پس از پرداخت به اپ برگردید و نتیجه را از سوابق بررسی کنید. پرداخت دوباره لازم نیست.");
    }catch(e){setMessage(e instanceof Error?e.message:"ثبت پرداخت انجام نشد.");}finally{busyRef.current=false;setBusy(false);void load();}
  }
  function confirm(plan:SubscriptionPlan){
    Alert.alert(`اشتراک ${plan.name}`,`مبلغ نهایی: ${plan.amountToman?.toLocaleString("fa-IR")} تومان\nمدت: ${plan.durationDays} روز\nتمدید همان اشتراک به اعتبار باقی‌مانده اضافه می‌شود. تغییر به اشتراک بالاتر از زمان پرداخت شروع می‌شود. خرید یک‌باره است و برداشت خودکار ندارد.`,[{text:"انصراف",style:"cancel"},{text:"تأیید و رفتن به درگاه",onPress:()=>void pay(plan)}]);
  }
  async function reconcile(id:string){if(busyRef.current)return;busyRef.current=true;setBusy(true);try{const d=await apiRequest<{ok:true;status:string}>("/api/billing/reconcile",{method:"POST",body:JSON.stringify({id})},token);setMessage(d.status==="paid"?"پرداخت تأیید و اشتراک فعال شد.":d.status==="failed"?"درگاه پرداخت را تأیید نکرد.":"نتیجه در انتظار تأیید است؛ دوباره پرداخت نکنید.");await load();}catch(e){setMessage(e instanceof Error?e.message:"بررسی انجام نشد.");}finally{busyRef.current=false;setBusy(false);}}
  const current=profile?.business.plan;
  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <View style={s.panel}><Text style={s.title}>اشتراک فعلی: {current?.name||"پایه"}</Text><Text style={s.text}>{current?.ends_at?`پایان اعتبار: ${new Date(current.ends_at).toLocaleDateString("fa-IR")}`:"امکانات اشتراک فعلی در دسترس‌اند."}</Text><Text style={s.text}>اشتراک سایت و اپ یکسان است. فعال‌سازی پرداخت پس از تأیید درگاه خودکار انجام می‌شود.</Text></View>
    {plans.map(plan=><View style={s.panel} key={plan.code}><Text style={s.title}>{plan.name}</Text><Text style={s.text}>{plan.code==="free"?"رایگان":plan.amountToman?`${plan.amountToman.toLocaleString("fa-IR")} تومان برای ${plan.durationDays} روز`:"قیمت هنوز نهایی نشده"}</Text>{plan.features.filter(f=>!f.includes("Boost")).map(f=><Text key={f} style={s.text}>• {f}</Text>)}{plan.code!=="free"&&<ToolButton disabled={busy||!plan.purchasable} title={plan.purchasable?(current?.code===plan.code?"تمدید اشتراک":"انتخاب و پرداخت"):"خرید پس از اتصال درگاه"} onPress={()=>confirm(plan)}/>}</View>)}
    <View style={s.panel}><Text style={s.title}>سوابق پرداخت</Text>{!invoices.length&&<Text style={s.text}>هنوز فاکتوری ندارید.</Text>}{invoices.map(row=><View key={row.id}><Text style={s.text}>{row.plan_code==="premium"?"ویژه":"حرفه‌ای"} · {row.total_amount.toLocaleString("fa-IR")} تومان · {row.status==="paid"?"موفق و فعال‌شده":row.status==="failed"?"ناموفق":"در انتظار تأیید"}</Text><Text style={s.text}>فاکتور: {row.invoice_number}</Text>{row.provider_reference&&<Text style={s.text}>شماره پیگیری: {row.provider_reference}</Text>}{row.status==="pending"&&<ToolButton title="بررسی دوباره نتیجه پرداخت" disabled={busy} onPress={()=>void reconcile(row.id)}/>}</View>)}<ToolButton title="تازه‌کردن سوابق و اشتراک" disabled={busy} onPress={()=>void load()}/></View>
    {!!message&&<Text accessibilityRole="alert" style={s.text}>{message}</Text>}
  </ScrollView>;
}
