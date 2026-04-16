/**
 * Color palette for MediTrack app — Modern Medical Design System
 */

export const Colors = {
  // Primary — Deep Medical Blue
  primary: '#1D4ED8',
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',
  primarySubtle: '#EFF6FF',
  primaryMid: '#DBEAFE',

  // Accent — Teal / Cyan for health data highlights
  accent: '#0891B2',
  accentLight: '#22D3EE',
  accentSubtle: '#E0F2FE',

  // Success
  success: '#059669',
  successLight: '#10B981',
  successDark: '#047857',
  successSubtle: '#D1FAE5',

  // Warning
  warning: '#D97706',
  warningLight: '#F59E0B',
  warningDark: '#B45309',
  warningSubtle: '#FEF3C7',

  // Danger
  danger: '#DC2626',
  dangerLight: '#EF4444',
  dangerDark: '#991B1B',
  dangerSubtle: '#FEE2E2',

  // Critical / AI Purple
  critical: '#7C3AED',
  criticalLight: '#A78BFA',
  criticalDark: '#5B21B6',
  criticalSubtle: '#EDE9FE',

  // Backgrounds
  background: '#FFFFFF',
  backgroundDark: '#0F172A',
  surface: '#F0F6FF',       // Subtle blue tint — medical feel
  surfaceAlt: '#F8FAFC',    // Near white for inner cards
  surfaceDark: '#1E293B',

  // Card overlays
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',

  // Text
  text: '#0F172A',
  textDark: '#F1F5F9',
  textSecondary: '#475569',
  textSecondaryDark: '#CBD5E1',
  textMuted: '#94A3B8',
  textMutedDark: '#475569',

  // Borders
  border: '#E2E8F0',
  borderDark: '#334155',
  borderLight: '#F1F5F9',
  borderMid: '#CBD5E1',

  // Status semantic colors
  statusNormal: '#059669',
  statusWarningLow: '#D97706',
  statusWarningHigh: '#F59E0B',
  statusCriticalLow: '#DC2626',
  statusCriticalHigh: '#991B1B',

  // Neutral scale
  neutral50: '#F8FAFC',
  neutral100: '#F1F5F9',
  neutral200: '#E2E8F0',
  neutral300: '#CBD5E1',
  neutral400: '#94A3B8',
  neutral500: '#64748B',
  neutral600: '#475569',
  neutral700: '#334155',
  neutral800: '#1E293B',
  neutral900: '#0F172A',

  // Info (kept for backwards compat)
  info: '#0EA5E9',
  infoLight: '#06B6D4',
  infoDark: '#0369A1',
} as const;

/**
 * Get color based on metric status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'normal':
      return Colors.statusNormal;
    case 'out_of_range':
      return Colors.statusWarningHigh;
    case 'warning_low':
      return Colors.statusWarningLow;
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

export function getStatusBackgroundColor(status: string): string {
  switch (status) {
    case 'normal':
      return Colors.successSubtle;
    case 'warning_low':
    case 'warning_high':
      return Colors.warningSubtle;
    case 'critical_low':
    case 'critical_high':
      return Colors.dangerSubtle;
    default:
      return Colors.surface;
  }
}

export type ColorName = keyof typeof Colors;
