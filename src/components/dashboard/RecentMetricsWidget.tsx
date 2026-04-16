/**
 * RecentMetricsWidget Component
 * List of recent metric entries with status badges and trend info
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { TrendArrow } from '../common/TrendArrow';
import { MetricStatus } from '@/types';

interface Metric {
  code: string;
  displayName: string;
  numericValue: number;
  unit: string;
  status: MetricStatus;
  dateMeasured: string;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

interface RecentMetricsWidgetProps {
  metrics: Metric[];
  onPress: (code: string) => void;
  style?: ViewStyle;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const RecentMetricsWidget: React.FC<RecentMetricsWidgetProps> = ({
  metrics,
  onPress,
  style,
}) => {
  if (metrics.length === 0) {
    return (
      <Card style={[styles.card, style]}>
        <Text style={styles.title}>Recent Metrics</Text>
        <Text style={styles.emptyText}>No metrics recorded yet</Text>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.title}>Recent Metrics</Text>

      <ScrollView
        scrollEnabled={metrics.length > 3}
        nestedScrollEnabled={true}
        style={styles.scrollContainer}
      >
        {metrics.map((metric, index) => (
          <TouchableOpacity
            key={`${metric.code}-${index}`}
            style={styles.metricItem}
            onPress={() => onPress(metric.code)}
            activeOpacity={0.7}
          >
            {/* Metric Name and Value */}
            <View style={styles.metricHeader}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>{metric.displayName}</Text>
                <Text style={styles.metricDate}>
                  {formatDate(metric.dateMeasured)}
                </Text>
              </View>
              <View style={styles.metricValue}>
                <Text style={styles.value}>
                  {metric.numericValue.toFixed(1)}
                </Text>
                <Text style={styles.unit}>{metric.unit}</Text>
              </View>
            </View>

            {/* Status and Trend */}
            <View style={styles.metricFooter}>
              <StatusBadge status={metric.status} size="sm" />
              <View style={styles.trendInfo}>
                {metric.trend && (
                  <>
                    <TrendArrow direction={metric.trend === 'up' ? 'improving' : metric.trend === 'down' ? 'worsening' : 'stable'} size={16} />
                    {metric.changePercent !== undefined && (
                      <Text
                        style={[
                          styles.changePercent,
                          {
                            color:
                              metric.trend === 'up'
                                ? Colors.success
                                : metric.trend === 'down'
                                  ? Colors.danger
                                  : Colors.textMuted,
                          },
                        ]}
                      >
                        {Math.abs(metric.changePercent).toFixed(1)}%
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Divider */}
            {index < metrics.length - 1 && (
              <View style={styles.divider} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing[4],
  },
  scrollContainer: {
    marginHorizontal: -Spacing[4],
    maxHeight: 300,
  },
  metricItem: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricInfo: {
    flex: 1,
    gap: Spacing[1],
  },
  metricName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  metricDate: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  value: {
    ...Typography.bodyLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  unit: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  changePercent: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[2],
  },
});

export default RecentMetricsWidget;
