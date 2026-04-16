/**
 * Reusable Input component
 * TextInput with label, error handling, icons, and validation states
 */

import React from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

/**
 * Input component with label, error message, and icons
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  placeholderTextColor = Colors.textMuted,
  ...props
}) => {
  const hasError = !!error;

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainer_error,
        ]}
      >
        {leftIcon && (
          <Feather
            name={leftIcon}
            size={20}
            color={Colors.textMuted}
            style={styles.leftIcon}
          />
        )}

        <RNTextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={placeholderTextColor}
          {...props}
        />

        {rightIcon && (
          <Feather
            name={rightIcon}
            size={20}
            color={Colors.textMuted}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing[2],
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    height: 44,
  },

  inputContainer_error: {
    borderColor: Colors.danger,
    backgroundColor: Colors.background,
  },

  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[2],
  },

  inputWithLeftIcon: {
    paddingLeft: 0,
  },

  inputWithRightIcon: {
    paddingRight: 0,
  },

  leftIcon: {
    marginRight: Spacing[2],
  },

  rightIcon: {
    marginLeft: Spacing[2],
  },

  error: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: Spacing[2],
  },
});
