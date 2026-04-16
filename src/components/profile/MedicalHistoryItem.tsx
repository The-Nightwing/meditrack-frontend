/**
 * MedicalHistoryItem Component
 * Row showing condition name, date, status badge, edit/delete buttons
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { UserMedicalHistory } from '@/types';

interface MedicalHistoryItemProps {
  condition: UserMedicalHistory;
  onEdit: () => void;
  onDelete: () => void;
  style?: ViewStyle;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusInfo = (condition: UserMedicalHistory) => {
  const isResolved = !!condition.resolvedDate;
  return {
    status: isResolved ? 'Resolved' : 'Active',
    color: isResolved ? Colors.textMuted : Colors.warning,
    icon: isResolved ? 'checkmark-circle' : 'alert-circle',
  };
};

export const MedicalHistoryItem: React.FC<MedicalHistoryItemProps> = ({
  condition,
  onEdit,
  onDelete,
  style,
}) => {
  const statusInfo = getStatusInfo(condition);
  const diagnosedDate = formatDate(condition.diagnosedDate);
  const resolvedDate = condition.resolvedDate ? formatDate(condition.resolvedDate) : null;

  return (
    <View style={[styles.container, style]}>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textSection}>
          {/* Condition Name */}
          <View style={styles.nameRow}>
            <Ionicons
              name={statusInfo.icon as any}
              size={20}
              color={statusInfo.color}
            />
            <Text style={styles.conditionName} numberOfLines={1}>
              {condition.condition}
            </Text>
          </View>

          {/* Dates */}
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Diagnosed:</Text>
            <Text style={styles.dateValue}>{diagnosedDate}</Text>
            {resolvedDate && (
              <>
                <Text style={styles.dateLabel}>Resolved:</Text>
                <Text style={styles.dateValue}>{resolvedDate}</Text>
              </>
            )}
          </View>

          {/* Notes */}
          {condition.notes && (
            <Text style={styles.notes} numberOfLines={1}>
              {condition.notes}
            </Text>
          )}
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusInfo.color + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusInfo.color },
            ]}
          >
            {statusInfo.status}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEdit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="pencil"
            size={18}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="trash"
            size={18}
            color={Colors.danger}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    gap: Spacing[2],
    marginBottom: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flex: 1,
    gap: Spacing[2],
  },
  textSection: {
    gap: Spacing[2],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  conditionName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  dateSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing[1],
  },
  dateLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  dateValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  notes: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteButton: {
    borderColor: Colors.danger + '30',
    backgroundColor: Colors.danger + '05',
  },
});

export default MedicalHistoryItem;
