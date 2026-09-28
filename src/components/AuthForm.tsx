import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../theme";

export function Field(props: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput accessibilityLabel={props.label} {...props} style={styles.input} textAlign="right" placeholderTextColor="#929B96" /></View>;
}

export function SubmitButton({ title, busy, onPress }: { title: string; busy?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: Boolean(busy), busy: Boolean(busy) }} disabled={busy} style={[styles.button, busy && styles.disabled]} onPress={onPress}><Text style={styles.buttonText}>{busy ? "کمی صبر کنید…" : title}</Text></Pressable>;
}

export function ErrorText({ children }: PropsWithChildren) {
  return children ? <Text style={styles.error}>{children}</Text> : null;
}

const styles = StyleSheet.create({
  field: { gap: 7 }, label: { color: colors.ink, fontWeight: "800", textAlign: "right" },
  input: { height: 52, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 15, color: colors.ink, fontSize: 16 },
  button: { height: 54, borderRadius: 15, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", marginTop: 4 }, disabled: { opacity: 0.65 }, buttonText: { color: colors.white, fontWeight: "900", fontSize: 16 },
  error: { color: "#A33A32", backgroundColor: "#FBEAE8", padding: 12, borderRadius: 12, textAlign: "right", lineHeight: 21 },
});
