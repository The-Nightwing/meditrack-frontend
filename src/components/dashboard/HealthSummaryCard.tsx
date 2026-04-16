/**
 * HealthSummaryCard Component
 * Displays overall health status with concern counts and color indicators
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { Card } from '../common/Card';

interface ConcernsCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface HealthSummaryCardProps {
  concernsCount: ConcernsCount;
  lastUpdated?: string;
  style?: ViewStyle;
}

export const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({
  concernsCount,
  lastUpdated,
  style,
}) => {
  const totalConcerns =
    concernsCount.critical +
    concernsCount.high +
    concernsCount.medium +
    concernsCount.low;

  const hasAnyConcerns = totalConcerns > 0;
  const hasHighPriorityConcerns =
    concernsCount.critical > 0 || concernsCount.high > 0;

  const getHealthStatus = () => {
    if (concernsCount.critical > 0) return 'See a Doctor';
    if (concernsCount.high > 0) return 'Watch Closely';
    if (concernsCount.medium > 0) return 'Watch Closely';
    if (concernsCount.low > 0) return 'Heads Up';
    return 'All Good';
  };

  const getStatusColor = () => {
    if (concernsCount.critical > 0) return Colors.danger;
    if (concernsCount.high > 0) return Colors.warning;
    if (concernsCount.medium > 0) return Colors.statusWarningLow;
    if (concernsCount.low > 0) return Colors.statusWarningLow;
    return Colors.success;
  };

  const getConcernColor = (level: 'critical' | 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'critical':
        return Colors.danger;
      case 'high':
        return Colors.warning;
      case 'medium':
        return Colors.statusWarningLow;
      case 'low':
        return Colors.statusNormal;
    }
  };

  return (
    <Card style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.statusText}>{getHealthStatus()}</Text>
          <Text style={styles.title}>Overall Health</Text>
        </View>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
      </View>

      {/* Concerns Summary */}
      {hasAnyConcerns && (
        <View style={styles.concernsContainer}>
          <Text style={styles.concernsTitle}>Active Concerns</Text>
          <View style={styles.concernsList}>
            {concernsCount.critical > 0 && (
              <View style={styles.concernItem}>
                <View
                  style={[
                    styles.concernDot,
                    { backgroundColor: getConcernColor('critical') },
                  ]}
                />
                <Text style={styles.concernLabel}>
                  {concernsCount.critical} See a Doctor
                </Text>
              </View>
            )}
            {concernsCount.high > 0 && (
              <View style={styles.concernItem}>
                <View
                  style={[
                    styles.concernDot,
                    { backgroundColor: getConcernColor('high') },
                  ]}
                />
                <Text style={styles.concernLabel}>
                  {concernsCount.high} Watch Closely
                </Text>
              </View>
            )}
            {concernsCount.medium > 0 && (
              <View style={styles.concernItem}>
                <View
                  style={[
                    styles.concernDot,
                    { backgroundColor: getConcernColor('medium') },
                  ]}
                />
                <Text style={styles.concernLabel}>
                  {concernsCount.medium} Watch Closely
                </Text>
              </View>
            )}
            {concernsCount.low > 0 && (
              <View style={styles.concernItem}>
                <View
                  style={[
                    styles.concernDot,
                    { backgroundColor: getConcernColor('low') },
                  ]}
                />
                <Text style={styles.concernLabel}>
                  {concernsCount.low} Heads Up
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {lastUpdated}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusText: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: Spacing[1],
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  concernsContainer: {
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  concernsTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  concernsList: {
    gap: Spacing[2],
  },
  concernItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  concernDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  concernLabel: {
    ...Typography.body,
    color: Colors.text,
  },
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});

export default HealthSummaryCard;
