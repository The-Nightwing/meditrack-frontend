/**
 * MetricCard Component
 * Summary card for a key metric with value, colored status, and change indicator
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, getStatusColor, getStatusBackgroundColor } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { TrendArrow } from '../common/TrendArrow';
import { MetricStatus } from '@/types';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  status?: MetricStatus;
  change?: number;
  changeDirection?: 'up' | 'down' | 'stable';
  onPress?: () => void;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  status = 'normal',
  change,
  changeDirection,
  onPress,
  style,
}) => {
  const backgroundColor = getStatusBackgroundColor(status);
  const statusColor = getStatusColor(status);

  const trendDirection =
    changeDirection === 'up'
      ? 'improving'
      : changeDirection === 'down'
        ? 'worsening'
        : 'stable';

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor,
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {status && (
          <StatusBadge
            status={status}
            size="sm"
            showLabel={false}
          />
        )}
      </View>

      {/* Value */}
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: statusColor }]}>
          {value.toFixed(1)}
        </Text>
        {unit && (
          <Text style={[styles.unit, { color: statusColor }]}>
            {unit}
          </Text>
        )}
      </View>

      {/* Change Info */}
      {change !== undefined && changeDirection && (
        <View style={styles.changeContainer}>
          <TrendArrow direction={trendDirection} size={16} />
          <Text
            style={[
              styles.changeText,
              {
                color:
                  changeDirection === 'up'
                    ? Colors.success
                    : changeDirection === 'down'
                      ? Colors.danger
                      : Colors.textMuted,
              },
            ]}
          >
            {Math.abs(change).toFixed(1)}%
          </Text>
          <Text style={styles.changeLabel}>
            {changeDirection === 'up' ? 'increase' : changeDirection === 'down' ? 'decrease' : 'stable'}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  title: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing[1],
  },
  value: {
    ...Typography.h3,
    fontWeight: '700',
  },
  unit: {
    ...Typography.label,
    fontWeight: '500',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  changeText: {
    ...Typography.body,
    fontWeight: '600',
  },
  changeLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});

export default MetricCard;
