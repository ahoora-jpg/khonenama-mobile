import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function ScreenState({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Pressable style={styles.button} onPress={onRetry}><Text style={styles.buttonText}>تلاش مجدد</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 320, alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: colors.cream },
  title: { fontSize: 20, fontWeight: "900", color: colors.ink, textAlign: "center" },
  message: { marginTop: 10, color: colors.muted, lineHeight: 24, textAlign: "center" },
  button: { marginTop: 20, paddingHorizontal: 22, height: 46, borderRadius: 14, backgroundColor: colors.green, justifyContent: "center" },
  buttonText: { color: colors.white, fontWeight: "900" },
});
