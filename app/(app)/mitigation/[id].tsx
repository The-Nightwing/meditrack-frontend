import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { apiGet, apiPut } from '@/api/client';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';
import { MitigationPlan } from '@/types';

const CATEGORY_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  diet:       { color: Colors.success, icon: 'coffee', label: 'Diet' },
  exercise:   { color: Colors.primary, icon: 'activity', label: 'Exercise' },
  lifestyle:  { color: Colors.info, icon: 'sun', label: 'Lifestyle' },
  medication: { color: Colors.danger, icon: 'package', label: 'Medication' },
  checkup:    { color: Colors.warning, icon: 'calendar', label: 'Checkup' },
  monitoring: { color: Colors.critical, icon: 'monitor', label: 'Monitoring' },
};

export default function MitigationPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<MitigationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: MitigationPlan }>(`/mitigation-plans/${id}`);
      if (res.data) setPlan(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadPlan(); }, []);

  const toggleStep = async (stepId: string, stepOrder: number, currentCompleted: boolean) => {
    setUpdatingStep(stepId);
    try {
      await apiPut(`/mitigation-plans/${id}/steps/${stepOrder}`, {
        isCompleted: !currentCompleted,
      });
      await loadPlan();
    } catch (e) {
      Alert.alert('Error', 'Failed to update step');
    } finally {
      setUpdatingStep(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <Feather name="alert-circle" size={40} color={Colors.textMuted} />
          <Text style={styles.loadingText}>Plan not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = plan.steps.filter((s) => !!s.completedAt).length;
  const totalSteps = plan.steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const groupedSteps: Record<string, typeof plan.steps> = {};
  plan.steps.forEach((step) => {
    const cat = (step as any).category ?? 'other';
    if (!groupedSteps[cat]) groupedSteps[cat] = [];
    groupedSteps[cat].push(step);
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Mitigation Plan</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPlan} tintColor={Colors.primary} />}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.aiChip}>
              <Feather name="zap" size={12} color={Colors.primary} />
              <Text style={styles.aiChipText}>AI Generated</Text>
            </View>
            {plan.requiresDoctor && (
              <View style={styles.docChip}>
                <Feather name="activity" size={12} color={Colors.danger} />
                <Text style={styles.docChipText}>Doctor Advised</Text>
              </View>
            )}
          </View>
          <Text style={styles.planTitle}>{plan.title}</Text>
          {plan.summary && (
            <Text style={styles.planSummary}>{plan.summary}</Text>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressSub}>{completedCount} of {totalSteps} steps completed</Text>

          {progress === 100 && (
            <View style={styles.completedBanner}>
              <Feather name="award" size={20} color={Colors.success} />
              <Text style={styles.completedText}>Plan completed! Great job!</Text>
            </View>
          )}
        </View>

        {/* Steps by Category */}
        {Object.entries(groupedSteps).map(([category, steps]) => {
          const catConfig = CATEGORY_CONFIG[category] ?? { color: Colors.textMuted, icon: 'list', label: category };
          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: catConfig.color + '15' }]}>
                  <Feather name={catConfig.icon as any} size={16} color={catConfig.color} />
                </View>
                <Text style={[styles.categoryTitle, { color: catConfig.color }]}>{catConfig.label}</Text>
                <Text style={styles.categoryCount}>{steps.filter((s) => !!s.completedAt).length}/{steps.length}</Text>
              </View>

              {steps.map((step) => {
                const isCompleted = !!step.completedAt;
                const isUpdating = updatingStep === step.id;
                return (
                  <TouchableOpacity
                    key={step.id}
                    style={[styles.stepCard, isCompleted && styles.stepCardDone]}
                    onPress={() => toggleStep(step.id, step.order, isCompleted)}
                    activeOpacity={0.8}
                    disabled={isUpdating}
                  >
                    <View style={styles.stepLeft}>
                      <View style={[styles.checkbox, isCompleted && styles.checkboxDone]}>
                        {isUpdating ? (
                          <ActivityIndicator size="small" color={Colors.background} />
                        ) : isCompleted ? (
                          <Feather name="check" size={14} color={Colors.background} />
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, isCompleted && styles.stepTitleDone]} numberOfLines={2}>
                        {step.title}
                      </Text>
                      {step.description && (
                        <Text style={[styles.stepDesc, isCompleted && styles.stepDescDone]} numberOfLines={3}>
                          {step.description}
                        </Text>
                      )}
                      {step.expectedOutcome && (
                        <View style={styles.outcomeRow}>
                          <Feather name="target" size={12} color={Colors.success} />
                          <Text style={styles.outcomeText} numberOfLines={1}>{step.expectedOutcome}</Text>
                        </View>
                      )}
                      {step.notes && (
                        <Text style={styles.stepNotes} numberOfLines={1}>Note: {step.notes}</Text>
                      )}
                    </View>
                    {!isCompleted && !isUpdating && (
                      <Feather name="circle" size={20} color={Colors.border} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* Dietary Suggestions */}
        {plan.dietarySuggestions && (plan.dietarySuggestions as any[]).length > 0 && (
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionTitle}>
              <Feather name="coffee" size={15} color={Colors.success} /> Dietary Tips
            </Text>
            {(plan.dietarySuggestions as any[]).map((item: string, idx: number) => (
              <View key={idx} style={styles.suggestionItem}>
                <View style={[styles.recBullet, { backgroundColor: Colors.success }]}>
                  <Text style={styles.recBulletText}>{idx + 1}</Text>
                </View>
                <Text style={styles.suggestionText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Exercise Suggestions */}
        {plan.exerciseSuggestions && (plan.exerciseSuggestions as any[]).length > 0 && (
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionTitle}>
              <Feather name="activity" size={15} color={Colors.primary} /> Exercise Tips
            </Text>
            {(plan.exerciseSuggestions as any[]).map((item: string, idx: number) => (
              <View key={idx} style={styles.suggestionItem}>
                <View style={[styles.recBullet, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.recBulletText}>{idx + 1}</Text>
                </View>
                <Text style={styles.suggestionText}>{item}</Text>
              </View>
            ))}
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
  backBtn: { padding: Spacing[1] },
  navTitle: { flex: 1, textAlign: 'center', fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing[4], gap: Spacing[4] },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing[3] },
  loadingText: { fontSize: FontSizes.base, color: Colors.textMuted },
  backLink: { fontSize: FontSizes.sm, color: Colors.primary },
  headerCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    gap: Spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTop: { flexDirection: 'row', gap: Spacing[2] },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  aiChipText: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.medium as any },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    backgroundColor: Colors.danger + '12',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  docChipText: { fontSize: FontSizes.xs, color: Colors.danger, fontWeight: FontWeights.medium as any },
  planTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold as any, color: Colors.text },
  planSummary: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22 },
  progressCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    gap: Spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  progressPercent: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold as any, color: Colors.primary },
  progressBar: { height: 10, backgroundColor: Colors.border, borderRadius: BorderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: BorderRadius.full },
  progressSub: { fontSize: FontSizes.sm, color: Colors.textMuted },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.success + '12',
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
  },
  completedText: { fontSize: FontSizes.sm, color: Colors.success, fontWeight: FontWeights.semibold as any },
  categorySection: { gap: Spacing[2] },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[1] },
  categoryIcon: { width: 32, height: 32, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  categoryTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, flex: 1 },
  categoryCount: { fontSize: FontSizes.xs, color: Colors.textMuted },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    gap: Spacing[3],
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepCardDone: { backgroundColor: Colors.success + '08', borderColor: Colors.success + '40' },
  stepLeft: { paddingTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepContent: { flex: 1, gap: Spacing[1] },
  stepTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  stepTitleDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  stepDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  stepDescDone: { color: Colors.textMuted },
  outcomeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  outcomeText: { fontSize: FontSizes.xs, color: Colors.success, flex: 1 },
  stepNotes: { fontSize: FontSizes.xs, color: Colors.textMuted, fontStyle: 'italic' },
  suggestionSection: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    gap: Spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  suggestionTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  suggestionItem: { flexDirection: 'row', gap: Spacing[3], alignItems: 'flex-start' },
  recBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  recBulletText: { color: Colors.background, fontSize: 10, fontWeight: FontWeights.bold as any },
  suggestionText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
