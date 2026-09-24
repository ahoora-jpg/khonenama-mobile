import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { searchBusinesses } from "../api/client";
import { BusinessCard } from "../components/BusinessCard";
import { colors } from "../theme";
import type { BusinessSummary } from "../types";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; location?: string; category?: string }>();
  const [query, setQuery] = useState(params.q || "");
  const [location, setLocation] = useState(params.location || "کرج");
  const [items, setItems] = useState<BusinessSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setItems(await searchBusinesses({ q: query, location, category: params.category })); }
    catch { setError("دریافت اطلاعات ممکن نشد. اتصال اینترنت را بررسی کنید."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    searchBusinesses({ q: params.q || "", location: params.location || "کرج", category: params.category })
      .then((results) => { if (active) setItems(results); })
      .catch(() => { if (active) setError("دریافت اطلاعات ممکن نشد. اتصال اینترنت را بررسی کنید."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.category, params.location, params.q]);

  return (
    <View style={styles.page}>
      <View style={styles.searchBox}>
        <TextInput value={query} onChangeText={setQuery} placeholder="چه چیزی می‌خواهی؟" style={styles.input} textAlign="right" returnKeyType="search" onSubmitEditing={load} />
        <TextInput value={location} onChangeText={setLocation} placeholder="شهر یا محله" style={styles.input} textAlign="right" returnKeyType="search" onSubmitEditing={load} />
        <Pressable style={styles.button} onPress={load}><Text style={styles.buttonText}>جست‌وجو</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color={colors.green} size="large" style={styles.center} /> : error ? <Text style={styles.message}>{error}</Text> : (
        <FlatList data={items} keyExtractor={(item) => item.slug} renderItem={({ item }) => <BusinessCard business={item} />} contentContainerStyle={styles.list} ListHeaderComponent={<Text style={styles.count}>{items.length} نتیجه</Text>} ListEmptyComponent={<Text style={styles.message}>هنوز کسب‌وکاری با این مشخصات پیدا نشد.</Text>} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, searchBox: { padding: 16, gap: 9, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.line },
  input: { height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, color: colors.ink, backgroundColor: "#FAFBFA" },
  button: { height: 46, backgroundColor: colors.green, borderRadius: 14, alignItems: "center", justifyContent: "center" }, buttonText: { color: colors.white, fontWeight: "900" },
  list: { padding: 16, paddingBottom: 36 }, count: { textAlign: "right", color: colors.muted, marginBottom: 12 }, center: { marginTop: 80 }, message: { color: colors.muted, textAlign: "center", margin: 40, lineHeight: 24 },
});
