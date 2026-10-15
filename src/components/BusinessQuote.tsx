import {useEffect,useState} from "react";
import * as SecureStore from "expo-secure-store";
import {router} from "expo-router";
import {Image,Text,TextInput,View} from "react-native";
import {apiRequest,normalizeIranPhone} from "../api/client";
import {matchingServiceNames} from "../service-search";
import {measurement,modelCode} from "../model-quote";
import {ToolButton,toolStyles as s} from "./OwnerTools";
type Model={id:number;url:string;altText:string};
const empty={customerName:"",customerPhone:"",area:"",requestText:"",modelName:"",width:"",height:"",service:"",selectedId:null as number|null};
export function BusinessQuote({slug,name,models=[],selectedMediaId,onClear}:{slug:string;name:string;models?:Model[];selectedMediaId?:number;onClear?:()=>void}){
 const [form,setForm]=useState(empty),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[code,setCode]=useState(""),[loaded,setLoaded]=useState(false);
 const draftKey="quote_"+Array.from(slug).map(c=>c.charCodeAt(0).toString(16)).join("");
 useEffect(()=>{let alive=true;SecureStore.getItemAsync(draftKey).then(raw=>{if(raw){const d=JSON.parse(raw);if(Date.now()-d.savedAt<86400000&&alive)setForm({...empty,...d.values});}}).catch(()=>{}).finally(()=>{if(alive)setLoaded(true);});return()=>{alive=false;};},[draftKey]);
 useEffect(()=>{if(!selectedMediaId)return;const timer=setTimeout(()=>setForm(f=>({...f,selectedId:selectedMediaId,modelName:""})),0);return()=>clearTimeout(timer);},[selectedMediaId]);
 useEffect(()=>{if(!loaded||code)return;const timer=setTimeout(()=>{void SecureStore.setItemAsync(draftKey,JSON.stringify({savedAt:Date.now(),values:form})).catch(()=>{});},300);return()=>clearTimeout(timer);},[draftKey,form,loaded,code]);
 const model=models.find(m=>m.id===form.selectedId),hasModel=Boolean(model||form.modelName.trim());
 function update(key:keyof typeof empty,value:string){setForm(f=>({...f,[key]:value}));}
 async function send(){
  if(busy||!loaded)return;const phone=normalizeIranPhone(form.customerPhone);
  if(form.customerName.trim().length<2||!/^09\d{9}$/.test(phone)){setMessage("نام و شماره موبایل معتبر وارد کنید.");return;}
  if(hasModel&&(measurement(form.width)===null||(form.height.trim()&&measurement(form.height)===null))){setMessage("عرض و ارتفاع اختیاری را به متر وارد کنید؛ مثلاً ۳٫۵.");return;}
  if(!hasModel&&form.requestText.trim().length<10){setMessage("مدل و عرض را مشخص کنید یا نیازتان را در چند کلمه توضیح دهید.");return;}
  setBusy(true);setMessage("");try{
   const result=await apiRequest<{requestCode:string}>(`/api/business/${encodeURIComponent(slug)}/lead`,{method:"POST",body:JSON.stringify({customerName:form.customerName,customerPhone:phone,area:form.area,requestText:(form.service?"خدمت: "+form.service+"\n":"")+form.requestText,selectedMediaId:model?.id,modelName:model?undefined:form.modelName.trim(),widthMeters:hasModel?form.width:undefined,heightMeters:hasModel&&form.height.trim()?form.height:undefined,website:""})});
   setCode(result.requestCode);await SecureStore.deleteItemAsync(draftKey);
  }catch(e){setMessage(e instanceof Error?e.message:"ارسال انجام نشد؛ اطلاعات شما حفظ شده است.");}finally{setBusy(false);}
 }
 return <View style={[s.panel,{margin:16,marginBottom:0}]}><Text style={s.title}>درخواست قیمت از {name}</Text>{code?<><Text style={s.text}>درخواست با موفقیت ثبت شد. کد پیگیری: {code}</Text><ToolButton title="پیگیری پاسخ" onPress={()=>router.push({pathname:"/request-status",params:{code}})}/></>:<>
 <TextInput style={s.input} accessibilityLabel="نام شما" placeholder="نام شما" value={form.customerName} onChangeText={v=>update('customerName',v)} maxLength={100}/>
 <TextInput style={s.input} accessibilityLabel="شماره موبایل" placeholder="شماره موبایل" value={form.customerPhone} onChangeText={v=>update('customerPhone',v)} keyboardType="phone-pad" maxLength={20}/>
 <TextInput style={s.input} placeholder="خدمت موردنیاز؛ بنویسید مثلاً مینیمال" value={form.service} onChangeText={v=>update('service',v)} maxLength={120}/>
 {!!form.service&&matchingServiceNames(form.service).slice(0,5).filter(v=>v!==form.service).map(service=><ToolButton key={service} title={service} onPress={()=>update('service',service)}/>)}
 {model?<><Image source={{uri:model.url}} style={{height:140,width:'100%'}} resizeMode="contain"/><Text style={s.text}>{model.altText||'مدل انتخابی'} · {modelCode(model.id)}</Text><ToolButton title="تغییر مدل" onPress={()=>{setForm(f=>({...f,selectedId:null}));onClear?.();}}/></>:<TextInput style={s.input} placeholder="نام مدل دلخواه؛ یا از گالری عکس انتخاب کنید" value={form.modelName} onChangeText={v=>update('modelName',v)} maxLength={100}/>}
 {hasModel&&<><TextInput style={s.input} placeholder="عرض به متر؛ مثلاً ۳٫۵" accessibilityLabel="عرض به متر" keyboardType="decimal-pad" value={form.width} onChangeText={v=>update('width',v)} maxLength={10}/><TextInput style={s.input} placeholder="ارتفاع به متر (اختیاری)" keyboardType="decimal-pad" value={form.height} onChangeText={v=>update('height',v)} maxLength={10}/></>}
 <TextInput style={s.input} placeholder="شهر یا محدوده خدمت" value={form.area} onChangeText={v=>update('area',v)} maxLength={100}/>
 <TextInput style={s.input} placeholder={hasModel?'توضیح اضافه (اختیاری)':'نیازتان را کوتاه توضیح دهید'} multiline value={form.requestText} onChangeText={v=>update('requestText',v)} maxLength={1000}/>
 <ToolButton title={busy?'در حال ارسال…':'ارسال درخواست قیمت'} disabled={busy||!loaded} onPress={()=>void send()}/>{!!message&&<Text style={s.text} accessibilityRole="alert">{message}</Text>}
 </>}</View>;
}
