import {useEffect,useState} from "react";
import {Image,Modal,Pressable,ScrollView,Text,View} from "react-native";
import {apiRequest} from "../api/client";
import {useBusinessSession} from "../auth/BusinessSessionContext";
import {ToolButton,toolStyles as s} from "./OwnerTools";
export default function WelcomeTrialNotice(){
 const {token,profile,refresh}=useBusinessSession();const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const businessId=profile?.business.id,completion=profile?.business.completion;
 useEffect(()=>{if(!token||!businessId)return;let alive=true;apiRequest<{showNotice:boolean}>("/api/me/business/welcome-trial",{},token).then(d=>{if(alive)setOpen(d.showNotice);}).catch(()=>{});return()=>{alive=false;};},[token,businessId,completion]);
 async function dismiss(){if(busy)return;setBusy(true);setError("");try{await apiRequest("/api/me/business/welcome-trial",{method:"POST"},token);setOpen(false);await refresh();}catch{setError("بستن اعلان ذخیره نشد؛ دوباره تلاش کنید.");}finally{setBusy(false);}}
 return <Modal visible={open} transparent animationType="fade" onRequestClose={()=>void dismiss()}><View style={{flex:1,backgroundColor:"#0008",justifyContent:"center",padding:16}}><ScrollView style={{maxHeight:"90%",backgroundColor:"#fffaf2",borderRadius:20}} contentContainerStyle={{paddingBottom:16}} accessibilityViewIsModal>
 <Image source={{uri:"https://khonenama.ir/images/offers/welcome-aban-1405.webp"}} style={{width:"100%",aspectRatio:4/3}} accessibilityLabel="تا پایان آبان، مهمان خونه‌نما باشید"/>
 <Pressable accessibilityRole="button" accessibilityLabel="بستن اعلان" disabled={busy} onPress={()=>void dismiss()} style={{position:"absolute",top:8,left:8,width:44,height:44,backgroundColor:"white",borderRadius:22,alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:28}}>×</Text></Pressable>
 <View style={{paddingHorizontal:18,gap:12}}><Text style={s.text}>پروفایل کسب‌وکارتان را تکمیل کنید و از امکانات پلن ویژه رایگان استفاده کنید. این فرصت برای همه غرفه‌ها تا پایان روز ۳۰ آبان ۱۴۰۵ برقرار است.</Text>{!!error&&<Text style={s.text} accessibilityRole="alert">{error}</Text>}<ToolButton title={busy?"در حال ذخیره…":"متوجه شدم"} disabled={busy} onPress={()=>void dismiss()}/></View>
 </ScrollView></View></Modal>;
}
