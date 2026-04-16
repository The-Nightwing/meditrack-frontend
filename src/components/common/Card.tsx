/**
 * Reusable Card component
 * Flexible container with rounded corners, white background, optional shadow
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';

type ShadowLevel = 'none' | 'sm' | 'md';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  shadow?: ShadowLevel;
  padding?: number;
  testID?: string;
}

/**
 * Card component - flexible container with optional shadow and touch handling
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  shadow = 'sm',
  padding = Spacing[4],
  testID,
}) => {
  const containerStyle = [
    styles.container,
    styles[`shadow_${shadow}`],
    { padding },
    style,
  ];

  const Component = onPress ? Pressable : View;

  return (
    <Component
      style={containerStyle}
      onPress={onPress}
      android_ripple={
        onPress ? { color: Colors.primary + '10' } : undefined
      }
      testID={testID}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  // Shadow variants
  shadow_none: {
    elevation: 0,
    shadowColor: 'transparent',
  },
  shadow_sm: {
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  shadow_md: {
    elevation: 4,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
});
