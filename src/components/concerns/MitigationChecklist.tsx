/**
 * MitigationChecklist Component
 * Scrollable checklist of plan steps with checkboxes, categories, frequency tags
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { MitigationPlanStep } from '@/types';

interface MitigationChecklistProps {
  steps: MitigationPlanStep[];
  onToggleStep: (stepNumber: number) => void;
  planType: string;
  style?: ViewStyle;
}

const getCategoryColor = (order: number): string => {
  const colors = [
    Colors.primary,
    Colors.success,
    Colors.warning,
    Colors.info,
    Colors.danger,
  ];
  return colors[order % colors.length];
};

const getCategoryLabel = (order: number): string => {
  const labels = ['Step', 'Phase', 'Stage', 'Part', 'Part'];
  return `${labels[order % labels.length]} ${order + 1}`;
};

export const MitigationChecklist: React.FC<MitigationChecklistProps> = ({
  steps,
  onToggleStep,
  planType,
  style,
}) => {
  if (steps.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.emptyText}>No steps in this plan</Text>
      </View>
    );
  }

  const completedCount = steps.filter((s) => s.completedAt).length;

  return (
    <View style={[styles.container, style]}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View>
          <Text style={styles.planType}>{planType} Plan</Text>
          <Text style={styles.progressText}>
            {completedCount} of {steps.length} completed
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(completedCount / steps.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Steps List */}
      <ScrollView
        scrollEnabled={steps.length > 5}
        nestedScrollEnabled={true}
        style={styles.scrollContainer}
      >
        {steps.map((step, index) => {
          const isCompleted = !!step.completedAt;
          const categoryColor = getCategoryColor(index);
          const categoryLabel = getCategoryLabel(index);

          return (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.stepItem,
                isCompleted && styles.stepItemCompleted,
              ]}
              onPress={() => onToggleStep(step.order)}
              activeOpacity={0.7}
            >
              {/* Checkbox */}
              <View
                style={[
                  styles.checkbox,
                  isCompleted && {
                    backgroundColor: Colors.success,
                    borderColor: Colors.success,
                  },
                ]}
              >
                {isCompleted && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={Colors.background}
                  />
                )}
              </View>

              {/* Content */}
              <View style={styles.content}>
                {/* Category */}
                <View style={styles.categoryRow}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: categoryColor + '20' },
                    ]}
                  >
                    <Text style={[styles.categoryLabel, { color: categoryColor }]}>
                      {categoryLabel}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text
                  style={[
                    styles.stepTitle,
                    isCompleted && styles.stepTitleCompleted,
                  ]}
                >
                  {step.title}
                </Text>

                {/* Description */}
                {step.description && (
                  <Text
                    style={[
                      styles.stepDescription,
                      isCompleted && styles.stepDescriptionCompleted,
                    ]}
                    numberOfLines={2}
                  >
                    {step.description}
                  </Text>
                )}

                {/* Expected Outcome */}
                {step.expectedOutcome && (
                  <View style={styles.outcomeSection}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color={Colors.success}
                      style={styles.outcomeIcon}
                    />
                    <Text style={styles.outcomeText} numberOfLines={1}>
                      {step.expectedOutcome}
                    </Text>
                  </View>
                )}

                {/* Notes */}
                {step.notes && (
                  <Text
                    style={styles.notesText}
                    numberOfLines={1}
                  >
                    {step.notes}
                  </Text>
                )}
              </View>

              {/* Right Arrow */}
              {!isCompleted && (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textMuted}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing[3],
  },
  progressHeader: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  planType: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  progressText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
  },
  scrollContainer: {
    marginHorizontal: -Spacing[3],
    paddingHorizontal: Spacing[3],
    maxHeight: 500,
  },
  stepItem: {
    flexDirection: 'row',
    gap: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    marginBottom: Spacing[2],
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  stepItemCompleted: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[1],
  },
  content: {
    flex: 1,
    gap: Spacing[2],
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
  categoryBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  categoryLabel: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  stepTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  stepTitleCompleted: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stepDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  stepDescriptionCompleted: {
    color: Colors.textMuted,
  },
  outcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  outcomeIcon: {
    marginTop: 1,
  },
  outcomeText: {
    ...Typography.caption,
    color: Colors.success,
    flex: 1,
  },
  notesText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});

export default MitigationChecklist;
