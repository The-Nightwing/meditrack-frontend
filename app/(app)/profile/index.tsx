import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Modal, FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';
import { formatDate, getAge, getBMI, getBMICategory } from '@/utils/formatting';

const ALL_PRECONDITIONS = [
  // Metabolic / Endocrine
  'Type 1 Diabetes', 'Type 2 Diabetes', 'Pre-Diabetes', 'Hypothyroidism', 'Hyperthyroidism',
  'PCOS (Polycystic Ovary Syndrome)', 'Adrenal Insufficiency', "Cushing's Syndrome",
  // Cardiovascular
  'Hypertension (High Blood Pressure)', 'Hypotension (Low Blood Pressure)', 'Coronary Artery Disease',
  'Heart Failure', 'Atrial Fibrillation', 'Arrhythmia', 'High Cholesterol', 'History of Heart Attack',
  'History of Stroke', 'Deep Vein Thrombosis (DVT)',
  // Respiratory
  'Asthma', 'COPD (Chronic Obstructive Pulmonary Disease)', 'Chronic Bronchitis', 'Sleep Apnea',
  'Pulmonary Hypertension', 'Interstitial Lung Disease',
  // Digestive
  'GERD (Acid Reflux)', 'Irritable Bowel Syndrome (IBS)', "Crohn's Disease", 'Ulcerative Colitis',
  'Celiac Disease', 'Non-Alcoholic Fatty Liver Disease (NAFLD)', 'Cirrhosis', 'Hepatitis B', 'Hepatitis C',
  // Kidney
  'Chronic Kidney Disease (CKD)', 'Kidney Stones', 'Recurrent Urinary Tract Infections',
  // Musculoskeletal
  'Rheumatoid Arthritis', 'Osteoarthritis', 'Osteoporosis', 'Gout', 'Lupus', 'Fibromyalgia',
  'Ankylosing Spondylitis',
  // Neurological / Mental Health
  'Epilepsy / Seizure Disorder', 'Migraine', "Parkinson's Disease", 'Multiple Sclerosis',
  'Anxiety Disorder', 'Depression', 'Bipolar Disorder', 'ADHD', 'Autism Spectrum Disorder',
  // Blood / Immune
  'Anemia (Iron Deficiency)', 'Sickle Cell Disease', 'Thalassemia', 'Hemophilia', 'HIV/AIDS',
  'Autoimmune Disease', 'Immunodeficiency',
  // Cancer
  'History of Cancer', 'Currently Undergoing Cancer Treatment',
  // Reproductive
  'Endometriosis', 'Uterine Fibroids', 'Ovarian Cysts', 'Benign Prostatic Hyperplasia (BPH)',
  // Eyes / Ears
  'Glaucoma', 'Macular Degeneration', 'Hearing Loss',
  // Nutritional
  'Obesity', 'Underweight / Malnutrition', 'Vitamin D Deficiency', 'Vitamin B12 Deficiency',
  'Iron Overload (Hemochromatosis)', 'Chronic Fatigue Syndrome',
];

