import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { bookAppointment, getAvailableSlots, type AvailableSlot } from '@/src/data/booking';
import { getDefaultSalon, getSalonServices, getSalonStaff } from '@/src/data/catalog';
import { formatPersianDate, formatPersianTime } from '@/src/lib/date';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import type { Salon, Service, Staff } from '@/src/types';

function isoDay(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function BookingScreen() {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [day, setDay] = useState(isoDay(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [startAt, setStartAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return { value: isoDay(date), label: formatPersianDate(date) };
  }), []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        const currentSalon = await getDefaultSalon();
        if (!currentSalon) return;
        setSalon(currentSalon);
        const [serviceRows, staffRows] = await Promise.all([
          getSalonServices(currentSalon.id),
          getSalonStaff(currentSalon.id)
        ]);
        setServices(serviceRows);
        setStaff(staffRows);
        setServiceId(serviceRows[0]?.id ?? null);
        setStaffId(staffRows[0]?.id ?? null);
      } catch (error) {
        Alert.alert('خطا در دریافت اطلاعات', error instanceof Error ? error.message : 'خطای نامشخص');
      }
    })();
  }, []);

  useEffect(() => {
    setStartAt(null);
    if (!salon || !serviceId || !staffId || !isSupabaseConfigured) return;
    (async () => {
      try {
        const result = await getAvailableSlots({ salonId: salon.id, staffId, serviceId, day });
        setSlots(result);
      } catch (error) {
        setSlots([]);
        Alert.alert('خطا در زمان‌های آزاد', error instanceof Error ? error.message : 'خطای نامشخص');
      }
    })();
  }, [salon, serviceId, staffId, day]);

  async function confirmBooking() {
    if (!salon || !serviceId || !staffId || !startAt) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return Alert.alert('ورود لازم است', 'برای ثبت نهایی نوبت ابتدا وارد حساب کاربری شوید.');
    setBusy(true);
    try {
      await bookAppointment({ salonId: salon.id, staffId, serviceId, startAt });
      Alert.alert('نوبت ثبت شد', 'درخواست شما با وضعیت «در انتظار تأیید» ثبت شد.');
      setStartAt(null);
      const result = await getAvailableSlots({ salonId: salon.id, staffId, serviceId, day });
      setSlots(result);
    } catch (error) {
      Alert.alert('ثبت نوبت انجام نشد', error instanceof Error ? error.message : 'این زمان دیگر در دسترس نیست.');
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured) {
    return <Message text="برای فعال شدن رزرو واقعی، مقادیر Supabase را در .env تنظیم کنید. اسکیمای امن رزرو داخل supabase/migrations آماده است." />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.step}>۱. انتخاب خدمت</Text>
        {services.map((item) => (
          <Pressable key={item.id} onPress={() => setServiceId(item.id)} style={[styles.card, serviceId === item.id && styles.selected]}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.meta}>{item.duration_minutes} دقیقه</Text>
          </Pressable>
        ))}

        <Text style={styles.step}>۲. انتخاب آرایشگر</Text>
        <View style={styles.wrap}>
          {staff.map((item) => (
            <Pressable key={item.id} onPress={() => setStaffId(item.id)} style={[styles.choice, staffId === item.id && styles.choiceSelected]}>
              <Text style={staffId === item.id ? styles.choiceTextSelected : styles.choiceText}>{item.display_name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.step}>۳. انتخاب روز</Text>
        {days.map((item) => (
          <Pressable key={item.value} onPress={() => setDay(item.value)} style={[styles.day, day === item.value && styles.selected]}>
            <Text style={styles.dayText}>{item.label}</Text>
          </Pressable>
        ))}

        <Text style={styles.step}>۴. انتخاب ساعت</Text>
        <View style={styles.wrap}>
          {slots.map((item) => (
            <Pressable key={item.start_at} onPress={() => setStartAt(item.start_at)} style={[styles.slot, startAt === item.start_at && styles.slotSelected]}>
              <Text style={startAt === item.start_at ? styles.choiceTextSelected : styles.choiceText}>{formatPersianTime(item.start_at)}</Text>
            </Pressable>
          ))}
          {slots.length === 0 && <Text style={styles.empty}>برای این روز زمان آزادی پیدا نشد.</Text>}
        </View>

        <Pressable style={[styles.confirm, (!startAt || busy) && styles.disabled]} disabled={!startAt || busy} onPress={confirmBooking}>
          <Text style={styles.confirmText}>{busy ? 'در حال ثبت...' : 'ثبت نوبت'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Message({ text }: { text: string }) {
  return <SafeAreaView style={styles.safe}><View style={styles.message}><Text style={styles.messageText}>{text}</Text></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F5' },
  container: { padding: 20, gap: 10, paddingBottom: 44 },
  step: { textAlign: 'right', fontSize: 19, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E8E8E2', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  selected: { borderColor: '#111', borderWidth: 2 },
  cardTitle: { fontWeight: '700' },
  meta: { color: '#777' },
  wrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  choice: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E4E4DE' },
  choiceSelected: { backgroundColor: '#111', borderColor: '#111' },
  choiceText: { color: '#222' },
  choiceTextSelected: { color: '#fff' },
  day: { backgroundColor: '#fff', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#E8E8E2' },
  dayText: { textAlign: 'right', color: '#222' },
  slot: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E4E4DE' },
  slotSelected: { backgroundColor: '#111', borderColor: '#111' },
  empty: { textAlign: 'right', color: '#777', paddingVertical: 8 },
  confirm: { backgroundColor: '#111', borderRadius: 14, padding: 15, marginTop: 12 },
  disabled: { opacity: 0.35 },
  confirmText: { color: '#fff', textAlign: 'center', fontWeight: '800' },
  message: { margin: 20, backgroundColor: '#FFF2CC', padding: 18, borderRadius: 16 },
  messageText: { textAlign: 'right', lineHeight: 24, color: '#554400' }
});
