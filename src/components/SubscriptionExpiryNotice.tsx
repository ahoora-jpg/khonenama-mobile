import {useEffect,useRef,useState} from "react";
import {Alert,AppState,Text,View} from "react-native";
import {router} from "expo-router";
import * as SecureStore from "expo-secure-store";
import {apiRequest} from "../api/client";
import {useBusinessSession} from "../auth/BusinessSessionContext";
import {ToolButton,toolStyles as s} from "./OwnerTools";
type Notice={warning:boolean;expired:boolean;remainingDays:number|null;previousPlan:string|null;endsAt:string|null;serverNow:string;effectivePlan:string};
export default function SubscriptionExpiryNotice(){
 const {token,profile,refresh}=useBusinessSession();const [notice,setNotice]=useState<Notice|null>(null);const current=useRef(profile?.business.plan?.code||"free");
 useEffect(()=>{current.current=profile?.business.plan?.code||"free";},[profile]);
 useEffect(()=>{if(!token)return;let alive=true,busy=false;async function check(){if(busy||AppState.currentState==='background')return;busy=true;try{const n=await apiRequest<Notice>('/api/me/business/subscription-status',{},token);if(!alive)return;setNotice(n);if(n.effectivePlan!==current.current){current.current=n.effectivePlan;await refresh();}if(n.warning){const key=n.previousPlan+':'+n.endsAt+':'+new Date(n.serverNow).toLocaleDateString('en-CA',{timeZone:'Asia/Tehran'})+':'+n.expired;const saved=await SecureStore.getItemAsync('khonenama_expiry_notice');if(saved!==key&&alive){await SecureStore.setItemAsync('khonenama_expiry_notice',key);Alert.alert('اعتبار اشتراک شما',message(n),[{text:'متوجه شدم'},{text:'مشاهده و تمدید',onPress:()=>router.push('/owner/subscription')}]);}}}catch{}finally{busy=false;}}void check();const timer=setInterval(()=>void check(),60000);const listener=AppState.addEventListener('change',state=>{if(state==='active')void check();});return()=>{alive=false;clearInterval(timer);listener.remove();};},[token,refresh]);
 if(!notice?.warning)return null;return <View style={[s.panel,{margin:12}]}><Text style={s.text}>{message(notice)}</Text><ToolButton title="مشاهده و تمدید اشتراک" onPress={()=>router.push('/owner/subscription')} /></View>;
}
function message(n:Notice){const name=n.previousPlan==='premium'?'ویژه':'حرفه‌ای';return (n.expired?'اعتبار '+name+' تمام شده و حساب به پایه برگشته است.':'تا پایان اعتبار '+name+' '+n.remainingDays+' روز باقی مانده است.')+' پس از پایان اعتبار، فقط ۱۰ عکس اول بارگذاری‌شده نمایش عمومی دارند. عکس‌ها و آلبوم‌های اضافه حذف نمی‌شوند و با تمدید دوباره نمایش داده می‌شوند. کاور و پروفایل جدا هستند.';}
