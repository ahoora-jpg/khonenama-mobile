import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useSyncExternalStore } from "react";
import { AppState, Linking, Platform, Pressable, Text, View } from "react-native";
import { apiRequest } from "../api/client";
import { useBusinessSession } from "../auth/BusinessSessionContext";
import { toolStyles as s } from "../components/OwnerTools";
let status="در حال بررسی اعلان…";
const listeners=new Set<()=>void>();
let retry:()=>void=()=>{};
function report(value:string){status=value;listeners.forEach(fn=>fn());}
function subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
Notifications.setNotificationHandler({handleNotification:async()=>({shouldPlaySound:true,shouldSetBadge:false,shouldShowBanner:true,shouldShowList:true})});
export function NotificationStatus(){
 const value=useSyncExternalStore(subscribe,()=>status,()=>status);
 return <View style={s.panel}><Text style={s.title}>اعلان درخواست مشتری</Text><Text accessibilityLiveRegion="polite" style={s.text}>{value}</Text><Pressable onPress={()=>retry()}><Text style={s.text}>بررسی دوباره اتصال اعلان</Text></Pressable><Pressable onPress={()=>void Linking.openSettings()}><Text style={s.text}>تنظیمات اجازه اعلان گوشی</Text></Pressable></View>;
}
export function BusinessNotifications(){
 const {token}=useBusinessSession();
 useEffect(()=>{
  if(!token)return;
  const seen=new Set<string>();
  function open(notification:Notifications.Notification){const id=notification.request.identifier;if(seen.has(id))return;seen.add(id);const url=notification.request.content.data?.url;if(typeof url==="string"&&/^\/owner(?:\/|$)/.test(url))router.push(url as never);}
  const last=Notifications.getLastNotificationResponse();if(last?.notification)open(last.notification);
  const subscription=Notifications.addNotificationResponseReceivedListener(response=>open(response.notification));
  return()=>subscription.remove();
 },[token]);
 useEffect(()=>{
  if(!token){report("برای اتصال اعلان وارد حساب کسب‌وکار شوید.");return;}
  let active=true,busy=false;
  async function register(){
   if(!active||busy)return;busy=true;
   try {
    report("در حال اتصال اعلان گوشی…");
    if(!Device.isDevice){report("اعلان را روی گوشی واقعی و نسخه نصب‌شده بررسی کنید.");return;}
    if(Platform.OS==="android")await Notifications.setNotificationChannelAsync("business-requests",{name:"درخواست‌های کسب‌وکار",importance:Notifications.AndroidImportance.HIGH,vibrationPattern:[0,250,150,250],lightColor:"#176B4D"});
    const current=await Notifications.getPermissionsAsync();const permission=current.granted?current:current.canAskAgain?await Notifications.requestPermissionsAsync():current;
    if(!active)return;
    if(!permission.granted){report("اجازه اعلان خاموش است؛ در تنظیمات گوشی آن را فعال کنید.");return;}
    const projectId=Constants.expoConfig?.extra?.eas?.projectId??Constants.easConfig?.projectId;
    if(!projectId){report("تنظیم پروژه اعلان در این نسخه اپ کامل نیست.");return;}
    const pushToken=(await Notifications.getExpoPushTokenAsync({projectId})).data;
    if(!active)return;
    await apiRequest("/api/me/business/push-token",{method:"POST",body:JSON.stringify({token:pushToken,platform:Platform.OS})},token);
    
    if(active)await SecureStore.setItemAsync("khonenama_registered_push_token",pushToken);
    if(active)report("این گوشی برای دریافت اعلان ثبت شد؛ درخواست‌ها در صندوق دریافتی هم باقی می‌مانند.");
   }catch{if(active)report("اتصال اعلان انجام نشد؛ اینترنت یا تنظیم سرویس اعلان نیاز به بررسی دارد. دوباره تلاش کنید.");}
   finally{busy=false;}
  }
  retry=()=>void register();void register();
  const app=AppState.addEventListener("change",state=>{if(state==="active")void register();});
  const rotation=Notifications.addPushTokenListener(()=>void register());
  const timer=setInterval(()=>void register(),5*60*1000);
  return()=>{active=false;retry=()=>{};app.remove();rotation.remove();clearInterval(timer);};
 },[token]);
 return null;
}
