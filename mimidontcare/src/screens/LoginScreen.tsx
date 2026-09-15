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

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onDemoLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onDemoLogin,
}) => {
  const { login } = useAuth();
  const { colors } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
          {/* Header & Brand Logo */}
          <View style={styles.headerContainer}>
            <View
              style={[
                styles.logoBadge,
                { backgroundColor: colors.primaryLight },
                Shadows.sm,
              ]}
            >
              <Ionicons name="chatbubbles" size={38} color={colors.primary} />
            </View>
            <Text style={[Typography.display, styles.title, { color: colors.textPrimary }]}>
              Welcome Back
            </Text>
            <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue your conversations
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
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              leftIcon="person-outline"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />

            {/* Quick Demo Login Button */}
            {onDemoLogin ? (
              <Button
                title="Quick Demo Explore (Skip Auth)"
                onPress={onDemoLogin}
                variant="outline"
                size="md"
                leftIcon={<Ionicons name="flash-outline" size={18} color={colors.primary} />}
                style={styles.demoBtn}
              />
            ) : null}
          </View>

          {/* Switch to Register */}
          <View style={styles.footerRow}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Button
              title="Create Account"
              onPress={onNavigateToRegister}
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
    marginBottom: Spacing.xxl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
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
  demoBtn: {
    marginTop: Spacing.md,
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
