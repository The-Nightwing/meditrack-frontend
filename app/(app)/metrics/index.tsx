import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, SectionList, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useMetricsStore } from '@/store/metricsStore';
import { Colors, getStatusColor } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';
import { formatValue } from '@/utils/formatting';
import { parseISO, isToday, isYesterday, format } from 'date-fns';

function getDateLabel(dateStr: string | Date): string {
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d, yyyy');
  } catch { return String(dateStr); }
}

function getDateKey(dateStr: string | Date): string {
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(d, 'yyyy-MM-dd');
  } catch { return String(dateStr); }
}

function StatusPill({ status }: { status: string }) {
  const color = getStatusColor(status);
  if (status === 'normal') return null;
  return (
    <View style={[pillStyles.wrap, { backgroundColor: color + '18' }]}>
      <Text style={[pillStyles.text, { color }]}>
        {status === 'critical_high' || status === 'critical_low' ? 'Critical' : 'Needs Attention'}
      </Text>
    </View>
  );
}
const pillStyles = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  text: { fontSize: 10, fontWeight: FontWeights.semibold as any },
});

function MetricRow({ metric, onPress }: { metric: any; onPress: () => void }) {
  const statusColor = getStatusColor(metric.status ?? 'normal');
  const numVal = metric.numericValue ?? metric.currentValue ?? (typeof metric.value === 'number' ? metric.value : parseFloat(String(metric.value ?? '')));

  return (
    <TouchableOpacity style={styles.metricRow} onPress={onPress} activeOpacity={0.72}>
      <View style={[styles.statusStripe, { backgroundColor: statusColor }]} />
      <View style={styles.metricContent}>
        <Text style={styles.metricName} numberOfLines={1}>
          {(metric.metricName ?? metric.metricCode ?? '').replace(/_/g, ' ')}
        </Text>
        {(metric.labName || metric.sourceType) && (
          <Text style={styles.metricSource}>
            {metric.labName ?? (metric.sourceType ?? '').toLowerCase().replace(/_/g, ' ')}
          </Text>
        )}
      </View>
      <View style={styles.metricRight}>
        <Text style={[styles.metricValue, { color: statusColor }]}>
          {!isNaN(numVal) ? formatValue(numVal, metric.unit) : metric.textValue ?? '—'}
        </Text>
        <StatusPill status={metric.status ?? 'normal'} />
      </View>
      <Feather name="chevron-right" size={15} color={Colors.neutral300} style={{ marginLeft: Spacing[2] }} />
    </TouchableOpacity>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  const isToday = title === 'Today';
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionDate, isToday && styles.sectionDateToday]}>{title}</Text>
      <View style={styles.sectionCountBadge}>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
    </View>
  );
}

export default function MetricsScreen() {
  const router = useRouter();
  const { recentMetrics, fetchRecentMetrics, isLoading } = useMetricsStore();
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(true);

  const loadData = useCallback(async () => {
    setFetching(true);
    await fetchRecentMetrics(100);
    setFetching(false);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const filtered = useMemo(() => {
    if (!search) return recentMetrics;
    const q = search.toLowerCase();
    return recentMetrics.filter((m: any) =>
      (m.metricName ?? m.metricCode ?? '').toLowerCase().includes(q)
    );
  }, [recentMetrics, search]);

  const sections = useMemo(() => {
    const groups = new Map<string, { label: string; data: any[] }>();
    for (const m of filtered) {
      const dateField = (m as any).dateMeasured ?? (m as any).recordedAt;
      const key = dateField ? getDateKey(dateField) : 'unknown';
      const label = dateField ? getDateLabel(dateField) : 'Unknown date';
      if (!groups.has(key)) groups.set(key, { label, data: [] });
      groups.get(key)!.data.push(m);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, { label, data }]) => ({ title: label, data }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metrics</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={15} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search metrics..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
              <Feather name="x" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {fetching ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : null}
      <SectionList
        sections={fetching ? [] : sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MetricRow
            metric={item}
            onPress={() => {
              const code = (item as any).metricCode;
              if (code) router.push({ pathname: '/(app)/metrics/[code]', params: { code } } as any);
            }}
          />
        )}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} count={section.data.length} />
        )}
        refreshControl={<RefreshControl refreshing={isLoading && !fetching} onRefresh={loadData} tintColor={Colors.primary} />}
        contentContainerStyle={sections.length === 0 ? styles.emptyContainer : styles.listContent}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          fetching ? null : isLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather name="activity" size={32} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No metrics yet</Text>
              <Text style={styles.emptySubtitle}>
                Upload a report to start tracking your health metrics
              </Text>
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
  searchWrap: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSizes.sm, color: Colors.text },
  searchClear: { padding: 4 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.surface,
  },
  sectionDate: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold as any, color: Colors.textSecondary },
  sectionDateToday: { color: Colors.primary },
  sectionCountBadge: {
    backgroundColor: Colors.neutral200,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCount: { fontSize: 11, color: Colors.textSecondary, fontWeight: FontWeights.semibold as any },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 14,
    paddingRight: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusStripe: {
    width: 3,
    alignSelf: 'stretch',
    marginRight: Spacing[3],
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  metricContent: { flex: 1 },
  metricName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium as any,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  metricSource: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  metricRight: { alignItems: 'flex-end', gap: 4 },
  metricValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold as any },

  listContent: { paddingBottom: Spacing[10] },
  emptyContainer: { flex: 1 },
  loader: { marginTop: Spacing[12] },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: Spacing[3], paddingHorizontal: Spacing[8] },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold as any, color: Colors.text },
  emptySubtitle: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
