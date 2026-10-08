import { Redirect, router } from "expo-router";
import { ActivityIndicator, Linking, ScrollView, Text, View } from "react-native";
import { useBusinessSession } from "../auth/BusinessSessionContext";
import { ToolButton, toolStyles as s } from "../components/OwnerTools";
export default function HomeScreen() {
 const { token, loading } = useBusinessSession();
 if(loading) return <ActivityIndicator accessibilityLabel="دریافت حساب"/>;
 if(token) return <Redirect href="/owner"/>;
 return <ScrollView style={s.page} contentContainerStyle={s.content}><View style={s.panel}>
 <Text style={s.title}>خونه‌نما؛ پنل کسب‌وکار شما</Text><Text style={s.text}>درخواست مشتریان سایت، غرفه، عکس‌ها و آلبوم‌ها را از گوشی مدیریت کنید.</Text>
 <ToolButton title="ورود به غرفه من" onPress={()=>router.push("/business-login")}/>
 <ToolButton title="ثبت رایگان کسب‌وکار" onPress={()=>router.push("/business-register")}/>
 <Text style={s.text}>مشتریان بدون نصب اپ از سایت درخواست می‌فرستند. برای دریافت اعلان، اجازه اعلان گوشی را فعال کنید.</Text>
 <ToolButton title="مشاهده بازار برای مشتریان" onPress={()=>void Linking.openURL("https://khonenama.ir/")}/>
 </View></ScrollView>;
}
