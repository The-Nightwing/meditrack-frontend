/**
 * ProfileHeader Component
 * Header card with initials avatar, name, and key stats
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
import { Card } from '../common/Card';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  bmi?: number;
  onEditPress: () => void;
  style?: ViewStyle;
}

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (firstName: string, lastName: string): string => {
  const colors = [
    Colors.primary,
    Colors.success,
    Colors.warning,
    Colors.danger,
    Colors.info,
  ];
  const hash = (firstName + lastName).charCodeAt(0) + (firstName + lastName).charCodeAt(1);
  return colors[hash % colors.length];
};

const getGenderIcon = (gender?: string): string => {
  switch (gender) {
    case 'male':
      return 'male';
    case 'female':
      return 'female';
    default:
      return 'help-circle';
  }
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  firstName,
  lastName,
  age,
  gender,
  bloodGroup,
  bmi,
  onEditPress,
  style,
}) => {
  const initials = getInitials(firstName, lastName);
  const avatarColor = getAvatarColor(firstName, lastName);

  return (
    <Card style={[styles.card, style]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.initials}>{initials}</Text>
        </View>

        {/* Name and Basic Info */}
        <View style={styles.nameSection}>
          <Text style={styles.fullName}>
            {firstName} {lastName}
          </Text>
          {age && (
            <View style={styles.basicInfo}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={Colors.textMuted}
              />
              <Text style={styles.basicInfoText}>{age} years old</Text>
              {gender && (
                <>
                  <Text style={styles.basicInfoDot}>•</Text>
                  <Ionicons
                    name={getGenderIcon(gender) as any}
                    size={14}
                    color={Colors.textMuted}
                  />
                </>
              )}
            </View>
          )}
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="pencil"
            size={20}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      {(bloodGroup || bmi !== undefined) && (
        <View style={styles.statsGrid}>
          {bloodGroup && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Blood Type</Text>
              <Text style={styles.statValue}>{bloodGroup}</Text>
            </View>
          )}
          {bmi !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>BMI</Text>
              <Text style={styles.statValue}>{bmi.toFixed(1)}</Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: Spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  initials: {
    ...Typography.h3,
    color: Colors.background,
    fontWeight: '700',
  },
  nameSection: {
    flex: 1,
    gap: Spacing[1],
  },
  fullName: {
    ...Typography.h4,
    color: Colors.text,
  },
  basicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  basicInfoText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  basicInfoDot: {
    color: Colors.textMuted,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
    gap: Spacing[1],
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  statValue: {
    ...Typography.h5,
    color: Colors.text,
  },
});

export default ProfileHeader;
