import { Link } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatPersianDate } from '@/src/lib/date';

const services = [
  ['اصلاح مو', '۴۵ دقیقه'],
  ['اصلاح ریش', '۳۰ دقیقه'],
  ['اصلاح مو و ریش', '۶۰ دقیقه'],
  ['پاکسازی پوست', '۴۵ دقیقه']
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>{formatPersianDate(new Date())}</Text>
        <Text style={styles.title}>آرایشگاه شما</Text>
        <Text style={styles.subtitle}>نوبت بعدی‌ات را در کمتر از یک دقیقه رزرو کن.</Text>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>وقت مناسب خودت را انتخاب کن</Text>
          <Text style={styles.heroText}>ساعت‌های آزاد، خدمات و آرایشگر موردنظر را ببین.</Text>
          <Link href="/book" style={styles.primaryButton}>رزرو نوبت</Link>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>اطلاعیه</Text>
          <Text style={styles.noticeText}>این بخش بعداً از پنل آرایشگر و دیتابیس همان سالن مدیریت می‌شود.</Text>
        </View>

        <Text style={styles.sectionTitle}>خدمات</Text>
        {services.map(([name, duration]) => (
          <View key={name} style={styles.card}>
            <Text style={styles.cardTitle}>{name}</Text>
            <Text style={styles.cardMeta}>{duration}</Text>
          </View>
        ))}

        <View style={styles.linksRow}>
          <Link href="/login" style={styles.secondaryButton}>ورود مشتری</Link>
          <Link href="/admin" style={styles.secondaryButton}>پنل آرایشگر</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F5' },
  container: { padding: 20, paddingBottom: 48, gap: 12 },
  eyebrow: { textAlign: 'right', color: '#777', fontSize: 13 },
  title: { textAlign: 'right', fontSize: 30, fontWeight: '800', color: '#111' },
  subtitle: { textAlign: 'right', fontSize: 15, lineHeight: 24, color: '#555', marginBottom: 8 },
  hero: { backgroundColor: '#111', borderRadius: 24, padding: 22, gap: 10 },
  heroTitle: { textAlign: 'right', color: '#fff', fontSize: 22, fontWeight: '800' },
  heroText: { textAlign: 'right', color: '#D3D3D3', lineHeight: 23 },
  primaryButton: { marginTop: 8, backgroundColor: '#fff', color: '#111', textAlign: 'center', padding: 14, borderRadius: 14, fontWeight: '800', overflow: 'hidden' },
  notice: { backgroundColor: '#FFF2CC', borderRadius: 18, padding: 16, marginTop: 4 },
  noticeTitle: { textAlign: 'right', fontWeight: '800', marginBottom: 6 },
  noticeText: { textAlign: 'right', color: '#5B4A1A', lineHeight: 22 },
  sectionTitle: { textAlign: 'right', fontSize: 20, fontWeight: '800', marginTop: 12 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardMeta: { color: '#777' },
  linksRow: { flexDirection: 'row-reverse', gap: 10, marginTop: 12 },
  secondaryButton: { flex: 1, backgroundColor: '#EAEAE6', color: '#111', textAlign: 'center', padding: 13, borderRadius: 14, fontWeight: '700', overflow: 'hidden' }
});
