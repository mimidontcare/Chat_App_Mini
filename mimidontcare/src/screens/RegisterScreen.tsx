import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Button, Input } from '../components/common';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const { colors } = useTheme();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await register(username.trim(), email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View
              style={[
                styles.logoBadge,
                { backgroundColor: colors.primaryLight },
                Shadows.sm,
              ]}
            >
              <Ionicons name="person-add" size={36} color={colors.primary} />
            </View>
            <Text style={[Typography.display, styles.title, { color: colors.textPrimary }]}>
              Create Account
            </Text>
            <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
              Join and start chatting with your friends
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
              Shadows.md,
            ]}
          >
            {error ? (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.destructiveLight, borderColor: colors.destructive },
                ]}
              >
                <Ionicons name="alert-circle" size={18} color={colors.destructive} />
                <Text style={[Typography.caption, styles.errorText, { color: colors.destructive }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Input
              label="Username"
              placeholder="e.g. alexnguyen"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              leftIcon="person-outline"
            />

            <Input
              label="Email (Optional)"
              placeholder="e.g. alex@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon="shield-checkmark-outline"
            />

            <Button
              title="Sign Up"
              onPress={handleRegister}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Switch to Login */}
          <View style={styles.footerRow}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Button
              title="Sign In"
              onPress={onNavigateToLogin}
              variant="ghost"
              size="sm"
              textStyle={styles.linkText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  linkText: {
    fontWeight: '700',
  },
});
