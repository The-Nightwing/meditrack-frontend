/**
 * Metric status utilities
 */

import { MetricDefinition, MetricStatus } from '@/types';
import { Colors, getStatusColor as getColorFromStatus, getStatusBackgroundColor } from '@/styles/colors';

/**
 * Determine metric status based on value and definition
 */
export function getMetricStatus(value: number, definition: MetricDefinition): MetricStatus {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'normal';
  }

  // Check critical ranges first (highest priority)
  if (definition.criticalRange) {
    if (value <= definition.criticalRange.low) {
      return 'critical_low';
    }
    if (value >= definition.criticalRange.high) {
      return 'critical_high';
    }
  }

  // Check warning ranges
  if (definition.warningRange) {
    if (value < definition.warningRange.low) {
      return 'warning_low';
    }
    if (value > definition.warningRange.high) {
      return 'warning_high';
    }
  }

  // Within normal range
  return 'normal';
}

/**
 * Get color for metric status
 */
export function getStatusColor(status: MetricStatus): string {
  switch (status) {
    case 'normal':
      return Colors.statusNormal;
    case 'warning_low':
    case 'warning_high':
      return Colors.statusWarningHigh;
    case 'critical_low':
      return Colors.statusCriticalLow;
    case 'critical_high':
      return Colors.statusCriticalHigh;
    default:
      return Colors.textMuted;
  }
}

/**
 * Get background color for metric status
 */
export function getStatusBackgroundColor(status: MetricStatus): string {
  switch (status) {
    case 'normal':
      return '#DCFCE7'; // Light green
    case 'warning_low':
    case 'warning_high':
      return '#FEF3C7'; // Light amber
    case 'critical_low':
    case 'critical_high':
      return '#FEE2E2'; // Light red
    default:
      return Colors.surface;
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: MetricStatus): string {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'warning_low':
      return 'Low';
    case 'warning_high':
      return 'High';
    case 'critical_low':
      return 'Critical Low';
    case 'critical_high':
      return 'Critical High';
    default:
      return 'Unknown';
  }
}

/**
 * Check if status indicates a concern
 */
export function isStatusConcerning(status: MetricStatus): boolean {
  return (
    status === 'warning_low' ||
    status === 'warning_high' ||
    status === 'critical_low' ||
    status === 'critical_high'
  );
}

/**
 * Check if status is critical
 */
export function isStatusCritical(status: MetricStatus): boolean {
  return status === 'critical_low' || status === 'critical_high';
}

/**
 * Get severity level from status
 */
export function getSeverityFromStatus(status: MetricStatus): 'low' | 'medium' | 'high' | 'critical' {
  switch (status) {
    case 'normal':
      return 'low';
    case 'warning_low':
    case 'warning_high':
      return 'medium';
    case 'critical_low':
    case 'critical_high':
      return 'critical';
    default:
      return 'low';
  }
}

/**
 * Get icon name for status
 */
export function getStatusIcon(status: MetricStatus): string {
  switch (status) {
    case 'normal':
      return 'check-circle';
    case 'warning_low':
    case 'warning_high':
      return 'alert-circle';
    case 'critical_low':
    case 'critical_high':
      return 'alert-octagon';
    default:
      return 'help-circle';
  }
}

/**
 * Get trend direction based on value change
 */
export function getTrendDirection(
  currentValue: number,
  previousValue: number | undefined,
  idealDirection?: 'up' | 'down' | 'stable'
): 'up' | 'down' | 'stable' {
  if (!previousValue || previousValue === 0) {
    return 'stable';
  }

  const change = currentValue - previousValue;

  if (Math.abs(change) < 0.001) {
    return 'stable';
  }

  return change > 0 ? 'up' : 'down';
}

/**
 * Determine if trend is good or bad based on metric
 */
export function isTrendFavorable(metricCode: string, trend: 'up' | 'down' | 'stable'): boolean {
  // Metrics where up is better
  const upIsBetter = [
    'hemoglobin',
    'hematocrit',
    'wbc',
    'platelet_count',
    'albumin',
    'cholesterol_hdl',
  ];

  // Metrics where down is better
  const downIsBetter = [
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
    'heart_rate',
    'cholesterol_total',
    'cholesterol_ldl',
    'triglycerides',
    'blood_glucose',
    'hba1c',
    'creatinine',
    'bun',
  ];

  if (upIsBetter.includes(metricCode)) {
    return trend === 'up' || trend === 'stable';
  }

  if (downIsBetter.includes(metricCode)) {
    return trend === 'down' || trend === 'stable';
  }

  // Default: stable is always good
  return trend === 'stable';
}

/**
 * Get trend emoji
 */
export function getTrendEmoji(trend: 'up' | 'down' | 'stable', isFavorable: boolean): string {
  if (trend === 'stable') return '—';
  if (trend === 'up') return isFavorable ? '📈' : '📉';
  return isFavorable ? '📉' : '📈';
}
