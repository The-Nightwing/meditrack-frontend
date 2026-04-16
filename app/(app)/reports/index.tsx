import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '@/api/client';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';
import { HealthReport } from '@/types';
import { formatDate, formatFileSize } from '@/utils/formatting';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending:    { color: Colors.textMuted,  label: 'Pending' },
  extracting: { color: Colors.accent,     label: 'Extracting' },
  processing: { color: Colors.accent,     label: 'Processing' },
  completed:  { color: Colors.success,    label: 'Complete' },
  partial:    { color: Colors.warning,    label: 'Partial' },
  failed:     { color: Colors.danger,     label: 'Failed' },
  manual:     { color: Colors.info,       label: 'Manual' },
};

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  blood_test:  { icon: 'droplet',    color: Colors.danger },
  BLOOD_TEST:  { icon: 'droplet',    color: Colors.danger },
  lab_result:  { icon: 'thermometer', color: Colors.accent },
  imaging:     { icon: 'image',       color: Colors.critical },
  IMAGING:     { icon: 'image',       color: Colors.critical },
  prescription:{ icon: 'package',     color: Colors.success },
  ECG:         { icon: 'activity',    color: Colors.primary },
  URINE_TEST:  { icon: 'droplet',     color: Colors.warning },
  other:       { icon: 'file-text',   color: Colors.textSecondary },
  OTHER:       { icon: 'file-text',   color: Colors.textSecondary },
};

function ReportCard({ report, onPress }: { report: HealthReport; onPress: () => void }) {
  const statusKey = report.extractionStatus?.toLowerCase();
  const status = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pending;
  const typeCfg = TYPE_CONFIG[report.reportType] ?? TYPE_CONFIG.other;
  const isProcessing = ['extracting', 'processing', 'pending'].includes(statusKey);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.78}>
      <View style={[styles.cardIcon, { backgroundColor: typeCfg.color + '15' }]}>
        <Feather name={typeCfg.icon as any} size={20} color={typeCfg.color} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {report.title || report.reportType?.replace(/_/g, ' ')}
        </Text>
        <Text style={styles.cardDate}>{formatDate(report.reportDate || report.createdAt)}</Text>
        {report.extractedMetrics?.length > 0 && (
          <Text style={styles.cardMetrics}>{report.extractedMetrics.length} metrics extracted</Text>
        )}
      </View>

      <View style={styles.cardRight}>
        <View style={[styles.statusPill, { backgroundColor: status.color + '15' }]}>
          {isProcessing && <ActivityIndicator size="small" color={status.color} style={{ marginRight: 4 }} />}
          <Text style={[styles.statusPillText, { color: status.color }]}>{status.label}</Text>
        </View>
        {report.file && (
          <Text style={styles.cardSize}>{formatFileSize(report.file.fileSize)}</Text>
        )}
      </View>

      <Feather name="chevron-right" size={16} color={Colors.neutral300} style={{ marginLeft: Spacing[1] }} />
    </TouchableOpacity>
  );
}

