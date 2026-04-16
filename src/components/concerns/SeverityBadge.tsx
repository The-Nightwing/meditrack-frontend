/**
 * SeverityBadge Component
 * Colored pill badge: low=green, medium=amber, high=orange, critical=red
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

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface SeverityBadgeProps {
  severity: Severity;
  style?: ViewStyle;
}

const getSeverityColor = (severity: Severity): string => {
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

const getSeverityLabel = (severity: Severity): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  style,
}) => {
  const color = getSeverityColor(severity);
  const label = getSeverityLabel(severity);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
        },
        style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.label,
    color: Colors.background,
    fontWeight: '700',
  },
});

export default SeverityBadge;
