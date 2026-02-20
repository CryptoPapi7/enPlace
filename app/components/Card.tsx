import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, shadows } from '../theme';
import { useTheme } from '@/providers/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface.secondary,
      borderRadius: 16,
      padding: spacing.md,
    },
    default: {
      ...shadows.sm,
    },
    elevated: {
      ...shadows.md,
    },
    outlined: {
      borderWidth: 1,
      borderColor: colors.border.subtle,
      shadowOpacity: 0,
      elevation: 0,
    },
  });

  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}