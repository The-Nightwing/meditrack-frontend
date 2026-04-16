import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useConcernsStore } from '@/store/concernsStore';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';
import { HealthConcern } from '@/types';
import { formatDate, formatValue } from '@/utils/formatting';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  critical: { color: Colors.danger,       bg: Colors.dangerSubtle,   label: 'See a Doctor',  icon: 'alert-octagon' },
  high:     { color: Colors.warning,      bg: Colors.warningSubtle,  label: 'Watch Closely', icon: 'alert-triangle' },
  medium:   { color: Colors.warningLight, bg: Colors.warningSubtle,  label: 'Watch Closely', icon: 'alert-circle' },
  low:      { color: Colors.success,      bg: Colors.successSubtle,  label: 'Heads Up',      icon: 'info' },
};

export default function ConcernDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getConcernById, acknowledgeConcern, resolveConcern, monitorConcern } = useConcernsStore();
  const [concern, setConcern] = useState<HealthConcern | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string | null>(null);

  const loadConcern = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await getConcernById(id);
    setConcern(data);
    if (data?.aiAnalysis) setInsights(data.aiAnalysis);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadConcern(); }, []);

  const handleStatusChange = (action: 'acknowledge' | 'monitor' | 'resolve') => {
    const titles = { acknowledge: 'Acknowledge', monitor: 'Set to Monitoring', resolve: 'Resolve Concern' };
    Alert.alert(titles[action], 'Are you sure you want to update this concern?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          if (action === 'acknowledge') await acknowledgeConcern(id!);
          else if (action === 'monitor') await monitorConcern(id!);
          else await resolveConcern(id!);
          await loadConcern();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.centeredText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!concern) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Feather name="alert-circle" size={40} color={Colors.textMuted} />
          <Text style={styles.centeredText}>Concern not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sev = SEVERITY_CONFIG[concern.severity] ?? SEVERITY_CONFIG.low;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Concern Detail</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadConcern} tintColor={Colors.primary} />}
      >
        {/* ── Hero Card ──────────────────────────────────── */}
        <View style={[styles.heroCard, { borderTopColor: sev.color }]}>
          <View style={styles.heroTop}>
            <View style={[styles.sevIconWrap, { backgroundColor: sev.bg }]}>
              <Feather name={sev.icon as any} size={22} color={sev.color} />
            </View>
            <View style={[styles.sevBadge, { backgroundColor: sev.bg, borderColor: sev.color + '30' }]}>
              <Text style={[styles.sevBadgeText, { color: sev.color }]}>{sev.label} Severity</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{concern.title}</Text>
          <Text style={styles.heroDesc}>{concern.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Feather name="clock" size={12} color={Colors.textMuted} />
              <Text style={styles.metaText}>Status: <Text style={styles.metaBold}>{concern.status}</Text></Text>
            </View>
            {concern.acknowledgedAt && (
              <View style={styles.metaChip}>
                <Feather name="check" size={12} color={Colors.textMuted} />
                <Text style={styles.metaText}>Acknowledged {formatDate(concern.acknowledgedAt)}</Text>
              </View>
            )}
          </View>

          {concern.status !== 'resolved' && (
            <View style={styles.docWarning}>
              <Feather name="alert-triangle" size={13} color={Colors.warning} />
              <Text style={styles.docWarningText}>Consult your doctor before making medical decisions</Text>
            </View>
          )}
        </View>

        {/* ── AI Assessment ─────────────────────────────── */}
        {(concern.aiExplanation || concern.aiNextStep) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What This Means</Text>
            <View style={[styles.insightsCard, { borderColor: sev.color + '30' }]}>
              <View style={styles.insightsHeader}>
                <View style={[styles.insightsIconWrap, { backgroundColor: sev.bg }]}>
                  <Feather name={sev.icon as any} size={14} color={sev.color} />
                </View>
                <Text style={[styles.insightsHeaderText, { color: sev.color }]}>{sev.label}</Text>
              </View>
              {concern.aiExplanation && (
                <Text style={styles.insightsText}>{concern.aiExplanation}</Text>
              )}
              {concern.aiNextStep && (
                <View style={styles.nextStepRow}>
                  <Feather name="arrow-right-circle" size={14} color={Colors.primary} />
                  <Text style={styles.nextStepText}>{concern.aiNextStep}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Related Metrics ────────────────────────────── */}
        {concern.relatedMetrics?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Metrics</Text>
            <View style={styles.metricsGrid}>
              {concern.relatedMetrics.map((m, idx) => (
                <View key={idx} style={styles.metricChip}>
                  <Text style={styles.metricChipCode}>{m.metricCode.replace(/_/g, ' ')}</Text>
                  <Text style={styles.metricChipVal}>{formatValue(m.value, m.unit)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── AI Insights ────────────────────────────────── */}
        {!!insights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Health Insights</Text>
            <View style={styles.insightsCard}>
              <View style={styles.insightsHeader}>
                <View style={styles.insightsIconWrap}>
                  <Feather name="cpu" size={14} color={Colors.primary} />
                </View>
                <Text style={styles.insightsHeaderText}>AI Analysis</Text>
              </View>
              <Text style={styles.insightsText}>{insights}</Text>
            </View>
          </View>
        )}

        {/* ── Recommendations ────────────────────────────── */}
        {concern.recommendations && concern.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recsCard}>
              {concern.recommendations.map((rec, idx) => (
                <View key={idx} style={[styles.recRow, idx === concern.recommendations.length - 1 && styles.recRowLast]}>
                  <View style={styles.recNumber}>
                    <Text style={styles.recNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Status Actions ─────────────────────────────── */}
        {concern.status !== 'resolved' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.actionsRow}>
              {concern.status !== 'acknowledged' && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusChange('acknowledge')} activeOpacity={0.8}>
                  <Feather name="check" size={15} color={Colors.primary} />
                  <Text style={styles.actionBtnText}>Acknowledge</Text>
                </TouchableOpacity>
              )}
              {concern.status !== 'monitoring' && (
                <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.accent + '40' }]} onPress={() => handleStatusChange('monitor')} activeOpacity={0.8}>
                  <Feather name="eye" size={15} color={Colors.accent} />
                  <Text style={[styles.actionBtnText, { color: Colors.accent }]}>Monitor</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.success + '40' }]} onPress={() => handleStatusChange('resolve')} activeOpacity={0.8}>
                <Feather name="check-circle" size={15} color={Colors.success} />
                <Text style={[styles.actionBtnText, { color: Colors.success }]}>Resolve</Text>
              </TouchableOpacity>
            </View>
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
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as any,
    color: Colors.text,
    marginHorizontal: Spacing[2],
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing[4] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing[3] },
  centeredText: { fontSize: FontSizes.base, color: Colors.textMuted },
  backLink: { fontSize: FontSizes.sm, color: Colors.primary },

  // Hero card
  heroCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    borderTopWidth: 4,
    marginBottom: Spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: Spacing[3],
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sevIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sevBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  sevBadgeText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold as any },
  heroTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold as any, color: Colors.text },
  heroDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22 },
  metaRow: { gap: Spacing[2] },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  metaText: { fontSize: FontSizes.xs, color: Colors.textMuted },
  metaBold: { fontWeight: FontWeights.semibold as any, color: Colors.text },
  docWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.warningSubtle,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  docWarningText: { fontSize: FontSizes.xs, color: Colors.warning, flex: 1, lineHeight: 18 },

  // Sections
  section: { marginBottom: Spacing[4] },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold as any,
    color: Colors.text,
    marginBottom: Spacing[3],
  },

  // Related metrics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  metricChip: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 110,
    gap: 3,
  },
  metricChipCode: { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  metricChipVal: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },

  // AI Insights
  insightsCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.primary + '25',
    gap: Spacing[3],
  },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  insightsIconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsHeaderText: { flex: 1, fontSize: FontSizes.sm, fontWeight: FontWeights.semibold as any, color: Colors.primary },
  insightsText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22 },
  nextStepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingTop: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.border },
  nextStepText: { flex: 1, fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold as any },

  // Recommendations
  recsCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  recNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  recNumberText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: FontWeights.bold as any },
  recText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 21 },

  // Status actions
  actionsRow: { flexDirection: 'row', gap: Spacing[2], flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.background,
  },
  actionBtnText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold as any },
});
