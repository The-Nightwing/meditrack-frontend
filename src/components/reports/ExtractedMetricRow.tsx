/**
 * ExtractedMetricRow Component
 * Row showing an AI-extracted metric with confidence score and accept/edit/reject actions
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

interface ExtractedMetric {
  code: string;
  displayName: string;
  value: number | string;
  unit: string;
  confidence: number;
}

interface ExtractedMetricRowProps {
  metric: ExtractedMetric;
  onAccept: () => void;
  onEdit: () => void;
  onReject: () => void;
  accepted?: boolean;
  rejected?: boolean;
  style?: ViewStyle;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 80) return Colors.success;
  if (confidence >= 60) return Colors.warning;
  return Colors.danger;
};

const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 80) return 'High';
  if (confidence >= 60) return 'Medium';
  return 'Low';
};

export const ExtractedMetricRow: React.FC<ExtractedMetricRowProps> = ({
  metric,
  onAccept,
  onEdit,
  onReject,
  accepted = false,
  rejected = false,
  style,
}) => {
  const backgroundColor = accepted
    ? Colors.success + '10'
    : rejected
      ? Colors.danger + '10'
      : Colors.surface;

  const borderColor = accepted
    ? Colors.success
    : rejected
      ? Colors.danger
      : Colors.border;

  return (
    <View style={[styles.container, { backgroundColor, borderColor }, style]}>
      {/* Metric Info */}
      <View style={styles.metricInfo}>
        <View style={styles.metricDetails}>
          <Text style={styles.metricName} numberOfLines={2}>
            {metric.displayName}
          </Text>
          <Text style={styles.metricValue}>
            {typeof metric.value === 'number'
              ? (Math.abs(metric.value) < 0.1 && metric.value !== 0 ? parseFloat(metric.value.toPrecision(2)).toString() : metric.value.toFixed(1))
              : metric.value} {metric.unit}
          </Text>
        </View>

        {/* Confidence Badge */}
        <View
          style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(metric.confidence) + '20' },
          ]}
        >
          <View
            style={[
              styles.confidenceDot,
              { backgroundColor: getConfidenceColor(metric.confidence) },
            ]}
          />
          <Text
            style={[
              styles.confidenceText,
              { color: getConfidenceColor(metric.confidence) },
            ]}
          >
            {metric.confidence.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Status or Actions */}
      {accepted ? (
        <View style={styles.acceptedStatus}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={Colors.success}
          />
          <Text style={[styles.statusText, { color: Colors.success }]}>
            Accepted
          </Text>
        </View>
      ) : rejected ? (
        <View style={styles.rejectedStatus}>
          <Ionicons
            name="close-circle"
            size={20}
            color={Colors.danger}
          />
          <Text style={[styles.statusText, { color: Colors.danger }]}>
            Rejected
          </Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={onAccept}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color={Colors.background}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="pencil"
              size={16}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={onReject}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="close"
              size={18}
              color={Colors.background}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing[3],
    marginBottom: Spacing[2],
  },
  metricInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
  },
  metricDetails: {
    flex: 1,
    gap: Spacing[1],
  },
  metricName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  metricValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confidenceText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  acceptedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  rejectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  editButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rejectButton: {
    backgroundColor: Colors.danger,
  },
});

export default ExtractedMetricRow;
