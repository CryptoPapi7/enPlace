import { View, Text, StyleSheet } from "react-native";
import { spacing, typography } from '../theme';
import { useTheme } from '@/providers/ThemeProvider';

export default function StepView({ text }: { text: string }) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.md,
    },
    text: {
      ...typography.body,
      color: colors.text.primary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
