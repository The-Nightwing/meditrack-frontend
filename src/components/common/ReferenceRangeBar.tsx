/**
 * ReferenceRangeBar Component
 * Visual horizontal bar showing where a value falls within reference ranges
 * Color-coded zones for normal, warning, and critical ranges
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Colors, getStatusColor, getStatusBackgroundColor } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { MetricStatus } from '@/types';

interface ReferenceRangeBarProps {
  value: number;
  normalMin: number;
  normalMax: number;
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  unit?: string;
  style?: ViewStyle;
}

const getMetricStatus = (
  value: number,
  normalMin: number,
  normalMax: number,
  warningLow?: number,
  warningHigh?: number,
  criticalLow?: number,
  criticalHigh?: number
): MetricStatus => {
  // Check critical ranges first
  if (criticalLow !== undefined && value < criticalLow) {
    return 'critical_low';
  }
  if (criticalHigh !== undefined && value > criticalHigh) {
    return 'critical_high';
  }

  // Check warning ranges
  if (warningLow !== undefined && value < warningLow) {
    return 'warning_low';
  }
  if (warningHigh !== undefined && value > warningHigh) {
    return 'warning_high';
  }

  // Default to normal
  return 'normal';
};

export const ReferenceRangeBar: React.FC<ReferenceRangeBarProps> = ({
  value,
  normalMin,
  normalMax,
  warningLow,
  warningHigh,
  criticalLow,
  criticalHigh,
  unit,
  style,
}) => {
  // Determine the overall range
  const min = criticalLow ?? warningLow ?? normalMin;
  const max = criticalHigh ?? warningHigh ?? normalMax;
  const range = max - min;

  // Calculate position of value (0-100%)
  const position = Math.max(0, Math.min(100, ((value - min) / range) * 100));

  const status = getMetricStatus(
    value,
    normalMin,
    normalMax,
    warningLow,
    warningHigh,
    criticalLow,
    criticalHigh
  );

  // Calculate zone widths as percentages
  const criticalLowWidth = criticalLow !== undefined ? ((criticalLow - min) / range) * 100 : 0;
  const warningLowWidth = warningLow !== undefined ? ((warningLow - min) / range) * 100 : 0;
  const normalStartWidth = ((normalMin - min) / range) * 100;
  const normalEndWidth = 100 - ((normalMax - min) / range) * 100;
  const warningHighWidth = warningHigh !== undefined ? ((warningHigh - min) / range) * 100 : 0;
  const criticalHighWidth = criticalHigh !== undefined ? ((criticalHigh - min) / range) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      {/* Bar background with zones */}
      <View style={styles.barContainer}>
        {/* Critical Low Zone */}
        {criticalLow !== undefined && (
          <View style={[styles.zone, { flex: criticalLowWidth / 100, backgroundColor: Colors.statusCriticalHigh }]} />
        )}

        {/* Warning Low Zone */}
        {warningLow !== undefined && (
          <View style={[styles.zone, { flex: (warningLowWidth - criticalLowWidth) / 100, backgroundColor: Colors.statusWarningLow }]} />
        )}

        {/* Normal Zone */}
        <View style={[styles.zone, { flex: (normalStartWidth - (warningLowWidth || 0)) / 100, backgroundColor: '#F0F0F0' }]} />
        <View style={[styles.zone, { flex: (100 - normalStartWidth - normalEndWidth) / 100, backgroundColor: Colors.statusNormal }]} />
        <View style={[styles.zone, { flex: (normalEndWidth - (warningHighWidth || 0)) / 100, backgroundColor: '#F0F0F0' }]} />

        {/* Warning High Zone */}
        {warningHigh !== undefined && (
          <View style={[styles.zone, { flex: (warningHighWidth - (warningHigh - normalMax > 0 ? (warningHigh - normalMax) / range : 0)) / 100, backgroundColor: Colors.statusWarningHigh }]} />
        )}

        {/* Critical High Zone */}
        {criticalHigh !== undefined && (
          <View style={[styles.zone, { flex: (100 - (warningHighWidth || 100 - normalEndWidth)) / 100, backgroundColor: Colors.statusCriticalHigh }]} />
        )}

        {/* Value Indicator */}
        <View
          style={[
            styles.indicator,
            {
              left: `${position}%`,
              backgroundColor: getStatusColor(status),
            },
          ]}
        />
      </View>

      {/* Value Display */}
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>
          {value.toFixed(1)} {unit && unit}
        </Text>
        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
          {status === 'normal' ? 'Normal' : status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Range Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.rangeLabel}>{min.toFixed(0)}</Text>
        <Text style={styles.rangeLabel}>{max.toFixed(0)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing[2],
  },
  barContainer: {
    flexDirection: 'row',
    height: 20,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  zone: {
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    width: 3,
    height: '100%',
    top: 0,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
  },
  valueText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
  statusText: {
    ...Typography.labelSmall,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[2],
  },
  rangeLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});

export default ReferenceRangeBar;
