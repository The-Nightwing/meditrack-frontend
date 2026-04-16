import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields to continue.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    clearError();
    try {
      await signup(email.trim().toLowerCase(), password, firstName.trim(), lastName.trim());
    } catch (e) {}
  };

  const isPasswordStrong = password.length >= 8;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.decCircle1} />
            <View style={styles.decCircle2} />
            <View style={styles.logoWrap}>
              <Feather name="activity" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.heroTitle}>Create account</Text>
            <Text style={styles.heroSubtitle}>Start your health journey today</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={15} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Name Row */}
            <View style={styles.nameRow}>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>First name</Text>
                <View style={[styles.inputWrap, focusedField === 'first' && styles.inputWrapFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor={Colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    onFocus={() => setFocusedField('first')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Last name</Text>
                <View style={[styles.inputWrap, focusedField === 'last' && styles.inputWrapFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor={Colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    onFocus={() => setFocusedField('last')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
                <Feather name="mail" size={17} color={focusedField === 'email' ? Colors.primary : Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, focusedField === 'pwd' && styles.inputWrapFocused]}>
                <Feather name="lock" size={17} color={focusedField === 'pwd' ? Colors.primary : Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('pwd')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={17} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={[styles.strengthBar, { backgroundColor: isPasswordStrong ? Colors.success : Colors.warning }]} />
                  <Text style={[styles.strengthText, { color: isPasswordStrong ? Colors.success : Colors.warning }]}>
                    {isPasswordStrong ? 'Strong password' : 'At least 8 characters required'}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.terms}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: Spacing[10] },

  header: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[1],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    alignItems: 'center',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
    paddingHorizontal: Spacing[6],
    position: 'relative',
    overflow: 'hidden',
  },
  decCircle1: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primaryMid,
    opacity: 0.4,
  },
  decCircle2: {
    position: 'absolute',
    bottom: 0,
    left: -60,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.accentSubtle,
    opacity: 0.5,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: Colors.primaryMid,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold as any, color: Colors.text },
  heroSubtitle: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing[1] },

  card: {
    marginHorizontal: Spacing[5],
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing[6],
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.dangerSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    marginBottom: Spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  errorText: { color: Colors.danger, fontSize: FontSizes.sm, flex: 1 },

  nameRow: { flexDirection: 'row', gap: Spacing[3] },
  field: { marginBottom: Spacing[4] },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing[3],
    height: 52,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  inputIcon: { marginRight: Spacing[2] },
  input: { flex: 1, fontSize: FontSizes.base, color: Colors.text, height: '100%' },
  eyeBtn: { padding: Spacing[1] },

  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginTop: Spacing[2] },
  strengthBar: { width: 32, height: 3, borderRadius: 2 },
  strengthText: { fontSize: FontSizes.xs },

  terms: { fontSize: FontSizes.xs, color: Colors.textMuted, marginBottom: Spacing[5], lineHeight: 18 },
  termsLink: { color: Colors.primary, fontWeight: FontWeights.medium as any },

  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.65, shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontSize: FontSizes.base, fontWeight: FontWeights.bold as any, letterSpacing: 0.2 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[6],
  },
  footerText: { color: Colors.textMuted, fontSize: FontSizes.sm },
  footerLink: { paddingVertical: 4 },
  footerLinkText: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: FontWeights.bold as any },
});
