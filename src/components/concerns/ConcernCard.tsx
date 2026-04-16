/**
 * ConcernCard Component
 * Card with severity color border, metric name, value, change info, doctor icon if needed
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
import { Card } from '../common/Card';

interface Concern {
  id: string;
  metricName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  concernType: string;
  latestValue: number;
  previousValue?: number;
  unit: string;
  changeDirection?: 'up' | 'down' | 'stable';
  changePercent?: number;
  requiresDoctorConsultation: boolean;
  rangeReason?: string | null;
}

interface ConcernCardProps {
  concern: Concern;
  onPress: () => void;
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
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

export const ConcernCard: React.FC<ConcernCardProps> = ({
  concern,
  onPress,
  style,
}) => {
  const severityColor = getSeverityColor(concern.severity);

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        {
          borderLeftWidth: 4,
          borderLeftColor: severityColor,
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.metricName} numberOfLines={2}>
            {concern.metricName}
          </Text>
          {concern.requiresDoctorConsultation && (
            <View style={styles.doctorBadge}>
              <Ionicons
                name="hospital"
                size={14}
                color={Colors.danger}
              />
              <Text style={styles.doctorLabel}>Consult Doctor</Text>
            </View>
          )}
        </View>
        <View style={[styles.severityBadge, { backgroundColor: severityColor + '20' }]}>
          <Text style={[styles.severityText, { color: severityColor }]}>
            {getSeverityLabel(concern.severity)}
          </Text>
        </View>
      </View>

      {/* Concern Type */}
      <Text style={styles.concernType}>{concern.concernType}</Text>

      {/* Range Reason */}
      {concern.rangeReason && (
        <View style={[styles.rangeReasonBadge, { backgroundColor: severityColor + '15' }]}>
          <Ionicons name="warning-outline" size={12} color={severityColor} />
          <Text style={[styles.rangeReasonText, { color: severityColor }]}>{concern.rangeReason}</Text>
        </View>
      )}

      {/* Value Section */}
      <View style={styles.valueSection}>
        <View style={styles.valueInfo}>
          <Text style={styles.valueLabel}>Current Value</Text>
          <Text style={styles.value}>
            {concern.latestValue.toFixed(1)} {concern.unit}
          </Text>
        </View>

        {/* Change Info */}
        {concern.previousValue !== undefined && concern.changePercent !== undefined && (
          <View style={styles.changeInfo}>
            <View
              style={[
                styles.changeArrow,
                {
                  backgroundColor:
                    concern.changeDirection === 'up'
                      ? Colors.success + '20'
                      : concern.changeDirection === 'down'
                        ? Colors.danger + '20'
                        : Colors.border,
                },
              ]}
            >
              <Ionicons
                name={
                  concern.changeDirection === 'up'
                    ? 'arrow-up'
                    : concern.changeDirection === 'down'
                      ? 'arrow-down'
                      : 'remove'
                }
                size={16}
                color={
                  concern.changeDirection === 'up'
                    ? Colors.success
                    : concern.changeDirection === 'down'
                      ? Colors.danger
                      : Colors.textMuted
                }
              />
            </View>
            <View style={styles.changeDetails}>
              <Text style={styles.previousValue}>
                Was {concern.previousValue.toFixed(1)}
              </Text>
              <Text
                style={[
                  styles.changePercent,
                  {
                    color:
                      concern.changeDirection === 'up'
                        ? Colors.success
                        : concern.changeDirection === 'down'
                          ? Colors.danger
                          : Colors.textMuted,
                  },
                ]}
              >
                {concern.changeDirection === 'up' ? '+' : ''}{concern.changePercent.toFixed(1)}%
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textMuted}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: Spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  titleContainer: {
    flex: 1,
    gap: Spacing[1],
  },
  metricName: {
    ...Typography.h5,
    color: Colors.text,
  },
  doctorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    backgroundColor: Colors.danger + '10',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  doctorLabel: {
    ...Typography.labelSmall,
    color: Colors.danger,
  },
  severityBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
  },
  severityText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  concernType: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  valueSection: {
    gap: Spacing[2],
  },
  valueInfo: {
    gap: Spacing[1],
  },
  valueLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  value: {
    ...Typography.h4,
    color: Colors.text,
  },
  changeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  changeArrow: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeDetails: {
    flex: 1,
    gap: Spacing[1],
  },
  previousValue: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  changePercent: {
    ...Typography.body,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'flex-end',
  },
  rangeReasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  rangeReasonText: {
    fontSize: 11,
    fontWeight: '500' as any,
  },
});

export default ConcernCard;
