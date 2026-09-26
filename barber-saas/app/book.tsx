import { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const services = [
  { id: 'hair', name: 'اصلاح مو', duration: 45 },
  { id: 'beard', name: 'اصلاح ریش', duration: 30 },
  { id: 'combo', name: 'اصلاح مو و ریش', duration: 60 }
];
const slots = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00'];

export default function BookingScreen() {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const service = useMemo(() => services.find((item) => item.id === serviceId), [serviceId]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.step}>۱. انتخاب خدمت</Text>
        {services.map((item) => (
          <Pressable key={item.id} onPress={() => setServiceId(item.id)} style={[styles.card, serviceId === item.id && styles.selected]}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.meta}>{item.duration} دقیقه</Text>
          </Pressable>
        ))}

        <Text style={styles.step}>۲. انتخاب ساعت</Text>
        <View style={styles.slotGrid}>
          {slots.map((item) => (
            <Pressable key={item} onPress={() => setSlot(item)} style={[styles.slot, slot === item && styles.slotSelected]}>
              <Text style={[styles.slotText, slot === item && styles.slotTextSelected]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>خلاصه نوبت</Text>
          <Text style={styles.summaryText}>خدمت: {service?.name ?? 'انتخاب نشده'}</Text>
          <Text style={styles.summaryText}>ساعت: {slot ?? 'انتخاب نشده'}</Text>
        </View>

        <Pressable
          style={[styles.confirm, (!service || !slot) && styles.disabled]}
          disabled={!service || !slot}
          onPress={() => Alert.alert('مرحله بعد', 'در مرحله بعد این دکمه به RPC رزرو امن Supabase متصل می‌شود.')}
        >
          <Text style={styles.confirmText}>ثبت نوبت</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F5' },
  container: { padding: 20, gap: 10, paddingBottom: 44 },
  step: { textAlign: 'right', fontSize: 19, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E8E8E2', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  selected: { borderColor: '#111', borderWidth: 2 },
  cardTitle: { fontWeight: '700' },
  meta: { color: '#777' },
  slotGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  slot: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E4E4DE' },
  slotSelected: { backgroundColor: '#111', borderColor: '#111' },
  slotText: { color: '#222' },
  slotTextSelected: { color: '#fff' },
  summary: { backgroundColor: '#EFEFEA', borderRadius: 18, padding: 16, gap: 7, marginTop: 12 },
  summaryTitle: { textAlign: 'right', fontWeight: '800' },
  summaryText: { textAlign: 'right', color: '#555' },
  confirm: { backgroundColor: '#111', borderRadius: 14, padding: 15, marginTop: 6 },
  disabled: { opacity: 0.35 },
  confirmText: { color: '#fff', textAlign: 'center', fontWeight: '800' }
});