function PreconditionPicker({
  selected,
  onSave,
  onClose,
}: {
  selected: string[];
  onSave: (items: string[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<string[]>(selected);

  const toggle = (item: string) =>
    setDraft((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modal.safe}>
        <View style={modal.header}>
          <TouchableOpacity onPress={onClose} style={modal.btn}>
            <Text style={modal.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={modal.title}>Pre-existing Conditions</Text>
          <TouchableOpacity onPress={() => { onSave(draft); onClose(); }} style={modal.btn}>
            <Text style={modal.doneText}>Done ({draft.length})</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={ALL_PRECONDITIONS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = draft.includes(item);
            return (
              <TouchableOpacity
                style={[modal.row, isSelected && modal.rowSelected]}
                onPress={() => toggle(item)}
                activeOpacity={0.7}
              >
                <Text style={[modal.rowLabel, isSelected && modal.rowLabelSelected]}>{item}</Text>
                {isSelected ? (
                  <Feather name="check-circle" size={18} color={Colors.primary} />
                ) : (
                  <View style={modal.circle} />
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: Spacing[8] }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const modal = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold as any, color: Colors.text },
  btn: { padding: Spacing[1], minWidth: 60 },
  cancelText: { fontSize: FontSizes.base, color: Colors.textMuted },
  doneText: { fontSize: FontSizes.base, color: Colors.primary, fontWeight: FontWeights.semibold as any, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowSelected: { backgroundColor: Colors.primarySubtle },
  rowLabel: { flex: 1, fontSize: FontSizes.sm, color: Colors.text },
  rowLabelSelected: { color: Colors.primary, fontWeight: FontWeights.medium as any },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderMid,
  },
});

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [preconditions, setPreconditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, preRes] = await Promise.allSettled([
        apiClient.get('/health-profile'),
        apiClient.get('/health-profile/preconditions'),
      ]);
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data?.data ?? null);
      if (preRes.status === 'fulfilled') setPreconditions(preRes.value.data?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const savePreconditions = async (items: string[]) => {
    setSaving(true);
    try {
      await apiClient.put('/health-profile/preconditions', { preconditions: items });
      setPreconditions(items);
    } catch {
      Alert.alert('Error', 'Failed to save conditions');
    } finally {
      setSaving(false);
    }
  };

  const removePrecondition = (item: string) =>
    savePreconditions(preconditions.filter((x) => x !== item));

  const bmi = profile?.weightKg && profile?.heightCm
    ? getBMI(Number(profile.weightKg), Number(profile.heightCm)) : null;
  const age = profile?.dateOfBirth ? getAge(profile.dateOfBirth) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const bmiColor = bmiCategory === 'Normal weight'
    ? Colors.success
    : bmiCategory === 'Overweight' || bmiCategory === 'Underweight'
    ? Colors.warning : Colors.danger;

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.logoutIconBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProfile} tintColor={Colors.primary} />}
      >
        {/* ── Avatar Hero ────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || '?'}</Text>
            </View>
            <View style={styles.avatarOnline} />
          </View>
          <Text style={styles.fullName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing[8] }} />
        ) : (
          <>
            {/* ── Body Stats ─────────────────────────────── */}
            {profile && (
              <View style={styles.statsCard}>
                {age && <StatBox label="Age" value={`${age}y`} color={Colors.accent} />}
                {profile.weightKg && <StatBox label="Weight" value={`${Number(profile.weightKg).toFixed(0)}kg`} color={Colors.primary} />}
                {profile.heightCm && <StatBox label="Height" value={`${Number(profile.heightCm).toFixed(0)}cm`} color={Colors.success} />}
                {bmi && <StatBox label="BMI" value={bmi} color={bmiColor} />}
              </View>
            )}

            {/* ── Personal Info ──────────────────────────── */}
            {profile && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Feather name="user" size={15} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Personal Information</Text>
                </View>
                {profile.dateOfBirth && (
                  <InfoRow icon="calendar" label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
                )}
                {profile.gender && (
                  <InfoRow icon="user" label="Gender" value={profile.gender} />
                )}
                {profile.bloodGroup && (
                  <InfoRow icon="droplet" label="Blood Group" value={profile.bloodGroup} isLast={!bmiCategory} />
                )}
                {bmiCategory && (
                  <InfoRow icon="heart" label="BMI Category" value={bmiCategory} valueColor={bmiColor} isLast />
                )}
              </View>
            )}

            {/* ── Pre-existing Conditions ────────────────── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="activity" size={15} color={Colors.primary} />
                <Text style={styles.cardTitle}>Pre-existing Conditions</Text>
              </View>
              <Text style={styles.cardNote}>
                Helps personalise AI metric explanations and mitigation plans
              </Text>
              {preconditions.length > 0 ? (
                <View style={styles.tagCloud}>
                  {preconditions.map((item) => (
                    <View key={item} style={styles.tag}>
                      <Text style={styles.tagText}>{item}</Text>
                      <TouchableOpacity
                        onPress={() => removePrecondition(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="x" size={11} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.cardEmpty}>No conditions added yet</Text>
              )}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setPickerOpen(true)}
                activeOpacity={0.75}
              >
                <Feather name={preconditions.length === 0 ? 'plus' : 'edit-2'} size={14} color={Colors.primary} />
                <Text style={styles.editBtnText}>
                  {preconditions.length === 0 ? 'Add conditions' : 'Edit conditions'}
                </Text>
                {saving && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: Spacing[1] }} />}
              </TouchableOpacity>
            </View>

            {/* ── Settings ───────────────────────────────── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="settings" size={15} color={Colors.primary} />
                <Text style={styles.cardTitle}>Settings</Text>
              </View>
              {[
                { icon: 'user', label: 'Edit Profile', desc: 'Update your personal information' },
                { icon: 'bell', label: 'Notifications', desc: 'Manage alerts and reminders' },
                { icon: 'shield', label: 'Privacy', desc: 'Data and security settings' },
                { icon: 'help-circle', label: 'Help & Support', desc: 'Get help with MediTrack' },
              ].map((item, idx, arr) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.settingsRow, idx === arr.length - 1 && styles.settingsRowLast]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.settingsIcon, { backgroundColor: Colors.primarySubtle }]}>
                    <Feather name={item.icon as any} size={15} color={Colors.primary} />
                  </View>
                  <View style={styles.settingsInfo}>
                    <Text style={styles.settingsLabel}>{item.label}</Text>
                    <Text style={styles.settingsDesc}>{item.desc}</Text>
                  </View>
                  <Feather name="chevron-right" size={15} color={Colors.neutral300} />
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Sign Out ───────────────────────────────── */}
            <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.85}>
              <Feather name="log-out" size={17} color={Colors.danger} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: Spacing[8] }} />
      </ScrollView>

      {pickerOpen && (
        <PreconditionPicker
          selected={preconditions}
          onSave={savePreconditions}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[statStyles.wrap, { borderColor: color + '25', backgroundColor: color + '08' }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  value: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold as any },
  label: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: FontWeights.medium as any },
});