export default function ReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await apiClient.get('/reports');
      if (res.data?.data) {
        setReports(Array.isArray(res.data.data) ? res.data.data : res.data.data.data ?? []);
      }
    } catch (e) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  const uploadFile = async (type: 'document' | 'image') => {
    setShowUploadMenu(false);
    try {
      let uri = '', name = '', mimeType = '';

      if (type === 'document') {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
        if (result.canceled || !result.assets?.[0]) return;
        uri = result.assets[0].uri;
        name = result.assets[0].name;
        mimeType = result.assets[0].mimeType ?? 'application/pdf';
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
        if (result.canceled || !result.assets?.[0]) return;
        uri = result.assets[0].uri;
        name = uri.split('/').pop() ?? 'image.jpg';
        mimeType = result.assets[0].mimeType ?? 'image/jpeg';
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('file', { uri, name, type: mimeType } as any);
      formData.append('reportType', type === 'document' ? 'BLOOD_TEST' : 'OTHER');
      formData.append('reportDate', new Date().toISOString());
      await apiClient.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Uploaded!', 'AI extraction will begin shortly.');
      await loadReports();
    } catch (e: any) {
      Alert.alert('Upload failed', e?.response?.data?.error?.message ?? 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const processed = reports.filter((r) => r.extractionStatus?.toLowerCase() === 'completed').length;
  const pending = reports.filter((r) => ['extracting', 'processing', 'pending'].includes(r.extractionStatus?.toLowerCase())).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={() => setShowUploadMenu(!showUploadMenu)}
          disabled={uploading}
          activeOpacity={0.8}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Feather name="upload" size={16} color={Colors.primary} />
              <Text style={styles.uploadBtnText}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      {reports.length > 0 && (
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: Colors.success }]}>{processed}</Text>
            <Text style={styles.statLabel}>Processed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: Colors.accent }]}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      )}

      {/* Upload dropdown */}
      {showUploadMenu && (
        <View style={styles.uploadMenu}>
          <TouchableOpacity style={styles.uploadOption} onPress={() => uploadFile('document')}>
            <View style={[styles.uploadOptionIcon, { backgroundColor: Colors.dangerSubtle }]}>
              <Feather name="file-text" size={16} color={Colors.danger} />
            </View>
            <View>
              <Text style={styles.uploadOptionTitle}>PDF Report</Text>
              <Text style={styles.uploadOptionDesc}>Blood test, lab result, etc.</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.uploadOption} onPress={() => uploadFile('image')}>
            <View style={[styles.uploadOptionIcon, { backgroundColor: Colors.primarySubtle }]}>
              <Feather name="camera" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.uploadOptionTitle}>Photo / Image</Text>
              <Text style={styles.uploadOptionDesc}>Photo of a physical report</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportCard report={item} onPress={() => router.push(`/(app)/reports/${item.id}`)} />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReports} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : loadError ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { borderColor: Colors.danger + '40' }]}>
                <Feather name="wifi-off" size={32} color={Colors.danger} />
              </View>
              <Text style={styles.emptyTitle}>Could not load reports</Text>
              <Text style={styles.emptySubtitle}>
                Unable to connect to the server. Check your connection and try again.
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: Colors.textSecondary }]}
                onPress={loadReports}
                activeOpacity={0.85}
              >
                <Feather name="refresh-cw" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather name="file-text" size={32} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptySubtitle}>
                Upload a blood test or lab report to get AI-powered health insights
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => setShowUploadMenu(true)}
                activeOpacity={0.85}
              >
                <Feather name="upload" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Upload Report</Text>
              </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold as any, color: Colors.text },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primarySubtle,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold as any },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[3],
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold as any, color: Colors.text },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 1 },
  statDivider: { width: 1, backgroundColor: Colors.border, alignSelf: 'stretch' },

  uploadMenu: {
    position: 'absolute',
    top: 72,
    right: Spacing[5],
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 100,
    minWidth: 220,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  uploadOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], padding: Spacing[4] },
  uploadOptionIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  uploadOptionTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold as any, color: Colors.text },
  uploadOptionDesc: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: Colors.border },

  list: { paddingVertical: Spacing[3], paddingHorizontal: Spacing[4], gap: Spacing[2] },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  cardDate: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  cardMetrics: { fontSize: FontSizes.xs, color: Colors.accent, marginTop: 2, fontWeight: FontWeights.medium as any },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillText: { fontSize: 11, fontWeight: FontWeights.semibold as any },
  cardSize: { fontSize: FontSizes.xs, color: Colors.textMuted },

  loader: { marginTop: Spacing[12] },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing[8], gap: Spacing[3] },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold as any, color: Colors.text },
  emptySubtitle: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    marginTop: Spacing[2],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: { color: '#fff', fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any },
});
