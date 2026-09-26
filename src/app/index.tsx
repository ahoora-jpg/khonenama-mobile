import { useState } from "react";
import { router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

const categories = [
  ["curtain", "پرده", "▥"], ["flooring", "کفپوش", "▤"], ["carpet", "موکت", "▦"],
  ["wallpaper", "کاغذ دیواری", "▧"], ["interior-design", "طراحی داخلی", "◇"], ["smart-home", "خانه هوشمند", "⌂"],
];

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("کرج");
  const openSearch = (category?: string) => router.push({ pathname: "/search", params: { q: query, location, category } });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}><Text style={styles.brand}>خونه‌نما</Text><Text style={styles.tagline}>خانه‌ای برای انتخاب بهتر</Text></View>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>دکوراسیون نزدیک تو</Text>
          <Text style={styles.heading}>برای خونه‌ات، بهتر انتخاب کن.</Text>
          <Text style={styles.copy}>فروشگاه‌ها و متخصصان را پیدا کن، نمونه‌کارها را ببین و مستقیم درخواست قیمت بده.</Text>
          <TextInput value={query} onChangeText={setQuery} placeholder="مثلاً پرده زبرا یا طراح داخلی" placeholderTextColor="#8A938E" style={styles.input} textAlign="right" returnKeyType="search" onSubmitEditing={() => openSearch()} />
          <TextInput value={location} onChangeText={setLocation} placeholder="شهر یا محله" placeholderTextColor="#8A938E" style={styles.input} textAlign="right" />
          <Pressable style={styles.primaryButton} onPress={() => openSearch()}><Text style={styles.primaryText}>جست‌وجو</Text></Pressable>
        </View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>دسته‌بندی‌ها</Text><Text style={styles.sectionCaption}>از کجا شروع کنیم؟</Text></View>
        <View style={styles.grid}>
          {categories.map(([slug, label, icon]) => (
            <Pressable key={slug} style={styles.category} onPress={() => openSearch(slug)}>
              <Text style={styles.categoryIcon}>{icon}</Text><Text style={styles.categoryLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.businessBanner}>
          <Text style={styles.bannerTitle}>صاحب کسب‌وکار هستی؟</Text>
          <Text style={styles.bannerCopy}>در همین اپ درخواست‌ها، پیام‌ها و پروفایل کسب‌وکارت را مدیریت کن.</Text>
          <Pressable style={styles.ownerButton} onPress={() => router.push("/owner")}><Text style={styles.ownerButtonText}>ورود به پنل کسب‌وکار</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream }, page: { padding: 20, paddingTop: 26, paddingBottom: 40 },
  brandRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 },
  brand: { fontSize: 27, color: colors.green, fontWeight: "900" }, tagline: { color: colors.muted, fontSize: 12 },
  hero: { backgroundColor: colors.green, borderRadius: 28, padding: 22, gap: 12 },
  eyebrow: { color: "#CFE2D8", textAlign: "right", fontWeight: "700" }, heading: { color: colors.white, textAlign: "right", fontSize: 30, lineHeight: 42, fontWeight: "900" },
  copy: { color: "#E5EFEA", textAlign: "right", lineHeight: 24, marginBottom: 5 },
  input: { height: 52, backgroundColor: colors.white, borderRadius: 15, paddingHorizontal: 16, color: colors.ink, fontSize: 15 },
  primaryButton: { height: 52, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", borderRadius: 15 }, primaryText: { color: colors.white, fontWeight: "900", fontSize: 16 },
  sectionHeader: { marginTop: 30, marginBottom: 14, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "baseline" }, sectionTitle: { fontSize: 22, fontWeight: "900", color: colors.ink }, sectionCaption: { color: colors.muted },
  grid: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  category: { width: "47%", minHeight: 105, backgroundColor: colors.white, borderRadius: 20, padding: 16, justifyContent: "space-between", borderWidth: 1, borderColor: colors.line },
  categoryIcon: { fontSize: 27, color: colors.green, textAlign: "right" }, categoryLabel: { fontSize: 16, color: colors.ink, fontWeight: "800", textAlign: "right" },
  businessBanner: { marginTop: 28, backgroundColor: colors.white, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.line },
  bannerTitle: { fontSize: 20, fontWeight: "900", color: colors.ink, textAlign: "right" }, bannerCopy: { color: colors.muted, lineHeight: 23, textAlign: "right", marginTop: 8 },
  ownerButton: { marginTop: 16, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.greenSoft }, ownerButtonText: { color: colors.green, fontWeight: "900" },
});
