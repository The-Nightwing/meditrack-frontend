import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { apiClient } from '@/api/client';
import { useMetricsStore } from '@/store/metricsStore';
import { useConcernsStore } from '@/store/concernsStore';
import { Colors, getStatusColor } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';
import { HealthReport, ExtractedMetric } from '@/types';
import { formatDate, formatFileSize } from '@/utils/formatting';

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string; bg: string }> = {
  completed:  { color: Colors.success,  icon: 'check-circle', label: 'Extraction Complete',  bg: Colors.successSubtle },
  partial:    { color: Colors.warning,  icon: 'alert-circle', label: 'Partial Extraction',    bg: Colors.warningSubtle },
  pending:    { color: Colors.textMuted,icon: 'clock',        label: 'Pending',               bg: Colors.surface },
  extracting: { color: Colors.accent,   icon: 'cpu',          label: 'Extracting...',         bg: Colors.accentSubtle },
  processing: { color: Colors.accent,   icon: 'cpu',          label: 'Processing...',         bg: Colors.accentSubtle },
  failed:     { color: Colors.danger,   icon: 'x-circle',     label: 'Extraction Failed',     bg: Colors.dangerSubtle },
  manual:     { color: Colors.info,     icon: 'edit',         label: 'Manual Entry',          bg: Colors.primarySubtle },
};

