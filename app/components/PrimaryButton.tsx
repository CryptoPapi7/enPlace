import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { spacing, typography, fonts } from '../theme';
import { useTheme } from '@/providers/ThemeProvider';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function PrimaryButton({ 
  title, 
  onPress, 
  disabled = false,
  variant = 'primary'
}: PrimaryButtonProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: {
      backgroundColor: colors.accent.primary,
    },
    secondary: {
      backgroundColor: colors.surface.secondary,
    },
    ghost: {
      backgroundColor: 'transparent', // intentional: ghost buttons have no surface
    },
    disabled: {
      backgroundColor: colors.border.subtle,
    },
    text: {
      ...typography.bodyMedium,
    },
    primaryText: {
      color: colors.text.inverse,
    },
    secondaryText: {
      color: colors.text.secondary,
    },
    ghostText: {
      color: colors.accent.primary,
    },
    disabledText: {
      color: colors.text.muted,
    },
  });

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text,
        styles[`${variant}Text`],
        disabled && styles.disabledText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}