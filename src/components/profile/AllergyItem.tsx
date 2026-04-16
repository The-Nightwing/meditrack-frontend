/**
 * AllergyItem Component
 * Row showing allergen name, type, severity badge, edit/delete buttons
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
import { UserAllergy } from '@/types';

interface AllergyItemProps {
  allergy: UserAllergy;
  onEdit: () => void;
  onDelete: () => void;
  style?: ViewStyle;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'severe':
      return Colors.danger;
    case 'moderate':
      return Colors.warning;
    case 'mild':
      return Colors.statusNormal;
    default:
      return Colors.textMuted;
  }
};

const getSeverityLabel = (severity: string) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

export const AllergyItem: React.FC<AllergyItemProps> = ({
  allergy,
  onEdit,
  onDelete,
  style,
}) => {
  const severityColor = getSeverityColor(allergy.severity);

  return (
    <View style={[styles.container, style]}>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.nameSection}>
          <Ionicons
            name="alert-circle"
            size={20}
            color={severityColor}
          />
          <View style={styles.textContainer}>
            <Text style={styles.allergyName} numberOfLines={1}>
              {allergy.name}
            </Text>
            {allergy.reaction && (
              <Text style={styles.reaction} numberOfLines={1}>
                {allergy.reaction}
              </Text>
            )}
          </View>
        </View>

        {/* Severity Badge */}
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: severityColor + '20' },
          ]}
        >
          <Text style={[styles.severityText, { color: severityColor }]}>
            {getSeverityLabel(allergy.severity)}
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
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
  },
  nameSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  textContainer: {
    flex: 1,
    gap: Spacing[1],
  },
  allergyName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  reaction: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  severityBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  severityText: {
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

export default AllergyItem;
