import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useMetricsStore } from '@/store/metricsStore';
import { Colors, getStatusColor } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';
import { MetricValue } from '@/types';
import { formatDate, formatValue } from '@/utils/formatting';

// ─── Range Bar ────────────────────────────────────────────────────────────────

function RangeBar({ value, normalMin, normalMax, unit, color }: {
  value: number; normalMin: number; normalMax: number; unit: string; color: string;
}) {
  const [barWidth, setBarWidth] = useState(0);
  const padding = Math.max((normalMax - normalMin) * 0.6, 1);
  const displayMin = normalMin - padding;
  const displayMax = normalMax + padding;
  const totalRange = displayMax - displayMin || 1;
  const clamped = Math.max(displayMin, Math.min(displayMax, value));
  const valuePct = (clamped - displayMin) / totalRange;
  const normalStartPct = (normalMin - displayMin) / totalRange;
  const normalWidthPct = (normalMax - normalMin) / totalRange;

  const direction = value > normalMax ? 'higher' : value < normalMin ? 'lower' : 'within';
  const directionLabel =
    direction === 'higher' ? 'Above normal range' :
    direction === 'lower'  ? 'Below normal range' : 'Within normal range';

  // Position of zone boundary labels relative to the track
  const minLabelLeft = barWidth > 0 ? normalStartPct * barWidth : null;
  const maxLabelLeft = barWidth > 0 ? (normalStartPct + normalWidthPct) * barWidth : null;

  return (
    <View style={rangeStyles.wrap}>
      <Text style={[rangeStyles.labelDir, { color }]}>{directionLabel}</Text>
      <View
        style={rangeStyles.track}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <View style={[rangeStyles.zone, rangeStyles.zoneDanger, { flex: normalStartPct, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />
        <View style={[rangeStyles.zone, rangeStyles.zoneNormal, { flex: normalWidthPct }]} />
        <View style={[rangeStyles.zone, rangeStyles.zoneDanger, { flex: 1 - normalStartPct - normalWidthPct, borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />
        {barWidth > 0 && (
          <View style={[rangeStyles.dot, { left: valuePct * barWidth - 8, backgroundColor: color }]} />
        )}
      </View>
      {/* Labels anchored to the actual normal zone boundaries, centered on the pin */}
      {minLabelLeft !== null && maxLabelLeft !== null && (
        <View style={rangeStyles.zoneLabelRow}>
          <View style={[rangeStyles.zoneLabelPin, { left: minLabelLeft, transform: [{ translateX: -12 }] }]}>
            <Text style={rangeStyles.zoneLabel}>{normalMin}</Text>
          </View>
          <View style={[rangeStyles.zoneLabelPin, { left: maxLabelLeft, transform: [{ translateX: -12 }] }]}>
            <Text style={rangeStyles.zoneLabel}>{normalMax}</Text>
          </View>
          <Text style={rangeStyles.zoneLabelUnit}>{unit}</Text>
        </View>
      )}
    </View>
  );
}

const rangeStyles = StyleSheet.create({
  wrap: { gap: Spacing[2] },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelMin: { fontSize: FontSizes.xs, color: Colors.textMuted, width: 60 },
  labelMax: { fontSize: FontSizes.xs, color: Colors.textMuted, width: 60, textAlign: 'right' },
  labelDir: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold as any, textAlign: 'center' },
  zoneLabelRow: { position: 'relative', height: 16 },
  zoneLabelPin: { position: 'absolute', top: 0 },
  zoneLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },
  zoneLabelUnit: { position: 'absolute', right: 0, top: 0, fontSize: FontSizes.xs, color: Colors.textMuted },
  track: { height: 10, flexDirection: 'row', borderRadius: 6, position: 'relative', overflow: 'visible' },
  zone: { height: 10 },
  zoneDanger: { backgroundColor: '#FECACA' },
  zoneNormal: { backgroundColor: '#BBF7D0' },
  dot: {
    position: 'absolute',
    top: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
});

// ─── Trend Line Chart ─────────────────────────────────────────────────────────

const PERIODS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
  { label: '1Y', value: 365 },
];

const CHART_H = 140;
const CPAD = { top: 18, bottom: 26, left: 4, right: 4 };

function TrendChart({ data, color, normalMin, normalMax }: {
  data: { val: number; date: string }[];
  color: string;
  normalMin?: number | null;
  normalMax?: number | null;
}) {
  const [width, setWidth] = useState(0);

  const chartH = CHART_H - CPAD.top - CPAD.bottom;
  const chartW = width - CPAD.left - CPAD.right;

  const vals = data.map(d => d.val);
  const dataMin = Math.min(...vals);
  const dataMax = Math.max(...vals);
  const dataRange = dataMax - dataMin || 1;
  const pad = Math.max(dataRange * 0.5, (dataMax || 10) * 0.03);

  // Show reference line only for the violated boundary
  const refMax = normalMax != null && dataMax >= normalMax * 0.7 ? normalMax : null;
  const refMin = normalMin != null && normalMin > 0 && dataMin <= normalMin * 1.3 ? normalMin : null;

  let viewMin = dataMin - pad;
  let viewMax = dataMax + pad;
  if (refMax != null) { viewMin = Math.min(viewMin, refMax - pad * 0.5); viewMax = Math.max(viewMax, refMax + pad * 0.3); }
  if (refMin != null) { viewMin = Math.min(viewMin, refMin - pad * 0.3); viewMax = Math.max(viewMax, refMin + pad * 0.5); }
  const totalRange = viewMax - viewMin || 1;

  const toX = (i: number) => CPAD.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
  const toY = (v: number) => CPAD.top + chartH - ((v - viewMin) / totalRange) * chartH;

  const fmtDate = (d: any) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    catch { return ''; }
  };

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.val) }));

  let linePath = '';
  let areaPath = '';
  if (points.length === 1) {
    linePath = `M ${CPAD.left} ${points[0].y} L ${CPAD.left + chartW} ${points[0].y}`;
  } else {
    linePath = `M ${points[0].x} ${points[0].y}`;
    areaPath = `M ${points[0].x} ${CPAD.top + chartH} L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const dx = (points[i].x - points[i - 1].x) * 0.45;
      const seg = `C ${points[i-1].x + dx} ${points[i-1].y}, ${points[i].x - dx} ${points[i].y}, ${points[i].x} ${points[i].y}`;
      linePath += ` ${seg}`;
      areaPath += ` ${seg}`;
    }
    areaPath += ` L ${points[points.length - 1].x} ${CPAD.top + chartH} Z`;
  }

  const refMaxY = refMax != null ? toY(refMax) : null;
  const refMinY = refMin != null ? toY(refMin) : null;

  return (
    <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ height: CHART_H }}>
      {width > 0 && (
        <Svg width={width} height={CHART_H}>
          <Defs>
            <LinearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="0.22" />
              <Stop offset="1" stopColor={color} stopOpacity="0.01" />
            </LinearGradient>
          </Defs>

          {/* Normal threshold reference lines */}
          {refMaxY != null && (
            <>
              <SvgLine x1={CPAD.left} y1={refMaxY} x2={CPAD.left + chartW} y2={refMaxY}
                stroke="#10B981" strokeWidth={1.5} strokeDasharray="5,4" opacity={0.55} />
              <SvgText x={CPAD.left + 4} y={refMaxY - 5} fontSize={9} fill="#10B981" opacity={0.85}>
                {`Normal ≤${normalMax}`}
              </SvgText>
            </>
          )}
          {refMinY != null && (
            <>
              <SvgLine x1={CPAD.left} y1={refMinY} x2={CPAD.left + chartW} y2={refMinY}
                stroke="#10B981" strokeWidth={1.5} strokeDasharray="5,4" opacity={0.55} />
              <SvgText x={CPAD.left + 4} y={refMinY - 5} fontSize={9} fill="#10B981" opacity={0.85}>
                {`Normal ≥${normalMin}`}
              </SvgText>
            </>
          )}

          {/* Area fill */}
          {areaPath ? <Path d={areaPath} fill="url(#trendGrad)" /> : null}

          {/* Line */}
          <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data point dots */}
          {points.map((p, i) => {
            const isLast = i === points.length - 1;
            return (
              <Circle key={i} cx={p.x} cy={p.y}
                r={isLast ? 5.5 : 3.5}
                fill={isLast ? color : Colors.background}
                stroke={color}
                strokeWidth={isLast ? 2 : 2}
              />
            );
          })}

          {/* X-axis date labels */}
          {data.length >= 2 && (
            <>
              <SvgText x={CPAD.left} y={CHART_H - 6} fontSize={10} fill={Colors.textMuted} textAnchor="start">
                {fmtDate(data[0].date)}
              </SvgText>
              <SvgText x={width - CPAD.right} y={CHART_H - 6} fontSize={10} fill={Colors.textMuted} textAnchor="end">
                {fmtDate(data[data.length - 1].date)}
              </SvgText>
            </>
          )}
        </Svg>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MetricDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { fetchMetricHistory, getDefinitionByCode } = useMetricsStore();
  const [history, setHistory] = useState<MetricValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);


  const loadData = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const data = await fetchMetricHistory(code, { startDate: startDate.toISOString(), limit: 100 });
    setHistory(data);
    setLoading(false);
  }, [code, period]);

  useEffect(() => { loadData(); }, [period]);

  const latest = history[0];
  const previous = history[1];

  const getNumericVal = (m: any) => {
    const v = m.numericValue ?? (typeof m.value === 'number' ? m.value : parseFloat(String(m.value ?? '')));
    return isNaN(v) ? null : v;
  };

  // Derive status from value vs stored reference range instead of trusting stored status field,
  // which may be stale or incorrectly set during AI extraction.
  const deriveStatus = (val: number | null, min: number | null, max: number | null, fallback: string) => {
    if (val === null || min === null || max === null) return fallback;
    if (val < min) return 'warning_low';
    if (val > max) return 'warning_high';
    return 'normal';
  };

  const latestAny = latest as any;
  const normalMin = latestAny?.normalMin ?? null;
  const normalMax = latestAny?.normalMax ?? null;
  const description = latestAny?.description ?? null;

  const latestNum = latest ? getNumericVal(latest) : null;
  const latestStatus = deriveStatus(latestNum, normalMin, normalMax, latestAny?.status ?? 'normal');
  const statusColor = latest ? getStatusColor(latestStatus) : Colors.textMuted;

  const chartData = useMemo(() =>
    history.slice().reverse()
      .map(m => {
        const mAny = m as any;
        const val = getNumericVal(m);
        return val !== null ? { val, date: mAny.dateMeasured ?? mAny.recordedAt ?? '' } : null;
      })
      .filter((d): d is { val: number; date: string } => d !== null),
    [history]
  );
  const numericValues = chartData.map(d => d.val);
  const prevNum = previous ? getNumericVal(previous) : null;
  const change = latestNum !== null && prevNum !== null && prevNum !== 0
    ? ((latestNum - prevNum) / prevNum) * 100 : null;

  const statusLabel =
    latestStatus === 'normal' ? 'Normal' :
    latestStatus === 'warning_low' ? 'Low' :
    latestStatus === 'warning_high' ? 'High' :
    latestStatus === 'critical_low' ? 'Critical Low' :
    latestStatus === 'critical_high' ? 'Critical High' : 'Out of Range';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {(latestAny?.metricName ?? code?.replace(/_/g, ' ') ?? 'Metric')}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={Colors.primary} />}
      >
        {/* ── Current Value Card ─────────────────────────── */}
        <View style={[styles.valueCard, { borderTopColor: statusColor }]}>
          <View style={styles.valueTop}>
            <View>
              <Text style={styles.valueLabel}>Latest Reading</Text>
              {latest ? (
                <Text style={[styles.valueBig, { color: statusColor }]}>
                  {formatValue(getNumericVal(latest) ?? 0, latestAny.unit)}
                </Text>
              ) : (
                <Text style={styles.noData}>No data</Text>
              )}
              {latest && (
                <Text style={styles.valueDate}>{formatDate(latestAny.dateMeasured ?? latestAny.recordedAt)}</Text>
              )}
            </View>
            {latest && (
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '18', borderColor: statusColor + '30' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            )}
          </View>

          {change !== null && (() => {
            // Color based on direction relative to normal range, not raw up/down
            const towardNormal =
              (latestStatus === 'warning_low' || latestStatus === 'critical_low') ? change > 0 :
              (latestStatus === 'warning_high' || latestStatus === 'critical_high') ? change < 0 :
              null;
            const changeColor = towardNormal === true ? Colors.success : towardNormal === false ? Colors.danger : Colors.textMuted;
            const changeBg = changeColor + '15';
            const changeIcon = change > 0 ? 'trending-up' : change < 0 ? 'trending-down' : 'minus';
            const changeLabel = towardNormal === true ? 'Improving' : towardNormal === false ? 'Worsening' : '';
            return (
              <View style={styles.changeRow}>
                <View style={[styles.changeIcon, { backgroundColor: changeBg }]}>
                  <Feather name={changeIcon} size={14} color={changeColor} />
                </View>
                <Text style={[styles.changeText, { color: changeColor }]}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}% from previous reading{changeLabel ? ` · ${changeLabel}` : ''}
                </Text>
              </View>
            );
          })()}

          {normalMin != null && normalMax != null && latestNum !== null && (
            <RangeBar
              value={latestNum}
              normalMin={normalMin}
              normalMax={normalMax}
              unit={latestAny?.unit ?? ''}
              color={statusColor}
            />
          )}
        </View>

        {/* ── About ─────────────────────────────────────── */}
        {!!description && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Feather name="info" size={14} color={Colors.accent} />
              <Text style={styles.infoTitle}>About this metric</Text>
            </View>
            <Text style={styles.infoText}>{description}</Text>
          </View>
        )}

        {/* ── Period Selector ────────────────────────────── */}
        <View style={styles.periodCard}>
          <Text style={styles.periodCardTitle}>Trend</Text>
          <View style={styles.periodRow}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.label}
                style={[styles.periodBtn, period === p.value && styles.periodBtnActive]}
                onPress={() => setPeriod(p.value)}
              >
                <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : chartData.length > 1 ? (
            <>
              <TrendChart
                data={chartData}
                color={statusColor}
                normalMin={normalMin}
                normalMax={normalMax}
              />
              <View style={styles.chartStats}>
                <View style={styles.chartStat}>
                  <Text style={styles.chartStatLabel}>Min</Text>
                  <Text style={[styles.chartStatValue, { color: Colors.success }]}>
                    {Math.min(...numericValues).toFixed(1)}
                  </Text>
                </View>
                <View style={[styles.chartStat, styles.chartStatCenter]}>
                  <Text style={styles.chartStatLabel}>Avg</Text>
                  <Text style={[styles.chartStatValue, { color: Colors.textSecondary }]}>
                    {(numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(1)}
                  </Text>
                </View>
                <View style={styles.chartStat}>
                  <Text style={[styles.chartStatLabel, { textAlign: 'right' }]}>Max</Text>
                  <Text style={[styles.chartStatValue, { color: Colors.danger, textAlign: 'right' }]}>
                    {Math.max(...numericValues).toFixed(1)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noChartState}>
              <Feather name="bar-chart-2" size={20} color={Colors.textMuted} />
              <Text style={styles.noChartText}>Not enough data for this period</Text>
            </View>
          )}
        </View>

        {/* ── History ───────────────────────────────────── */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Measurement History</Text>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="clock" size={24} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No history for this period</Text>
            </View>
          ) : (
            history.map((m, idx) => {
              const mAny = m as any;
              const color = getStatusColor(mAny.status ?? 'normal');
              const numVal = getNumericVal(m) ?? 0;
              const isLast = idx === history.length - 1;
              return (
                <View key={m.id} style={[styles.historyRow, isLast && styles.historyRowLast]}>
                  <View style={[styles.historyDot, { backgroundColor: color }]} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{formatDate(mAny.dateMeasured ?? mAny.recordedAt)}</Text>
                    {(mAny.labName || mAny.sourceType) && (
                      <Text style={styles.historySource}>
                        {mAny.labName ?? mAny.sourceType?.toLowerCase().replace(/_/g, ' ')}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.historyValue, { color }]}>{formatValue(numVal, mAny.unit)}</Text>
                </View>
              );
            })
          )}
        </View>

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
    textTransform: 'capitalize',
    marginHorizontal: Spacing[2],
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing[4], gap: Spacing[3] },

  // Value card
  valueCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    borderTopWidth: 4,
    gap: Spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  valueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  valueLabel: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing[1] },
  valueBig: { fontSize: 40, fontWeight: FontWeights.bold as any, lineHeight: 48 },
  noData: { fontSize: FontSizes.xl, color: Colors.textMuted },
  valueDate: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold as any },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  changeIcon: { width: 28, height: 28, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  changeText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium as any },

  // Info card
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  infoTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold as any, color: Colors.text },
  infoText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 21 },

  // Period / chart card
  periodCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    gap: Spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodCardTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 3,
    gap: 3,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  periodText: { fontSize: FontSizes.sm, color: Colors.textMuted, fontWeight: FontWeights.medium as any },
  periodTextActive: { color: '#fff', fontWeight: FontWeights.semibold as any },

  chartStats: { flexDirection: 'row', justifyContent: 'space-between' },
  chartStat: { flex: 1 },
  chartStatCenter: { alignItems: 'center' },
  chartStatLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginBottom: 2 },
  chartStatValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold as any },

  noChartState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], paddingVertical: Spacing[4] },
  noChartText: { fontSize: FontSizes.sm, color: Colors.textMuted },

  // History card
  historyCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text, marginBottom: Spacing[3] },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[3],
  },
  historyRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  historyDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: FontSizes.sm, color: Colors.text, fontWeight: FontWeights.medium as any },
  historySource: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  historyValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold as any },

  emptyState: { alignItems: 'center', paddingVertical: Spacing[6], gap: Spacing[2] },
  emptyText: { fontSize: FontSizes.sm, color: Colors.textMuted },
  loader: { marginVertical: Spacing[4] },
});
