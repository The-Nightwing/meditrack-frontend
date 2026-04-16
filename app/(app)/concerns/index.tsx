import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useConcernsStore } from '@/store/concernsStore';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  critical: { color: Colors.danger,       bg: Colors.dangerSubtle,   label: 'Critical', icon: 'alert-octagon' },
  high:     { color: Colors.warning,      bg: Colors.warningSubtle,  label: 'High',     icon: 'alert-triangle' },
  medium:   { color: Colors.warningLight, bg: Colors.warningSubtle,  label: 'Medium',   icon: 'alert-circle' },
  low:      { color: Colors.success,      bg: Colors.successSubtle,  label: 'Low',      icon: 'info' },
};

const STATUS_FILTERS = ['All', 'Active', 'Monitoring', 'Acknowledged', 'Resolved'];

function ConcernCard({ concern, onPress }: { concern: any; onPress: () => void }) {
  const sevKey = (concern.severity ?? '').toLowerCase();
  const sev = SEVERITY_CONFIG[sevKey] ?? SEVERITY_CONFIG.low;
  const statusKey = (concern.status ?? '').toLowerCase();
  const isUrgent = statusKey === 'active' && sevKey === 'critical';
  const title = concern.metricName ?? concern.title ?? '—';
  const description = concern.rangeReason ?? concern.description ?? '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.78}>
      {/* Severity stripe */}
      <View style={[styles.cardStripe, { backgroundColor: sev.color }]} />

      <View style={styles.cardInner}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={[styles.cardSevIcon, { backgroundColor: sev.bg }]}>
            <Feather name={sev.icon as any} size={14} color={sev.color} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
          </View>
          <View style={styles.cardBadges}>
            {isUrgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}
            <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
              <Text style={[styles.sevBadgeText, { color: sev.color }]}>{sev.label}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {!!description && (
          <Text style={styles.cardDesc} numberOfLines={2}>{description}</Text>
        )}

        {/* Value */}
        {concern.latestValue != null && (
          <View style={styles.valueRow}>
            <Text style={[styles.valueText, { color: sev.color }]}>
              {concern.latestValue} {concern.unit}
            </Text>
            {concern.normalMin != null && concern.normalMax != null && (
              <Text style={styles.normalText}>
                Normal: {concern.normalMin}–{concern.normalMax} {concern.unit}
              </Text>
            )}
          </View>
        )}

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <View style={styles.statusChip}>
            <View style={[styles.statusDot, { backgroundColor: sev.color }]} />
            <Text style={styles.statusText}>{statusKey}</Text>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.neutral300} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ConcernsScreen() {
  const router = useRouter();
  const { concerns, summary, fetchConcerns, fetchConcernsSummary, isLoading } = useConcernsStore();
  const [activeFilter, setActiveFilter] = useState('All');

  const loadData = useCallback(async () => {
    await Promise.all([fetchConcernsSummary(), fetchConcerns()]);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const filtered = activeFilter === 'All'
    ? concerns
    : concerns.filter((c: any) => (c.status ?? '').toLowerCase() === activeFilter.toLowerCase());

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Concerns</Text>
        {concerns.length > 0 && (
          <View style={styles.headerCount}>
            <Text style={styles.headerCountText}>{concerns.length}</Text>
          </View>
        )}
      </View>

      {/* Summary cards */}
      {summary && (
        <View style={styles.summaryRow}>
          {[
            { label: 'Critical',   value: summary.critical,   color: Colors.danger,   bg: Colors.dangerSubtle },
            { label: 'Active',     value: summary.active,     color: Colors.warning,  bg: Colors.warningSubtle },
            { label: 'Monitoring', value: summary.monitoring, color: Colors.accent,   bg: Colors.accentSubtle },
            { label: 'Resolved',   value: summary.resolved,   color: Colors.success,  bg: Colors.successSubtle },
          ].map((item) => (
            <View key={item.label} style={[styles.summaryCard, { backgroundColor: item.bg }]}>
              <Text style={[styles.summaryNum, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.summaryLabel, { color: item.color + 'CC' }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Filter chips */}
      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConcernCard concern={item} onPress={() => router.push(`/(app)/concerns/${item.id}`)} />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather name="check-circle" size={32} color={Colors.success} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === 'All' ? 'No concerns detected' : `No ${activeFilter.toLowerCase()} concerns`}
              </Text>
              <Text style={styles.emptySubtitle}>Your health metrics are within normal ranges</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold as any, color: Colors.text, flex: 1 },
  headerCount: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
  },
  headerCountText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.bold as any },

  summaryRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    gap: 2,
  },
  summaryNum: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold as any },
  summaryLabel: { fontSize: 10, fontWeight: FontWeights.semibold as any, textTransform: 'uppercase', letterSpacing: 0.3 },

  filterWrap: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  filterChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSizes.sm, color: Colors.textMuted, fontWeight: FontWeights.medium as any },
  filterTextActive: { color: '#fff', fontWeight: FontWeights.semibold as any },

  list: { padding: Spacing[4], gap: Spacing[3] },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardStripe: { width: 4 },
  cardInner: { flex: 1, padding: Spacing[4], gap: Spacing[2] },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2] },
  cardSevIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  cardBadges: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  urgentBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  urgentText: { fontSize: 9, color: '#fff', fontWeight: FontWeights.bold as any, letterSpacing: 0.5 },
  sevBadge: { paddingHorizontal: Spacing[2], paddingVertical: 3, borderRadius: BorderRadius.full },
  sevBadgeText: { fontSize: 11, fontWeight: FontWeights.semibold as any },

  cardDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  valueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  valueText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold as any },
  normalText: { fontSize: FontSizes.xs, color: Colors.textMuted },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing[1] },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'capitalize' },

  loader: { marginTop: Spacing[12] },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: Spacing[3] },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold as any, color: Colors.text },
  emptySubtitle: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center' },
});
