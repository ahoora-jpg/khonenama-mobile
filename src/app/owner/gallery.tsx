import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiRequest } from "../../api/client";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { ToolButton, toolStyles as s } from "../../components/OwnerTools";
import { uploadBusinessPhoto } from "../../media/upload";

type Media = { id: number; kind: string; file_url: string; alt_text: string | null };
type Album = { id: number; title: string; description: string; project?: {service:string;materials:string;area:string}|null; media: { id: number; url: string }[] };
export default function OwnerGallery() {
  const { token, profile, refresh } = useBusinessSession();
  const [media, setMedia] = useState<Media[]>([]), [albums, setAlbums] = useState<Album[]>([]);
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [title, setTitle] = useState(""), [description, setDescription] = useState(""), [selected, setSelected] = useState<number[]>([]);
  const [project,setProject]=useState({service:"",materials:"",area:""});
  const [editing, setEditing] = useState<number | null>(null), [alt, setAlt] = useState("");
  const plan = profile?.business.plan?.code || "free";
  const capacity = plan === "premium" ? 60 : plan === "pro" ? 30 : 10;
  const [editingAlbum, setEditingAlbum] = useState<number | null>(null);
  const count = media.filter(m => m.kind === "image").length;
  const cover = media.find(m=>m.kind === "cover"), logo = media.find(m=>m.kind === "logo");
  const number = (value: number) => value.toLocaleString("fa-IR");
  const chooseSource = (kind: "image" | "cover" | "logo") => Alert.alert("انتخاب عکس", "از گالری انتخاب کنید یا عکس بگیرید.", [{text:"گالری",onPress:()=>void pick(false,kind)},{text:"دوربین",onPress:()=>void pick(true,kind)},{text:"انصراف",style:"cancel"}]);
  const load = useCallback(async () => {
    const [m, a] = await Promise.all([
      apiRequest<{ media: Media[] }>("/api/me/business/media", {}, token),
      apiRequest<{ albums: Album[]; limit: number | null }>("/api/me/business/albums", {}, token),
    ]);
    setMedia(m.media); setAlbums(a.albums); setError("");
  }, [token]);
  useEffect(() => { void Promise.resolve().then(load).catch(() => setError("دریافت تصاویر انجام نشد؛ دوباره تلاش کنید.")).finally(() => setLoading(false)); }, [load]);
  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await action(); await load(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "عملیات انجام نشد."); }
    finally { setBusy(false); }
  }
  async function pick(camera: boolean, kind: "image" | "cover" | "logo" = "image") {
    if (!token || busy) return;
    setBusy(true); setError("");
    try {
      if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) { Alert.alert("دسترسی دوربین", "برای عکاسی اجازه دوربین را در تنظیمات گوشی فعال کنید؛ انتخاب عکس از گالری نیز در دسترس است."); return; }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 1, allowsEditing: false, allowsMultipleSelection: !camera && kind === "image", selectionLimit: kind === "image" ? Math.max(1,capacity-count) : 1 };
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets[0]) return;
      for (const asset of result.assets.slice(0,kind === "image" ? Math.max(0,capacity-count) : 1)) { await uploadBusinessPhoto(asset, token, kind); await load(); } await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "آپلود انجام نشد."); }
    finally { setBusy(false); }
  }
  const patch = (id: number, action: string, extra = {}) => run(() => apiRequest("/api/me/business/media", { method: "PATCH", body: JSON.stringify({ id, action, ...extra }) }, token));
  const confirmDelete = (id: number, album: boolean) => Alert.alert(album ? "حذف آلبوم" : "حذف عکس", album ? "عکس‌های گالری باقی می‌مانند." : "این عکس از گالری و آلبوم‌ها حذف می‌شود.", [{ text: "انصراف", style: "cancel" }, { text: "حذف", style: "destructive", onPress: () => void run(() => apiRequest(album ? "/api/me/business/albums" : "/api/me/business/media", { method: "DELETE", body: JSON.stringify({ id }) }, token)) }]);
  return <ScrollView style={s.page} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); load().catch(() => setError("دریافت انجام نشد.")).finally(() => setLoading(false)); }} />} keyboardShouldPersistTaps="handled">
    <View style={s.panel}>
      <Text style={s.title}>پیش‌نمایش غرفه شما</Text>
      <Text style={s.title}>{number(count)} عکس ذخیره‌شده · {number(Math.max(0,capacity-count))} جای خالی</Text>
      <Text style={s.text}>ظرفیت: {number(capacity)} عکس؛ کاور و پروفایل جدا هستند.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="تغییر تصویر پس‌زمینه" disabled={busy} onPress={()=>chooseSource("cover")} style={{height:220,borderRadius:20,overflow:"hidden",backgroundColor:"#e8e5dc"}}>
        {cover && <Image source={{uri:cover.file_url}} style={{width:"100%",height:"100%"}} resizeMode="cover"/>}
        <Text style={[s.buttonText,{position:"absolute",bottom:12,left:12,backgroundColor:"#17221ddd",padding:10}]}>تغییر تصویر پس‌زمینه</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="تغییر عکس پروفایل" disabled={busy} onPress={()=>chooseSource("logo")} style={{width:112,height:112,alignSelf:"flex-end",marginTop:-50,borderRadius:24,overflow:"hidden",borderWidth:4,borderColor:"white",backgroundColor:"#e8e5dc"}}>
        {logo && <Image source={{uri:logo.file_url}} style={{width:"100%",height:"100%"}} resizeMode="cover"/>}
        <Text style={[s.buttonText,{position:"absolute",bottom:0,width:"100%",textAlign:"center",backgroundColor:"#17221ddd"}]}>تغییر پروفایل</Text>
      </Pressable>
      <Text style={s.title}>{profile?.business.name}</Text>
      <ToolButton title="+ افزودن عکس" disabled={busy || loading || count>=capacity} onPress={()=>chooseSource("image")}/>
      <Text style={s.text}>تصاویر باید متعلق به شما یا با اجازه صاحب اثر باشند؛ اطلاعات خصوصی مشتری را حذف یا محو کنید.</Text>
      {busy && <Text style={s.text}>در حال ذخیره عکس…</Text>}{error ? <Text accessibilityRole="alert" style={s.text}>{error}</Text> : null}
    </View>
    {media.filter(item=>item.kind === "image").map(item => <View style={s.panel} key={item.id}><Image source={{ uri: item.file_url }} style={{ height: 210, borderRadius: 12 }} resizeMode="contain" accessibilityLabel={item.alt_text || "نمونه‌کار"} /><Text style={s.text}>{item.kind === "cover" ? "تصویر اصلی" : "نمونه‌کار"}</Text><View style={s.row}><ToolButton title="تصویر اصلی" disabled={busy || item.kind !== "image"} onPress={() => void patch(item.id, "cover")} /><ToolButton title="نام و شرح عکس" disabled={busy} onPress={() => { setEditing(item.id); setAlt(item.alt_text || ""); }} /><ToolButton title="جابه‌جایی به بالا" disabled={busy} onPress={() => void patch(item.id, "move-up")} /><ToolButton title="حذف" disabled={busy} onPress={() => confirmDelete(item.id, false)} /></View>{editing === item.id && <><TextInput style={s.input} value={alt} onChangeText={setAlt} maxLength={300} placeholder="نام و شرح کوتاه تصویر" /><ToolButton title="ذخیره شرح" disabled={busy} onPress={() => void patch(item.id, "alt", { altText: alt }).then(() => setEditing(null))} /></>}</View>)}
    <View style={s.panel}><Text style={s.title}>آلبوم‌های پروژه</Text><Text style={s.text}>{number(albums.length)} آلبوم · تعداد آلبوم‌ها محدود نیست</Text>{albums.map(a => <View key={a.id}><Text style={s.title}>{a.title}</Text><Text style={s.text}>{a.description}</Text><View style={s.row}>{a.media.map(m => <Image key={m.id} source={{ uri: m.url }} style={{ width: 70, height: 70, borderRadius: 8 }} />)}</View><ToolButton title="+ افزودن عکس / ویرایش" disabled={busy} onPress={()=>{setEditingAlbum(a.id);setTitle(a.title);setDescription(a.description);setSelected(a.media.map(m=>m.id));setProject(a.project||{service:"",materials:"",area:""});}}/><ToolButton title="حذف آلبوم" disabled={busy} onPress={() => confirmDelete(a.id, true)} /></View>)}
    {<>{(["service","materials","area"] as const).map(key=><TextInput key={key} style={s.input} placeholder={{service:"خدمت انجام‌شده",materials:"متریال",area:"شهر یا محدوده؛ بدون آدرس خصوصی"}[key]} value={project[key]} onChangeText={value=>setProject({...project,[key]:value})} maxLength={300}/>)}<Text style={s.text}>تصاویر قبل و بعد را با عنوان عکس مشخص کنید؛ انتشار با اجازه مشتری.</Text><TextInput style={s.input} placeholder="نام آلبوم" maxLength={100} value={title} onChangeText={setTitle} /><TextInput style={s.input} placeholder="شرح پروژه" multiline maxLength={2000} value={description} onChangeText={setDescription} /><Text style={s.text}>عکس‌های آلبوم را انتخاب کنید.</Text><View style={s.row}>{media.filter(m=>m.kind === "image").map(m => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected.includes(m.id) }} key={m.id} disabled={busy} onPress={() => setSelected(v => v.includes(m.id) ? v.filter(id => id !== m.id) : [...v, m.id])}><Image source={{ uri: m.file_url }} style={{ width: 80, height: 80, borderWidth: 3, borderColor: selected.includes(m.id) ? "#176B4D" : "#ddd" }} /></Pressable>)}</View><ToolButton title={editingAlbum ? "ذخیره آلبوم" : "+ ساخت آلبوم"} disabled={busy || !title.trim() || !selected.length} onPress={() => void run(async () => { await apiRequest("/api/me/business/albums", { method: editingAlbum ? "PATCH" : "POST", body: JSON.stringify({ id:editingAlbum, title, description, mediaIds: selected, project }) }, token); setTitle(""); setDescription(""); setSelected([]); setEditingAlbum(null); })} /></>}</View>
  </ScrollView>;
}
