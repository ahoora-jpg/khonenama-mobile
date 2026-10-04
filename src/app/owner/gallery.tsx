import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiRequest } from "../../api/client";
import { useBusinessSession } from "../../auth/BusinessSessionContext";
import { ToolButton, toolStyles as s } from "../../components/OwnerTools";
import { uploadBusinessPhoto } from "../../media/upload";

type Media = { id: number; kind: string; file_url: string; alt_text: string | null };
type Album = { id: number; title: string; description: string; media: { id: number; url: string }[] };
export default function OwnerGallery() {
  const { token, profile, refresh } = useBusinessSession();
  const [media, setMedia] = useState<Media[]>([]), [albums, setAlbums] = useState<Album[]>([]);
  const [limit, setLimit] = useState(0), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [title, setTitle] = useState(""), [description, setDescription] = useState(""), [selected, setSelected] = useState<number[]>([]);
  const [project,setProject]=useState({service:"",materials:"",area:""});
  const [editing, setEditing] = useState<number | null>(null), [alt, setAlt] = useState("");
  const plan = profile?.business.plan?.code || "free";
  const capacity = plan === "premium" ? 60 : plan === "pro" ? 30 : 10;
  const [kind, setKind] = useState<"image" | "cover" | "logo">("image");
  const count = media.filter(m => m.kind === "image").length;
  const full = kind === "image" ? count >= capacity : media.some(m => m.kind === kind);
  const load = useCallback(async () => {
    const [m, a] = await Promise.all([
      apiRequest<{ media: Media[] }>("/api/me/business/media", {}, token),
      apiRequest<{ albums: Album[]; limit: number }>("/api/me/business/albums", {}, token),
    ]);
    setMedia(m.media); setAlbums(a.albums); setLimit(a.limit); setError("");
  }, [token]);
  useEffect(() => { void Promise.resolve().then(load).catch(() => setError("دریافت تصاویر انجام نشد؛ دوباره تلاش کنید.")).finally(() => setLoading(false)); }, [load]);
  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await action(); await load(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "عملیات انجام نشد."); }
    finally { setBusy(false); }
  }
  async function pick(camera: boolean) {
    if (!token || busy) return;
    setBusy(true); setError("");
    try {
      if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) { Alert.alert("دسترسی دوربین", "برای عکاسی اجازه دوربین را در تنظیمات گوشی فعال کنید؛ انتخاب عکس از گالری نیز در دسترس است."); return; }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 1, allowsEditing: false };
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets[0]) return;
      await uploadBusinessPhoto(result.assets[0], token, kind); await load(); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "آپلود انجام نشد."); }
    finally { setBusy(false); }
  }
  const patch = (id: number, action: string, extra = {}) => run(() => apiRequest("/api/me/business/media", { method: "PATCH", body: JSON.stringify({ id, action, ...extra }) }, token));
  const confirmDelete = (id: number, album: boolean) => Alert.alert(album ? "حذف آلبوم" : "حذف عکس", album ? "عکس‌های گالری باقی می‌مانند." : "این عکس از گالری و آلبوم‌ها حذف می‌شود.", [{ text: "انصراف", style: "cancel" }, { text: "حذف", style: "destructive", onPress: () => void run(() => apiRequest(album ? "/api/me/business/albums" : "/api/me/business/media", { method: "DELETE", body: JSON.stringify({ id }) }, token)) }]);
  return <ScrollView style={s.page} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); load().catch(() => setError("دریافت انجام نشد.")).finally(() => setLoading(false)); }} />} keyboardShouldPersistTaps="handled">
    <View style={s.panel}><Text style={s.title}>گالری نمونه‌کار</Text><Text style={s.text}>{count} تصویر از {capacity} · اشتراک {profile?.business.plan?.name || "پایه"}</Text><Text style={s.text}>عکس پیش از ارسال کوچک می‌شود. تصویر اصلی و پروفایل جدا از ظرفیت نمونه‌کارها هستند. برای تعویض آن‌ها عکس قبلی را حذف کنید.</Text><View style={s.row}>{(["image", "cover", "logo"] as const).map(value => <ToolButton key={value} title={(value === "image" ? "نمونه‌کار" : value === "cover" ? "تصویر اصلی" : "پروفایل") + (kind === value ? " ✓" : "")} disabled={busy} onPress={() => setKind(value)} />)}</View><View style={s.row}><ToolButton title="انتخاب عکس" disabled={busy || loading || full} onPress={() => void pick(false)} /><ToolButton title="عکس گرفتن" disabled={busy || loading || full} onPress={() => void pick(true)} /></View>{busy && <Text style={s.text}>در حال انجام…</Text>}{error ? <Text accessibilityRole="alert" style={s.text}>{error}</Text> : null}</View>
    {media.map(item => <View style={s.panel} key={item.id}><Image source={{ uri: item.file_url }} style={{ height: 210, borderRadius: 12 }} resizeMode="contain" accessibilityLabel={item.alt_text || "نمونه‌کار"} /><Text style={s.text}>{item.kind === "cover" ? "تصویر اصلی" : "نمونه‌کار"}</Text><View style={s.row}><ToolButton title="تصویر اصلی" disabled={busy || item.kind !== "image"} onPress={() => void patch(item.id, "cover")} /><ToolButton title="نام و شرح عکس" disabled={busy} onPress={() => { setEditing(item.id); setAlt(item.alt_text || ""); }} /><ToolButton title="جابه‌جایی به بالا" disabled={busy} onPress={() => void patch(item.id, "move-up")} /><ToolButton title="حذف" disabled={busy} onPress={() => confirmDelete(item.id, false)} /></View>{editing === item.id && <><TextInput style={s.input} value={alt} onChangeText={setAlt} maxLength={300} placeholder="نام و شرح کوتاه تصویر" /><ToolButton title="ذخیره شرح" disabled={busy} onPress={() => void patch(item.id, "alt", { altText: alt }).then(() => setEditing(null))} /></>}</View>)}
    <View style={s.panel}><Text style={s.title}>آلبوم‌های پروژه</Text><Text style={s.text}>{limit ? `${albums.length} آلبوم از ${limit}` : "آلبوم‌بندی با اشتراک حرفه‌ای یا ویژه فعال می‌شود؛ گالری و کد تصویری در اشتراک پایه هم در دسترس‌اند."}</Text>{albums.map(a => <View key={a.id}><Text style={s.title}>{a.title}</Text><Text style={s.text}>{a.description}</Text><View style={s.row}>{a.media.map(m => <Image key={m.id} source={{ uri: m.url }} style={{ width: 70, height: 70, borderRadius: 8 }} />)}</View><ToolButton title="حذف آلبوم" disabled={busy} onPress={() => confirmDelete(a.id, true)} /></View>)}
    {limit > 0 && <>{(["service","materials","area"] as const).map(key=><TextInput key={key} style={s.input} placeholder={{service:"خدمت انجام‌شده",materials:"متریال",area:"شهر یا محدوده؛ بدون آدرس خصوصی"}[key]} value={project[key]} onChangeText={value=>setProject({...project,[key]:value})} maxLength={300}/>)}<Text style={s.text}>تصاویر قبل و بعد را با عنوان عکس مشخص کنید؛ انتشار با اجازه مشتری.</Text><TextInput style={s.input} placeholder="نام آلبوم" maxLength={100} value={title} onChangeText={setTitle} /><TextInput style={s.input} placeholder="شرح پروژه" multiline maxLength={2000} value={description} onChangeText={setDescription} /><Text style={s.text}>عکس‌های آلبوم را انتخاب کنید.</Text><View style={s.row}>{media.map(m => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected.includes(m.id) }} key={m.id} disabled={busy} onPress={() => setSelected(v => v.includes(m.id) ? v.filter(id => id !== m.id) : [...v, m.id])}><Image source={{ uri: m.file_url }} style={{ width: 80, height: 80, borderWidth: 3, borderColor: selected.includes(m.id) ? "#176B4D" : "#ddd" }} /></Pressable>)}</View><ToolButton title="ساخت آلبوم" disabled={busy || !title.trim() || !selected.length || albums.length >= limit} onPress={() => void run(async () => { await apiRequest("/api/me/business/albums", { method: "POST", body: JSON.stringify({ title, description, mediaIds: selected, project }) }, token); setTitle(""); setDescription(""); setSelected([]); })} /></>}</View>
  </ScrollView>;
}
