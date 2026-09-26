import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const today = [
  ['09:00', 'علی رضایی', 'اصلاح مو', 'تأیید شده'],
  ['10:00', 'محمد احمدی', 'اصلاح مو و ریش', 'در انتظار تأیید'],
  ['11:30', 'وقت آزاد', '—', 'آزاد'],
  ['12:00', 'استراحت', '—', 'مسدود']
];

export default function AdminScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>امروز</Text>
        <View style={styles.metrics}>
          <Metric label="نوبت امروز" value="۸" />
          <Metric label="در انتظار" value="۲" />
          <Metric label="وقت آزاد" value="۵" />
        </View>
        {today.map(([time, customer, service, status]) => (
          <View key={`${time}-${customer}`} style={styles.row}>
            <View style={styles.textBlock}>
              <Text style={styles.customer}>{customer}</Text>
              <Text style={styles.service}>{service}</Text>
              <Text style={styles.status}>{status}</Text>
            </View>
            <Text style={styles.time}>{time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F5' },
  container: { padding: 20, gap: 10 },
  title: { textAlign: 'right', fontSize: 26, fontWeight: '800' },
  metrics: { flexDirection: 'row-reverse', gap: 8, marginBottom: 8 },
  metric: { flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 14 },
  metricValue: { color: '#fff', textAlign: 'right', fontSize: 22, fontWeight: '800' },
  metricLabel: { color: '#bbb', textAlign: 'right', fontSize: 12 },
  row: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  textBlock: { alignItems: 'flex-end', gap: 3 },
  customer: { fontWeight: '800', color: '#222' },
  service: { color: '#666' },
  status: { color: '#8A6B00', fontSize: 12 },
  time: { fontSize: 18, fontWeight: '800', color: '#111' }
});
