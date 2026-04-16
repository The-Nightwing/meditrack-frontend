/**
 * MetricListItem Component
 * Row item showing metric name, latest value, unit, status badge, date. Tappable
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { MetricDefinition, MetricStatus } from '@/types';
import { StatusBadge } from '../common/StatusBadge';

interface MetricListItemProps {
  definition: MetricDefinition;
  latestValue?: number;
  latestTextValue?: string;
  unit?: string;
  status?: MetricStatus;
  dateMeasured?: string;
  onPress: () => void;
  style?: ViewStyle;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const MetricListItem: React.FC<MetricListItemProps> = ({
  definition,
  latestValue,
  latestTextValue,
  unit,
  status,
  dateMeasured,
  onPress,
  style,
}) => {
  const displayValue = latestValue !== undefined
    ? latestValue.toFixed(1)
    : latestTextValue || '—';

  const displayUnit = unit || definition.unit;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        {definition.icon ? (
          <Ionicons
            name={definition.icon as any}
            size={24}
            color={Colors.primary}
          />
        ) : (
          <View style={styles.defaultIcon} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricName} numberOfLines={1}>
            {definition.name}
          </Text>
          {status && (
            <StatusBadge
              status={status}
              size="sm"
              style={styles.badge}
            />
          )}
        </View>
        <Text style={styles.metricValue}>
          {displayValue}
          {displayUnit && <Text style={styles.unit}> {displayUnit}</Text>}
        </Text>
        {dateMeasured && (
          <Text style={styles.date}>{formatDate(dateMeasured)}</Text>
        )}
      </View>

      {/* Chevron */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors.textMuted}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
    marginBottom: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
    gap: Spacing[1],
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
  },
  metricName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    marginHorizontal: 0,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  metricValue: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  unit: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  date: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  chevron: {
    marginLeft: Spacing[2],
  },
});

export default MetricListItem;
