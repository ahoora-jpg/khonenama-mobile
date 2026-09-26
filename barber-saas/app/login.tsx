import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

export default function LoginScreen() {
  const [phone, setPhone] = useState('+98');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function requestOtp() {
    if (!isSupabaseConfigured) return Alert.alert('تنظیمات ناقص', 'ابتدا Supabase را در فایل .env تنظیم کنید.');
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setBusy(false);
    if (error) return Alert.alert('خطا', error.message);
    setSent(true);
  }

  async function verifyOtp() {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    setBusy(false);
    if (error) return Alert.alert('خطا', error.message);
    Alert.alert('ورود موفق', 'حساب کاربری شما فعال شد.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>ورود با شماره همراه</Text>
        <Text style={styles.help}>شماره را با کد کشور وارد کنید؛ مثال: +98912...</Text>
        <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} textAlign="left" />
        {sent && <TextInput value={token} onChangeText={setToken} keyboardType="number-pad" placeholder="کد تأیید" style={styles.input} textAlign="center" />}
        <Pressable style={styles.button} onPress={sent ? verifyOtp : requestOtp} disabled={busy}>
          <Text style={styles.buttonText}>{busy ? 'در حال انجام...' : sent ? 'تأیید کد' : 'ارسال کد'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F5' },
  container: { padding: 24, gap: 14 },
  title: { textAlign: 'right', fontSize: 24, fontWeight: '800', color: '#111' },
  help: { textAlign: 'right', color: '#666', lineHeight: 22 },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E1E1DD' },
  button: { backgroundColor: '#111', borderRadius: 14, padding: 15 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '800' }
});
