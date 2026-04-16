/**
 * LoadingSkeleton Component
 * Animated shimmer placeholder using Animated API
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/styles/colors';
import { BorderRadius, Spacing } from '@/styles/spacing';

interface LoadingSkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width,
  height,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const shimmerAnimatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnimatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnimatedValue]);

  const backgroundColor = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.neutral200, Colors.neutral100],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

export default LoadingSkeleton;
