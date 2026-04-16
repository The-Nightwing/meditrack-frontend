/**
 * ReportCard Component
 * Card showing report info, type badge, extraction status badge
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

interface Report {
  id: string;
  title: string;
  reportType: 'medical_report' | 'lab_result' | 'imaging' | 'prescription' | 'other';
  reportDate: string;
  sourceType?: string;
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedMetricsCount: number;
}

interface ReportCardProps {
  report: Report;
  onPress: () => void;
  style?: ViewStyle;
}

const getReportTypeLabel = (type: string): string => {
  switch (type) {
    case 'medical_report':
      return 'Medical Report';
    case 'lab_result':
      return 'Lab Result';
    case 'imaging':
      return 'Imaging';
    case 'prescription':
      return 'Prescription';
    case 'other':
      return 'Other';
    default:
      return 'Document';
  }
};

const getReportTypeIcon = (type: string): string => {
  switch (type) {
    case 'medical_report':
      return 'document-text';
    case 'lab_result':
      return 'flask';
    case 'imaging':
      return 'image';
    case 'prescription':
      return 'pills';
    default:
      return 'document';
  }
};

const getReportTypeColor = (type: string): string => {
  switch (type) {
    case 'medical_report':
      return Colors.primary;
    case 'lab_result':
      return Colors.info;
    case 'imaging':
      return Colors.warning;
    case 'prescription':
      return Colors.success;
    default:
      return Colors.textMuted;
  }
};

const getExtractionStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing...';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
};

const getExtractionStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return Colors.textMuted;
    case 'processing':
      return Colors.warning;
    case 'completed':
      return Colors.success;
    case 'failed':
      return Colors.danger;
    default:
      return Colors.textMuted;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onPress,
  style,
}) => {
  const typeLabel = getReportTypeLabel(report.reportType);
  const typeIcon = getReportTypeIcon(report.reportType);
  const typeColor = getReportTypeColor(report.reportType);
  const statusLabel = getExtractionStatusLabel(report.extractionStatus);
  const statusColor = getExtractionStatusColor(report.extractionStatus);

  return (
    <Card
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name={typeIcon as any}
            size={24}
            color={typeColor}
          />
          <View style={styles.titleText}>
            <Text style={styles.title} numberOfLines={2}>
              {report.title}
            </Text>
            <Text style={styles.date}>
              {formatDate(report.reportDate)}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textMuted}
        />
      </View>

      {/* Badges */}
      <View style={styles.badges}>
        {/* Report Type Badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: typeColor + '20', borderColor: typeColor },
          ]}
        >
          <Text style={[styles.badgeText, { color: typeColor }]}>
            {typeLabel}
          </Text>
        </View>

        {/* Extraction Status Badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColor + '20', borderColor: statusColor },
          ]}
        >
          {report.extractionStatus === 'processing' && (
            <View
              style={[
                styles.spinner,
                { borderColor: statusColor },
                {
                  borderRightColor: 'transparent',
                  borderTopColor: 'transparent',
                },
              ]}
            />
          )}
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Metrics Count */}
      {report.extractionStatus === 'completed' && (
        <View style={styles.metricsInfo}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={Colors.success}
          />
          <Text style={styles.metricsText}>
            {report.extractedMetricsCount} metric{report.extractedMetricsCount !== 1 ? 's' : ''} extracted
          </Text>
        </View>
      )}
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
    gap: Spacing[2],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    flex: 1,
  },
  titleText: {
    flex: 1,
    gap: Spacing[1],
  },
  title: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  date: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  spinner: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
  },
  metricsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metricsText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
});

export default ReportCard;
