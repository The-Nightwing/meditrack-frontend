/**
 * Main app layout with bottom tab navigator — modern pill-style active indicator
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useConcernsStore } from '@/store/concernsStore';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontWeights } from '@/styles/typography';

function TabBarBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

function TabIcon({
  name,
  color,
  focused,
  badgeCount = 0,
}: {
  name: string;
  color: string;
  focused: boolean;
  badgeCount?: number;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather name={name as any} size={20} color={color} />
      {badgeCount > 0 && <TabBarBadge count={badgeCount} />}
    </View>
  );
}

export default function AppLayout() {
  const summary = useConcernsStore((state) => state.summary);
  const criticalCount = summary?.critical ?? 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.neutral400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          tabBarLabel: 'Metrics',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="activity" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="file-text" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="concerns"
        options={{
          tabBarLabel: 'Concerns',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="alert-triangle" color={color} focused={focused} badgeCount={criticalCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingTop: Spacing[2],
    paddingBottom: Platform.OS === 'ios' ? Spacing[6] : Spacing[2],
    paddingHorizontal: Spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: FontWeights.semibold as any,
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapActive: {
    backgroundColor: Colors.primarySubtle,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    minHeight: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: FontWeights.bold as any,
    lineHeight: 13,
  },
});
