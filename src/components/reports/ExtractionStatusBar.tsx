/**
 * ExtractionStatusBar Component
 * Progress bar / status indicator for AI extraction state
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';

type ExtractionStatus = 'pending' | 'extracting' | 'completed' | 'failed';

interface ExtractionStatusBarProps {
  status: ExtractionStatus;
  confidence?: number;
  style?: ViewStyle;
}

const getStatusLabel = (status: ExtractionStatus): string => {
  switch (status) {
    case 'pending':
      return 'Waiting to extract...';
    case 'extracting':
      return 'Extracting data...';
    case 'completed':
      return 'Extraction completed';
    case 'failed':
      return 'Extraction failed';
    default:
      return 'Unknown';
  }
};

const getStatusIcon = (status: ExtractionStatus): string => {
  switch (status) {
    case 'pending':
      return 'time';
    case 'extracting':
      return 'hourglass';
    case 'completed':
      return 'checkmark-circle';
    case 'failed':
      return 'alert-circle';
    default:
      return 'help-circle';
  }
};

const getStatusColor = (status: ExtractionStatus): string => {
  switch (status) {
    case 'pending':
      return Colors.textMuted;
    case 'extracting':
      return Colors.warning;
    case 'completed':
      return Colors.success;
    case 'failed':
      return Colors.danger;
    default:
      return Colors.textMuted;
  }
};

const getProgressValue = (status: ExtractionStatus): number => {
  switch (status) {
    case 'pending':
      return 0.25;
    case 'extracting':
      return 0.65;
    case 'completed':
      return 1;
    case 'failed':
      return 0.5;
    default:
      return 0;
  }
};

export const ExtractionStatusBar: React.FC<ExtractionStatusBarProps> = ({
  status,
  confidence,
  style,
}) => {
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    const targetProgress = getProgressValue(status);
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [status, progressAnim]);

  const statusLabel = getStatusLabel(status);
  const statusIcon = getStatusIcon(status);
  const statusColor = getStatusColor(status);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const isExtractingOrPending = status === 'extracting' || status === 'pending';

  return (
    <View style={[styles.container, style]}>
      {/* Status Header */}
      <View style={styles.header}>
        <View style={styles.statusInfo}>
          <Ionicons
            name={statusIcon as any}
            size={20}
            color={statusColor}
          />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
        {confidence !== undefined && status === 'completed' && (
          <Text style={styles.confidence}>
            {confidence.toFixed(0)}% confidence
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { borderColor: statusColor }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: statusColor,
            },
          ]}
        />
        {isExtractingOrPending && (
          <Animated.View
            style={[
              styles.progressShimmer,
              {
                width: progressWidth,
              },
            ]}
          />
        )}
      </View>

      {/* Confidence Indicators */}
      {status === 'completed' && confidence !== undefined && (
        <View style={styles.confidenceContainer}>
          <View
            style={[
              styles.confidenceBadge,
              {
                backgroundColor:
                  confidence >= 80
                    ? Colors.success + '20'
                    : confidence >= 60
                      ? Colors.warning + '20'
                      : Colors.danger + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.confidenceText,
                {
                  color:
                    confidence >= 80
                      ? Colors.success
                      : confidence >= 60
                        ? Colors.warning
                        : Colors.danger,
                },
              ]}
            >
              {confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low'} Confidence
            </Text>
          </View>
        </View>
      )}

      {/* Failed State Message */}
      {status === 'failed' && (
        <View style={styles.failedMessage}>
          <Ionicons
            name="alert-circle"
            size={16}
            color={Colors.danger}
          />
          <Text style={styles.failedText}>
            Extraction failed. Please try uploading the file again.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  statusLabel: {
    ...Typography.body,
    fontWeight: '600',
  },
  confidence: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  progressContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressShimmer: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.full,
  },
  confidenceContainer: {
    alignItems: 'flex-start',
  },
  confidenceBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
  },
  confidenceText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  failedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.danger + '10',
    borderRadius: BorderRadius.md,
  },
  failedText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
  },
});

export default ExtractionStatusBar;
