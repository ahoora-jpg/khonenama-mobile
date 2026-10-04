import { useEffect, useState } from "react";
import PublicCampaigns from "../../components/PublicCampaigns";
import CustomerReview from "../../components/CustomerReview";
import SavedBusiness from "../../components/SavedBusiness";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getBusiness } from "../../api/client";
import { colors } from "../../theme";
import type { BusinessDetail } from "../../types";
import { BusinessQuote } from "../../components/BusinessQuote";

export default function BusinessScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [error, setError] = useState("");
  const [openAlbum, setOpenAlbum] = useState<number | null>(null);
  useEffect(() => { if (slug) getBusiness(slug).then(setBusiness).catch(() => setError("این پروفایل در دسترس نیست.")); }, [slug]);
  if (error) return <Text style={styles.message}>{error}</Text>;
  if (!business) return <ActivityIndicator color={colors.green} size="large" style={styles.loader} />;
  const cover = business.media?.find((item) => item.kind === "cover")?.url || business.media?.[0]?.url;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {cover ? <Image source={{ uri: cover }} style={styles.cover} /> : <View style={styles.coverPlaceholder}><Text style={styles.placeholderText}>خونه‌نما</Text></View>}
      <View style={styles.panel}>
        <Text style={styles.title}>{business.name}</Text>
        <Text style={styles.location}>{[business.area, business.city].filter(Boolean).join("، ")}</Text>
        <Text style={styles.description}>{business.description}</Text>
        <View style={styles.tags}>{business.services.slice(0, 6).map((service) => <Text key={service} style={styles.tag}>{service}</Text>)}</View>
        {business.address ? <Text style={styles.address}>نشانی: {business.address}</Text> : null}
        <View style={styles.actions}>
          {business.phone ? <Pressable style={styles.primary} onPress={() => Linking.openURL(`tel:${business.phone}`)}><Text style={styles.primaryText}>تماس</Text></Pressable> : null}
          {business.whatsapp ? <Pressable style={styles.secondary} onPress={() => Linking.openURL(`https://wa.me/${business.whatsapp.replace(/\D/g, "").replace(/^0/, "98")}`)}><Text style={styles.secondaryText}>واتساپ</Text></Pressable> : null}
        </View>
      </View>
      {business.media?.length ? <View style={styles.panel}><Text style={styles.sectionTitle}>گالری نمونه‌کار</Text>{business.media.map(item => <View key={item.id}><Image source={{ uri: item.url }} style={{ width: "100%", height: 230, marginTop: 12, borderRadius: 12 }} resizeMode="contain" accessibilityLabel={item.altText || "نمونه‌کار"} />{item.altText ? <Text style={styles.description}>{item.altText}</Text> : null}</View>)}</View> : null}
      {business.albums?.length ? <View style={styles.panel}><Text style={styles.sectionTitle}>آلبوم‌های پروژه</Text>{business.albums.map(album => <View key={album.id}><Pressable accessibilityRole="button" onPress={() => setOpenAlbum(openAlbum === album.id ? null : album.id)}><Text style={styles.description}>{album.title} · {album.media.length} تصویر</Text></Pressable>{openAlbum === album.id && <><Text style={styles.description}>{album.description}</Text>{album.project && <Text style={styles.description}>{[album.project.service,album.project.materials,album.project.area].filter(Boolean).join(" · ")}</Text>}{album.media.map(item => <Image key={item.id} source={{ uri: item.url }} style={{ height: 220, marginTop: 12 }} resizeMode="contain" accessibilityLabel={item.altText || album.title} />)}</>}</View>)}</View> : null}
      {business.hours?.length ? <View style={styles.panel}><Text style={styles.sectionTitle}>ساعت کاری</Text>{business.hours.map(h => <Text key={h.weekday} style={styles.description}>{["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"][h.weekday]}: {h.isClosed ? "تعطیل" : `${h.opensAt} تا ${h.closesAt}`}</Text>)}</View> : null}
      <PublicCampaigns slug={business.slug}/><SavedBusiness slug={business.slug}/><BusinessQuote slug={business.slug} name={business.name} /><CustomerReview slug={business.slug}/><Pressable style={styles.panel} onPress={()=>router.push({pathname:"/support",params:{slug:business.slug}})}><Text style={styles.description}>گزارش مشکل این غرفه</Text></Pressable>
      {business.reviews?.length ? <View style={styles.panel}><Text style={styles.sectionTitle}>نظر مشتریان</Text>{business.reviews.map((review) => <View key={review.id} style={styles.review}><Text style={styles.reviewTitle}>{review.name} · {"★".repeat(review.rating)}</Text><Text style={styles.reviewBody}>{review.body}</Text><Pressable onPress={()=>router.push({pathname:"/support",params:{slug:business.slug,reviewId:String(review.id)}})}><Text style={styles.description}>گزارش این نظر</Text></Pressable>{review.reply ? <Text style={styles.reviewBody}>پاسخ کسب‌وکار: {review.reply}</Text> : null}</View>)}</View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { paddingBottom: 36 }, cover: { width: "100%", height: 245, backgroundColor: colors.greenSoft },
  coverPlaceholder: { height: 200, backgroundColor: colors.greenSoft, alignItems: "center", justifyContent: "center" }, placeholderText: { color: colors.green, fontSize: 24, fontWeight: "900" },
  panel: { backgroundColor: colors.white, margin: 16, marginBottom: 0, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.line },
  title: { color: colors.ink, fontSize: 25, fontWeight: "900", textAlign: "right" }, location: { color: colors.green, textAlign: "right", marginTop: 6, fontWeight: "700" },
  description: { color: colors.ink, textAlign: "right", lineHeight: 26, marginTop: 18 }, tags: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginTop: 16 },
  tag: { color: colors.green, backgroundColor: colors.greenSoft, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, overflow: "hidden" }, address: { textAlign: "right", color: colors.muted, lineHeight: 23, marginTop: 18 },
  actions: { flexDirection: "row-reverse", gap: 10, marginTop: 20 }, primary: { flex: 1, height: 48, backgroundColor: colors.green, borderRadius: 14, alignItems: "center", justifyContent: "center" }, primaryText: { color: colors.white, fontWeight: "900" },
  secondary: { flex: 1, height: 48, borderWidth: 1, borderColor: colors.green, borderRadius: 14, alignItems: "center", justifyContent: "center" }, secondaryText: { color: colors.green, fontWeight: "900" },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: "900", textAlign: "right", marginBottom: 6 }, review: { paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.line }, reviewTitle: { textAlign: "right", color: colors.gold, fontWeight: "800" }, reviewBody: { textAlign: "right", color: colors.ink, lineHeight: 23, marginTop: 6 },
  loader: { flex: 1, marginTop: 120 }, message: { color: colors.muted, textAlign: "center", marginTop: 100 },
});
