import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useConcernsStore } from '@/store/concernsStore';
import { useMetricsStore } from '@/store/metricsStore';
import { Colors, getStatusColor } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';
import { formatValue } from '@/utils/formatting';

// ─── Sub-components ─────────────────────────────────────────────────────────

function HealthStatusCard({
  criticalCount,
  activeCount,
  monitoringCount,
  hasData,
  onPress,
  onUploadPress,
}: {
  criticalCount: number;
  activeCount: number;
  monitoringCount: number;
  hasData: boolean;
  onPress: () => void;
  onUploadPress: () => void;
}) {
  if (!hasData) {
    return (
      <TouchableOpacity
        style={[styles.statusCard, { backgroundColor: Colors.surface, borderColor: Colors.border, borderStyle: 'dashed' }]}
        onPress={onUploadPress}
        activeOpacity={0.85}
      >
        <View style={[styles.statusIconWrap, { backgroundColor: Colors.primary + '15' }]}>
          <Feather name="upload" size={22} color={Colors.primary} />
        </View>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusLabel, { color: Colors.primary }]}>No reports yet</Text>
          <Text style={styles.statusDesc}>Upload a report to see your health status</Text>
        </View>
        <Feather name="chevron-right" size={18} color={Colors.primary} />
      </TouchableOpacity>
    );
  }

  const isAllClear = criticalCount === 0 && activeCount === 0;
  const hasCritical = criticalCount > 0;

  const bgColor = hasCritical
    ? Colors.dangerSubtle
    : activeCount > 0
    ? Colors.warningSubtle
    : Colors.successSubtle;

  const borderColor = hasCritical
    ? Colors.danger
    : activeCount > 0
    ? Colors.warning
    : Colors.success;

  const iconColor = hasCritical ? Colors.danger : activeCount > 0 ? Colors.warning : Colors.success;
  const iconName = hasCritical ? 'alert-octagon' : activeCount > 0 ? 'alert-triangle' : 'check-circle';
  const statusLabel = hasCritical
    ? `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} — act now`
    : activeCount > 0
    ? `${activeCount} active concern${activeCount > 1 ? 's' : ''} to review`
    : 'All metrics within normal range';

  return (
    <TouchableOpacity
      style={[styles.statusCard, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.statusIconWrap, { backgroundColor: iconColor + '20' }]}>
        <Feather name={iconName as any} size={22} color={iconColor} />
      </View>
      <View style={styles.statusInfo}>
        <Text style={[styles.statusLabel, { color: iconColor }]}>
          {isAllClear ? 'Health Status: Good' : hasCritical ? 'Urgent Attention Required' : 'Health Status: Monitoring'}
        </Text>
        <Text style={styles.statusDesc}>{statusLabel}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={iconColor} />
    </TouchableOpacity>
  );
}

