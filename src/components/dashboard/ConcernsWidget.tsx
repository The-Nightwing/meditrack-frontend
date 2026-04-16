/**
 * ConcernsWidget Component
 * Compact list of top concerns with severity color coding
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { Card } from '../common/Card';

interface Concern {
  id: string;
  metricName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  concernType: string;
  latestValue: number;
  unit: string;
}

interface ConcernsWidgetProps {
  concerns: Concern[];
  onPress: (id: string) => void;
  style?: ViewStyle;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return Colors.danger;
    case 'high':
      return Colors.warning;
    case 'medium':
      return Colors.statusWarningLow;
    case 'low':
      return Colors.statusNormal;
    default:
      return Colors.textMuted;
  }
};

const getSeverityLabel = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'See a Doctor';
    case 'high':
    case 'medium':   return 'Watch Closely';
    case 'low':      return 'Heads Up';
    default:         return 'Heads Up';
  }
};

export const ConcernsWidget: React.FC<ConcernsWidgetProps> = ({
  concerns,
  onPress,
  style,
}) => {
  if (concerns.length === 0) {
    return (
      <Card style={[styles.card, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>Top Concerns</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>0</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={Colors.success}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>All Clear</Text>
          <Text style={styles.emptyText}>No active concerns detected</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Top Concerns</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeText}>{concerns.length}</Text>
        </View>
      </View>

      {/* Concerns List */}
      <ScrollView
        scrollEnabled={concerns.length > 3}
        nestedScrollEnabled={true}
        style={styles.scrollContainer}
      >
        {concerns.map((concern, index) => (
          <TouchableOpacity
            key={concern.id}
            style={styles.concernItem}
            onPress={() => onPress(concern.id)}
            activeOpacity={0.7}
          >
            {/* Severity Indicator */}
            <View
              style={[
                styles.severityIndicator,
                { backgroundColor: getSeverityColor(concern.severity) },
              ]}
            />

            {/* Concern Details */}
            <View style={styles.concernDetails}>
              <Text style={styles.concernName}>{concern.metricName}</Text>
              <Text style={styles.concernType}>{concern.concernType}</Text>
            </View>

            {/* Value and Icon */}
            <View style={styles.concernRight}>
              <Text style={styles.concernValue}>
                {concern.latestValue.toFixed(1)} {concern.unit}
              </Text>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(concern.severity) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.severityLabel,
                    { color: getSeverityColor(concern.severity) },
                  ]}
                >
                  {getSeverityLabel(concern.severity)}
                </Text>
              </View>
            </View>

            {/* Divider */}
            {index < concerns.length - 1 && (
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
  },
  badgeCount: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...Typography.label,
    color: Colors.background,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing[6],
    gap: Spacing[2],
  },
  emptyIcon: {
    marginBottom: Spacing[2],
  },
  emptyTitle: {
    ...Typography.h5,
    color: Colors.success,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  scrollContainer: {
    marginHorizontal: -Spacing[4],
    maxHeight: 300,
  },
  concernItem: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  severityIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: Spacing[4],
    top: 0,
    borderRadius: BorderRadius.full,
  },
  concernDetails: {
    flex: 1,
    gap: Spacing[1],
    paddingLeft: Spacing[4],
  },
  concernName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  concernType: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  concernRight: {
    alignItems: 'flex-end',
    gap: Spacing[2],
  },
  concernValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  severityLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[2],
  },
});

export default ConcernsWidget;
