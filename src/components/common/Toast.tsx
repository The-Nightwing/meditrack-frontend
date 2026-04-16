/**
 * Toast Component
 * Auto-dismissing toast notification at top of screen
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  style?: ViewStyle;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#DCFCE7',
        borderColor: Colors.success,
        textColor: Colors.success,
        icon: 'checkmark-circle' as const,
      };
    case 'error':
      return {
        backgroundColor: '#FEE2E2',
        borderColor: Colors.danger,
        textColor: Colors.danger,
        icon: 'alert-circle' as const,
      };
    case 'warning':
      return {
        backgroundColor: '#FEF3C7',
        borderColor: Colors.warning,
        textColor: Colors.warning,
        icon: 'warning' as const,
      };
    case 'info':
    default:
      return {
        backgroundColor: '#E0F2FE',
        borderColor: Colors.info,
        textColor: Colors.info,
        icon: 'information-circle' as const,
      };
  }
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onHide,
  duration = 3000,
  style,
}) => {
  const config = getToastConfig(type);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, animatedValue, duration, onHide]);

  if (!visible) {
    return null;
  }

  const opacity = animatedValue;
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        <Ionicons
          name={config.icon}
          size={20}
          color={config.textColor}
          style={styles.icon}
        />
        <Text
          style={[styles.message, { color: config.textColor }]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Spacing[4],
    left: Spacing[4],
    right: Spacing[4],
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    elevation: 5,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  icon: {
    marginRight: Spacing[2],
  },
  message: {
    ...Typography.body,
    flex: 1,
  },
});

export default Toast;
