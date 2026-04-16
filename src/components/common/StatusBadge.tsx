/**
 * StatusBadge Component
 * Displays a colored dot with optional label indicating metric status
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, getStatusColor, getStatusBackgroundColor } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography, FontSizes } from '@/styles/typography';
import { MetricStatus } from '@/types';

interface StatusBadgeProps {
  status: MetricStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: ViewStyle;
}

const getStatusLabel = (status: MetricStatus): string => {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'warning_low':
      return 'Low Warning';
    case 'warning_high':
      return 'High Warning';
    case 'critical_low':
      return 'Critical Low';
    case 'critical_high':
      return 'Critical High';
    default:
      return 'Unknown';
  }
};

const getDotSize = (size: 'sm' | 'md' | 'lg'): number => {
  switch (size) {
    case 'sm':
      return 6;
    case 'md':
      return 8;
    case 'lg':
      return 12;
    default:
      return 8;
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = false,
  style,
}) => {
  const dotSize = getDotSize(size);
  const color = getStatusColor(status);
  const backgroundColor = getStatusBackgroundColor(status);

  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ];

  const dotStyle = [
    styles.dot,
    {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: color,
    },
  ];

  return (
    <View style={containerStyle}>
      <View style={dotStyle} />
      {showLabel && (
        <Text style={[styles.label, { color }]}>
          {getStatusLabel(status)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    elevation: 1,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  label: {
    ...Typography.labelSmall,
  },
});

export default StatusBadge;
