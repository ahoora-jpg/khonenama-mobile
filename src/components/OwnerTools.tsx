import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

export function ToolButton({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[toolStyles.button, disabled && { opacity: 0.45 }]}><Text style={toolStyles.buttonText}>{title}</Text></Pressable>;
}
export const toolStyles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 16, gap: 14, paddingBottom: 40 },
  panel: { backgroundColor: colors.white, borderRadius: 18, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.line },
  title: { color: colors.ink, fontSize: 20, fontWeight: "900", textAlign: "right" },
  text: { color: colors.muted, textAlign: "right", lineHeight: 24 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, minHeight: 48, color: colors.ink, textAlign: "right" },
  row: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  button: { backgroundColor: colors.green, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: "center" },
  buttonText: { color: colors.white, fontWeight: "800" },
});