function StatPill({
  label,
  value,
  color,
  icon,
  onPress,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.statPill, { borderColor: color + '30', backgroundColor: color + '0D' }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={[styles.statPillIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon as any} size={14} color={color} />
      </View>
      <Text style={[styles.statPillValue, { color }]}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { summary, fetchConcerns, fetchConcernsSummary, isLoading: concernsLoading } = useConcernsStore();
  const { recentMetrics, fetchRecentMetrics, isLoading: metricsLoading } = useMetricsStore();

  const isLoading = concernsLoading || metricsLoading;

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchConcernsSummary(),
      fetchConcerns({ limit: 5 }),
      fetchRecentMetrics(6),
    ]);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const criticalCount = summary?.critical ?? 0;
  const activeCount = summary?.active ?? 0;
  const monitoringCount = summary?.monitoring ?? 0;

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={Colors.primary} />
        }
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{user?.firstName ?? 'there'} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}>
              <Feather name="bell" size={20} color={Colors.text} />
              {criticalCount > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* ── Health Status ───────────────────────────────── */}
          <HealthStatusCard
            criticalCount={criticalCount}
            activeCount={activeCount}
            monitoringCount={monitoringCount}
            hasData={recentMetrics.length > 0 || criticalCount > 0 || activeCount > 0 || monitoringCount > 0}
            onPress={() => router.push('/(app)/concerns')}
            onUploadPress={() => router.push('/(app)/reports')}
          />

          {/* ── Stats Row ───────────────────────────────────── */}
          <View style={styles.statsRow}>
            <StatPill
              label="Active"
              value={activeCount}
              color={Colors.warning}
              icon="alert-triangle"
              onPress={() => router.push('/(app)/concerns')}
            />
            <StatPill
              label="Critical"
              value={criticalCount}
              color={Colors.danger}
              icon="alert-octagon"
              onPress={() => router.push('/(app)/concerns')}
            />
            <StatPill
              label="Monitoring"
              value={monitoringCount}
              color={Colors.accent}
              icon="eye"
              onPress={() => router.push('/(app)/concerns')}
            />
            <StatPill
              label="Resolved"
              value={summary?.resolved ?? 0}
              color={Colors.success}
              icon="check-circle"
            />
          </View>

          {/* ── Recent Metrics ──────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Metrics</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/metrics')} style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>See all</Text>
                <Feather name="arrow-right" size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {metricsLoading && recentMetrics.length === 0 ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : recentMetrics.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Feather name="activity" size={24} color={Colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No metrics yet</Text>
                <Text style={styles.emptyDesc}>Upload a report to track your health metrics</Text>
              </View>
            ) : (
              <View style={styles.metricsCard}>
                {(recentMetrics ?? [])
                  .filter((m: any) => {
                    const numVal = m.numericValue ?? m.currentValue ?? (typeof m.value === 'number' ? m.value : parseFloat(String(m.value ?? '')));
                    return !isNaN(numVal) || m.textValue;
                  })
                  .slice(0, 6)
                  .map((m, idx, arr) => {
                    const color = getStatusColor((m as any).status ?? 'normal');
                    const numVal = (m as any).numericValue ?? (m as any).currentValue ?? (typeof (m as any).value === 'number' ? (m as any).value : parseFloat(String((m as any).value ?? '')));
                    const displayValue = !isNaN(numVal) ? formatValue(numVal, (m as any).unit) : ((m as any).textValue ?? '—');
                    const isLast = idx === arr.length - 1;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.metricRow, isLast && styles.metricRowLast]}
                        onPress={() => (m as any).metricCode && router.push({ pathname: '/(app)/metrics/[code]', params: { code: (m as any).metricCode } } as any)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.metricDot, { backgroundColor: color }]} />
                        <Text style={styles.metricName} numberOfLines={1}>
                          {((m as any).metricName ?? (m as any).metricCode ?? '').replace(/_/g, ' ')}
                        </Text>
                        <View style={styles.metricValueWrap}>
                          <Text style={[styles.metricValue, { color }]}>{displayValue}</Text>
                        </View>
                        <Feather name="chevron-right" size={14} color={Colors.neutral300} />
                      </TouchableOpacity>
                    );
                  })}
              </View>
            )}
          </View>

          {/* ── Quick Actions ───────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: 'upload', label: 'Upload\nReport', path: '/(app)/reports', color: Colors.primary, bg: Colors.primarySubtle },
                { icon: 'activity', label: 'View\nMetrics', path: '/(app)/metrics', color: Colors.accent, bg: Colors.accentSubtle },
                { icon: 'alert-triangle', label: 'View\nConcerns', path: '/(app)/concerns', color: Colors.warning, bg: Colors.warningSubtle },
                { icon: 'user', label: 'My\nProfile', path: '/(app)/profile', color: Colors.success, bg: Colors.successSubtle },
              ].map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.actionCard, { backgroundColor: action.bg }]}
                  onPress={() => router.push(action.path as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: action.color + '20' }]}>
                    <Feather name={action.icon as any} size={20} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: Spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[4],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: 2 },
  userName: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold as any, color: Colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  notifBtn: { position: 'relative', padding: Spacing[2] },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold as any, color: '#fff' },

  body: { paddingHorizontal: Spacing[5], paddingTop: Spacing[4] },

  // Health status card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1.5,
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold as any },
  statusDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  // Stat pills
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[5],
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing[1],
  },
  statPillIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statPillValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold as any, lineHeight: 26 },
  statPillLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: FontWeights.medium as any },

  // Section
  section: { marginBottom: Spacing[6] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[3] },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.bold as any, color: Colors.text },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold as any },

  // Metrics card
  metricsCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[3],
  },
  metricRowLast: { borderBottomWidth: 0 },
  metricDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  metricName: { flex: 1, fontSize: FontSizes.sm, color: Colors.text, fontWeight: FontWeights.medium as any, textTransform: 'capitalize' },
  metricValueWrap: {},
  metricValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold as any },

  // Quick Actions
  actionsGrid: { flexDirection: 'row', gap: Spacing[3] },
  actionCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    gap: Spacing[2],
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: FontWeights.bold as any, textAlign: 'center', lineHeight: 15 },

  // Empty states
  emptyCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[6],
    alignItems: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  emptyDesc: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center' },

  loader: { marginVertical: Spacing[6] },
});