function InfoRow({ icon, label, value, valueColor, isLast }: {
  icon: string; label: string; value: string; valueColor?: string; isLast?: boolean;
}) {
  return (
    <View style={[infoStyles.row, isLast && infoStyles.rowLast]}>
      <Feather name={icon as any} size={14} color={Colors.textMuted} />
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}
const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing[2],
  },
  rowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  label: { flex: 1, fontSize: FontSizes.sm, color: Colors.textMuted, marginLeft: 2 },
  value: { fontSize: FontSizes.sm, color: Colors.text, fontWeight: FontWeights.semibold as any },
});

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
  logoutIconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dangerSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing[4] },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing[7],
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarWrap: { position: 'relative', marginBottom: Spacing[3] },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold as any, color: '#fff' },
  avatarOnline: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 2.5,
    borderColor: Colors.background,
  },
  fullName: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold as any, color: Colors.text },
  email: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 4 },

  // Stats card
  statsCard: {
    flexDirection: 'row',
    gap: Spacing[2],
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  // Generic card
  card: {
    backgroundColor: Colors.background,
    marginTop: Spacing[3],
    marginHorizontal: Spacing[4],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3] },
  cardTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.bold as any, color: Colors.text },
  cardNote: { fontSize: FontSizes.xs, color: Colors.textMuted, marginBottom: Spacing[3], lineHeight: 18 },
  cardEmpty: { fontSize: FontSizes.sm, color: Colors.textMuted, fontStyle: 'italic', marginBottom: Spacing[2] },

  // Tags
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[3] },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primarySubtle,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  tagText: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.medium as any },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    alignSelf: 'flex-start',
  },
  editBtnText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold as any },

  // Settings rows
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing[3],
  },
  settingsRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  settingsInfo: { flex: 1 },
  settingsLabel: { fontSize: FontSizes.base, color: Colors.text, fontWeight: FontWeights.medium as any },
  settingsDesc: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 1 },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.background,
    marginTop: Spacing[3],
    marginHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.danger + '30',
  },
  signOutText: { fontSize: FontSizes.base, color: Colors.danger, fontWeight: FontWeights.semibold as any },
});
