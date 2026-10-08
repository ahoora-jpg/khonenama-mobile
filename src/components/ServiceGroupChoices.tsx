import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { toolStyles as s } from "./OwnerTools";
function groupName(service:string) {
 if(/مینیمال/.test(service)) return "پرده مینیمال";
 if(/میل‌پرده|ریل|براکت|سرمیل|درپوش|لغزنده|استاپر|حلقه|گیره|قلاب|نوار|سرب|جمع‌کن|نگهدارنده|زنجیر|مکانیزم|موتور پرده|ریموت پرده|باتری/.test(service)) return "میل‌پرده، یراق و متعلقات";
 if(/پارچه|آستر|والان|حاشیه/.test(service)) return "پارچه و ملزومات";
 if(/نصب|تعمیر|دوخت|اندازه‌گیری|زیرسازی|شست|تعویض|بازکردن|کوتاه|نظافت|بازسازی/.test(service)) return "اجرا و خدمات";
 return "محصولات و تخصص‌ها";
}
export function ServiceGroupChoices({services, selected, disabled=false, onToggle}:{services:readonly string[];selected:string[];disabled?:boolean;onToggle:(value:string)=>void}) {
 const [expanded,setExpanded]=useState<string[]>([]);
 const groups=new Map<string,string[]>();for(const service of services){const name=groupName(service);groups.set(name,[...(groups.get(name)||[]),service]);}
 const chip=(service:string)=><Pressable key={service} disabled={disabled} accessibilityRole="checkbox" accessibilityState={{checked:selected.includes(service)}} onPress={()=>onToggle(service)} style={{padding:10,borderRadius:10,borderWidth:1,borderColor:selected.includes(service)?"#176B4D":"#ddd",backgroundColor:selected.includes(service)?"#E5EFEA":"white"}}><Text>{service}</Text></Pressable>;
 return <View><Text style={s.text}>خدمات اصلی را انتخاب کنید؛ مدل‌ها و جزئیات اختیاری‌اند.</Text>{[...groups].map(([label,items])=>{const preferred=label==="میل‌پرده، یراق و متعلقات"?"میل‌پرده":label==="پارچه و ملزومات"?"پارچه پرده":label==="پرده مینیمال"?"پرده مینیمال":"";const primary=preferred&&items.includes(preferred)?[preferred]:items.slice(0,5);const details=items.filter(v=>!primary.includes(v));return <View key={label}><Text style={s.title}>{label}</Text><View style={s.row}>{primary.map(chip)}</View>{!!details.length&&<Pressable accessibilityRole="button" accessibilityState={{expanded:expanded.includes(label)}} onPress={()=>setExpanded(v=>v.includes(label)?v.filter(x=>x!==label):[...v,label])}><Text style={s.text}>مدل‌ها و جزئیات بیشتر · {details.filter(v=>selected.includes(v)).length} انتخاب</Text></Pressable>}{expanded.includes(label)&&<View style={s.row}>{details.map(chip)}</View>}</View>;})}</View>;
}
