/**
 * TrendArrow Component
 * Displays trend direction: up (improving), down (worsening), right (stable), dash (insufficient data)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/styles/colors';

type TrendDirection = 'improving' | 'worsening' | 'stable' | 'insufficient_data';

interface TrendArrowProps {
  direction: TrendDirection;
  size?: number;
  style?: ViewStyle;
}

const getTrendSymbol = (direction: TrendDirection): string => {
  switch (direction) {
    case 'improving':
      return '↑';
    case 'worsening':
      return '↓';
    case 'stable':
      return '→';
    case 'insufficient_data':
      return '−';
    default:
      return '−';
  }
};

const getTrendColor = (direction: TrendDirection): string => {
  switch (direction) {
    case 'improving':
      return Colors.success;
    case 'worsening':
      return Colors.danger;
    case 'stable':
      return Colors.textMuted;
    case 'insufficient_data':
      return Colors.textMuted;
    default:
      return Colors.textMuted;
  }
};

export const TrendArrow: React.FC<TrendArrowProps> = ({
  direction,
  size = 24,
  style,
}) => {
  const color = getTrendColor(direction);
  const symbol = getTrendSymbol(direction);

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.arrow,
          {
            color,
            fontSize: size,
            lineHeight: size,
          },
        ]}
      >
        {symbol}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontWeight: '600',
  },
});

export default TrendArrow;
