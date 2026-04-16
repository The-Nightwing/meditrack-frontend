/**
 * Reusable Button component
 * Supports multiple variants: primary, secondary, outline, danger, ghost
 * Sizes: sm, md, lg
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography, FontSizes, FontWeights } from '@/styles/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  fullWidth?: boolean;
  style?: ViewStyle;
}

/**
 * Button component with multiple variants and sizes
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const containerStyle = [
    styles.container,
    styles[`container_${variant}`],
    styles[`container_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
  ];

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 20;
  const iconColor =
    variant === 'primary' || variant === 'danger'
      ? Colors.background
      : variant === 'ghost'
        ? Colors.primary
        : Colors.primary;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && (
            <Feather
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
  },

  // Size variants
  container_sm: {
    height: 36,
    paddingHorizontal: Spacing[3],
  },
  container_md: {
    height: 44,
    paddingHorizontal: Spacing[4],
  },
  container_lg: {
    height: 52,
    paddingHorizontal: Spacing[6],
  },

  // Color variants
  container_primary: {
    backgroundColor: Colors.primary,
  },
  container_secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  container_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  container_danger: {
    backgroundColor: Colors.danger,
  },
  container_ghost: {
    backgroundColor: 'transparent',
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Full width
  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    fontWeight: FontWeights.semibold as any,
  },
  text_sm: {
    ...Typography.buttonSmall,
    color: Colors.primary,
  },
  text_md: {
    ...Typography.button,
    color: Colors.primary,
  },
  text_lg: {
    ...Typography.button,
    color: Colors.primary,
    fontSize: FontSizes.lg,
  },

  // Text colors by variant
  text_primary: {
    color: Colors.background,
  },
  text_secondary: {
    color: Colors.text,
  },
  text_outline: {
    color: Colors.primary,
  },
  text_danger: {
    color: Colors.background,
  },
  text_ghost: {
    color: Colors.primary,
  },

  // Icon
  icon: {
    marginRight: Spacing[2],
  },
});
