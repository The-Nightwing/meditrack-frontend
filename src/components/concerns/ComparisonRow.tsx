/**
 * ComparisonRow Component
 * Shows before/after values with arrow and percentage change
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getStatusColor } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { MetricStatus } from '@/types';

interface ComparisonRowProps {
  metricName: string;
  currentValue: number;
  previousValue: number;
  unit: string;
  changeDirection: 'up' | 'down' | 'stable';
  changePercent: number;
  status?: MetricStatus;
  style?: ViewStyle;
}

export const ComparisonRow: React.FC<ComparisonRowProps> = ({
  metricName,
  currentValue,
  previousValue,
  unit,
  changeDirection,
  changePercent,
  status,
  style,
}) => {
  const statusColor = status ? getStatusColor(status) : Colors.textSecondary;

  const getChangeColor = () => {
    if (changeDirection === 'up') return Colors.danger;
    if (changeDirection === 'down') return Colors.success;
    return Colors.textMuted;
  };

  const getArrowIcon = () => {
    if (changeDirection === 'up') return 'arrow-up';
    if (changeDirection === 'down') return 'arrow-down';
    return 'remove';
  };

  return (
    <View style={[styles.container, style]}>
      {/* Metric Name */}
      <View style={styles.metricSection}>
        <Text style={styles.metricName} numberOfLines={1}>
          {metricName}
        </Text>
      </View>

      {/* Values and Arrow */}
      <View style={styles.comparisonSection}>
        {/* Previous Value */}
        <View style={styles.valueBox}>
          <Text style={styles.label}>Previous</Text>
          <Text style={styles.value}>
            {previousValue.toFixed(1)}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>

        {/* Arrow and Change */}
        <View style={styles.arrowSection}>
          <View
            style={[
              styles.arrowIcon,
              { backgroundColor: getChangeColor() + '20' },
            ]}
          >
            <Ionicons
              name={getArrowIcon() as any}
              size={18}
              color={getChangeColor()}
            />
          </View>
          <Text style={[styles.changePercent, { color: getChangeColor() }]}>
            {changePercent.toFixed(1)}%
          </Text>
        </View>

        {/* Current Value */}
        <View style={[styles.valueBox, { borderColor: statusColor }]}>
          <Text style={styles.label}>Current</Text>
          <Text style={[styles.value, { color: statusColor }]}>
            {currentValue.toFixed(1)}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing[2],
  },
  metricSection: {
    flex: 1,
    gap: Spacing[1],
  },
  metricName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  comparisonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  valueBox: {
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  value: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '700',
  },
  unit: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  arrowSection: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  arrowIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePercent: {
    ...Typography.caption,
    fontWeight: '700',
  },
});

export default ComparisonRow;