function MetricRow({ metric }: {
  metric: ExtractedMetric & { value: number; unit: string; status?: string; name?: string }
}) {
  const color = metric.status ? getStatusColor(metric.status) : Colors.textMuted;
  const confidence = metric.confidence ?? 100;
  const confColor = confidence >= 80 ? Colors.success : confidence >= 50 ? Colors.warning : Colors.danger;

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricLeft}>
        <View style={[styles.metricStatusDot, { backgroundColor: color }]} />
        <View style={styles.metricInfo}>
          <Text style={styles.metricName} numberOfLines={1}>
            {metric.name ?? metric.metricCode?.replace(/_/g, ' ')}
          </Text>
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceTrack}>
              <View style={[styles.confidenceFill, { width: `${confidence}%`, backgroundColor: confColor }]} />
            </View>
            <Text style={[styles.confidenceText, { color: confColor }]}>{confidence.toFixed(0)}%</Text>
          </View>
        </View>
      </View>
      <View style={styles.metricRight}>
        <Text style={[styles.metricValue, { color }]}>
          {metric.value} {metric.unit}
        </Text>
        {metric.status && metric.status !== 'normal' && (
          <View style={[styles.statusChip, { backgroundColor: color + '15' }]}>
            <Text style={[styles.statusChipText, { color }]}>
              {metric.status.replace(/_/g, ' ')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const fetchRecentMetrics = useMetricsStore((s) => s.fetchRecentMetrics);
  const { fetchConcernsSummary, fetchConcerns } = useConcernsStore();
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/reports/${id}`);
      if (res.data?.data) setReport(res.data.data);
    } catch {
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadReport(); fetchConcerns(); }, []);

  const retryExtraction = async () => {
    try {
      await apiClient.post(`/reports/${id}/reprocess`);
      Alert.alert('Retrying', 'Re-extraction started. Pull to refresh.');
      setTimeout(loadReport, 2000);
    } catch {
      Alert.alert('Error', 'Failed to retry extraction');
    }
  };

  const deleteReport = () => {
    Alert.alert(
      'Delete Report',
      'This will permanently delete the report and all associated metrics.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/reports/${id}`);
              await Promise.all([fetchRecentMetrics(6), fetchConcernsSummary(), fetchConcerns({ limit: 5 })]);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.centeredText}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Feather name="alert-circle" size={40} color={Colors.textMuted} />
          <Text style={styles.centeredText}>Report not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusKey = report.extractionStatus?.toLowerCase();
  const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pending;
  const metrics = (report.extractedMetrics ?? []) as any[];
  const isProcessing = ['extracting', 'processing', 'pending'].includes(statusKey);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Report Detail</Text>
        <TouchableOpacity onPress={deleteReport} style={[styles.navBtn, styles.navBtnDanger]}>
          <Feather name="trash-2" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReport} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Report Info Card ───────────────────────────── */}
        <View style={styles.infoCard}>
          <View style={styles.infoTop}>
            <View style={[styles.reportIcon, { backgroundColor: Colors.primarySubtle }]}>
              <Feather name="file-text" size={24} color={Colors.primary} />
            </View>
            <View style={styles.infoDetails}>
              <Text style={styles.reportTitle}>{report.title || report.reportType?.replace(/_/g, ' ')}</Text>
              <Text style={styles.reportMeta}>
                {formatDate(report.reportDate ?? report.createdAt)}
                {report.file ? ` · ${formatFileSize(report.file.fileSize)}` : ''}
              </Text>
            </View>
          </View>

          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg, borderColor: statusCfg.color + '30' }]}>
            {isProcessing ? (
              <ActivityIndicator size="small" color={statusCfg.color} />
            ) : (
              <Feather name={statusCfg.icon as any} size={16} color={statusCfg.color} />
            )}
            <Text style={[styles.statusBannerText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            {report.extractionConfidence != null && (
              <Text style={[styles.statusConf, { color: statusCfg.color }]}>
                · {(Number(report.extractionConfidence) * 100).toFixed(0)}% confidence
              </Text>
            )}
          </View>

          {isProcessing && (
            <Text style={styles.processingNote}>AI is analyzing your report. This may take a moment.</Text>
          )}

          {report.extractionStatus === 'failed' && (
            <TouchableOpacity style={styles.retryBtn} onPress={retryExtraction} activeOpacity={0.85}>
              <Feather name="refresh-cw" size={15} color="#fff" />
              <Text style={styles.retryBtnText}>Retry Extraction</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Extracted Metrics ──────────────────────────── */}
        {metrics.length > 0 && (
          <View style={styles.metricsCard}>
            <View style={styles.metricsHeader}>
              <Text style={styles.sectionTitle}>Extracted Metrics</Text>
              <View style={styles.metricsCountBadge}>
                <Text style={styles.metricsCountText}>{metrics.length}</Text>
              </View>
            </View>
            {metrics.map((metric, idx) => (
              <MetricRow key={idx} metric={metric} />
            ))}
          </View>
        )}

        {/* ── Notes ─────────────────────────────────────── */}
        {report.description && (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{report.description}</Text>
          </View>
        )}

        <View style={{ height: Spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDanger: { backgroundColor: Colors.dangerSubtle },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as any,
    color: Colors.text,
    marginHorizontal: Spacing[2],
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing[4], gap: Spacing[3] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing[3] },
  centeredText: { fontSize: FontSizes.base, color: Colors.textMuted },
  backLink: { fontSize: FontSizes.sm, color: Colors.primary },

  // Info card
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    gap: Spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  infoTop: { flexDirection: 'row', gap: Spacing[3], alignItems: 'flex-start' },
  reportIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoDetails: { flex: 1, justifyContent: 'center' },
  reportTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold as any, color: Colors.text, textTransform: 'capitalize' },
  reportMeta: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 3 },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[3],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statusBannerText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold as any, flex: 1 },
  statusConf: { fontSize: FontSizes.xs },
  processingNote: { fontSize: FontSizes.xs, color: Colors.textMuted, fontStyle: 'italic' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  retryBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: FontWeights.semibold as any },

  // Metrics section
  metricsCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3] },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text, flex: 1 },
  metricsCountBadge: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
  },
  metricsCountText: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.bold as any },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metricLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  metricStatusDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  metricInfo: { flex: 1, gap: 4 },
  metricName: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium as any, color: Colors.text, textTransform: 'capitalize' },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  confidenceTrack: { width: 56, height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: 2 },
  confidenceText: { fontSize: 11, fontWeight: FontWeights.medium as any },
  metricRight: { alignItems: 'flex-end', gap: 4 },
  metricValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold as any },
  statusChip: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  statusChipText: { fontSize: 10, fontWeight: FontWeights.medium as any, textTransform: 'capitalize' },

  notesCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  notesText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22 },
});
