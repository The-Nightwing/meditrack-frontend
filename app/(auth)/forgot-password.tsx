import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { FontSizes, FontWeights } from '@/styles/typography';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email address.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {sent ? (
            <>
              <View style={[styles.iconWrap, { backgroundColor: Colors.successSubtle, borderColor: Colors.success + '30' }]}>
                <Feather name="mail" size={30} color={Colors.success} />
              </View>
              <Text style={styles.title}>Check your inbox</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Back to Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resendBtn} onPress={() => setSent(false)}>
                <Text style={styles.resendText}>Didn't receive it? Try again</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.iconWrap, { backgroundColor: Colors.primarySubtle, borderColor: Colors.primaryMid }]}>
                <Feather name="lock" size={30} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>Email address</Text>
                <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
                  <Feather name="mail" size={17} color={focused ? Colors.primary : Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.resendBtn}>
                <Feather name="arrow-left" size={14} color={Colors.primary} />
                <Text style={styles.resendText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  container: { flex: 1, paddingHorizontal: Spacing[5], paddingTop: Spacing[3] },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing[8],
  },
  content: { flex: 1, paddingTop: Spacing[4] },

  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: Spacing[6],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold as any,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing[7],
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold as any,
  },

  field: { marginBottom: Spacing[5] },
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
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing[3],
    height: 52,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  inputIcon: { marginRight: Spacing[2] },
  input: { flex: 1, fontSize: FontSizes.base, color: Colors.text },

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
    marginBottom: Spacing[4],
  },
  btnDisabled: { opacity: 0.65, shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontSize: FontSizes.base, fontWeight: FontWeights.bold as any, letterSpacing: 0.2 },

  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[2],
  },
  resendText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.medium as any },
});
