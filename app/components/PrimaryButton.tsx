import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, fonts } from '../theme';
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
      backgroundColor: colors.primary[500],
    },
    secondary: {
      backgroundColor: colors.cream[100],
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    disabled: {
      backgroundColor: colors.neutral[200],
    },
    text: {
      fontSize: typography.body.fontSize,
      fontWeight: '600',
    },
    primaryText: {
      color: colors.white,
    },
    secondaryText: {
      color: colors.neutral[700],
    },
    ghostText: {
      color: colors.primary[500],
    },
    disabledText: {
      color: colors.neutral[300],
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