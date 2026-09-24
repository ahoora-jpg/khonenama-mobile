import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { BusinessSummary } from "../types";
import { colors } from "../theme";

export function BusinessCard({ business }: { business: BusinessSummary }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/business/${business.slug}`)}>
      {business.coverUrl ? <Image source={{ uri: business.coverUrl }} style={styles.image} /> : <View style={styles.placeholder}><Text style={styles.placeholderText}>خونه‌نما</Text></View>}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{business.name}</Text>
          {business.verified ? <Text style={styles.verified}>تأییدشده</Text> : null}
        </View>
        <Text style={styles.location}>{[business.area, business.city].filter(Boolean).join("، ")}</Text>
        <Text style={styles.description} numberOfLines={2}>{business.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{business.categoryName || business.services[0] || "دکوراسیون"}</Text>
          {business.reviewCount > 0 ? <Text style={styles.rating}>★ {business.rating.toFixed(1)} ({business.reviewCount})</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: colors.line, marginBottom: 14 },
  image: { width: "100%", height: 165, backgroundColor: colors.cream },
  placeholder: { height: 130, alignItems: "center", justifyContent: "center", backgroundColor: colors.greenSoft },
  placeholderText: { color: colors.green, fontSize: 20, fontWeight: "800" },
  body: { padding: 16, gap: 7 },
  titleRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: 10 },
  title: { color: colors.ink, fontSize: 18, fontWeight: "800", textAlign: "right", flex: 1 },
  verified: { color: colors.green, backgroundColor: colors.greenSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 11 },
  location: { color: colors.muted, textAlign: "right", fontSize: 13 },
  description: { color: colors.ink, textAlign: "right", lineHeight: 22 },
  metaRow: { flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 3 },
  category: { color: colors.green, fontWeight: "700" },
  rating: { color: colors.gold, fontWeight: "700" },
});
