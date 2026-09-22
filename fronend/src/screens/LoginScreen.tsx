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
  const { colors, isDark } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let isValid = true;
    setUsernameError(null);
    setPasswordError(null);
    setGeneralError(null);

    if (!username.trim()) {
      setUsernameError('Vui lòng nhập tên đăng nhập');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await login(username.trim(), password);
    } catch (err: any) {
      setGeneralError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản.');
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
          <View style={styles.centerBox}>
            {/* Header & App Brand */}
            <View style={styles.headerContainer}>
              <View
                style={[
                  styles.logoBadge,
                  {
                    backgroundColor: isDark ? colors.surfaceSecondary : colors.primaryLight,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.15)',
                  },
                  Shadows.glow,
                ]}
              >
                <Ionicons name="chatbubbles" size={44} color={colors.primary} />
              </View>
              <Text style={[Typography.display, styles.title, { color: colors.textPrimary }]}>
                Chào mừng trở lại!
              </Text>
              <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
                Đăng nhập để tiếp tục trò chuyện cùng bạn bè
              </Text>
            </View>

            {/* Form Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? colors.surface : colors.glassBg,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
                },
                Shadows.md,
                Platform.OS === 'web'
                  ? ({
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                    } as any)
                  : null,
              ]}
            >
              {generalError ? (
                <View
                  style={[
                    styles.errorBanner,
                    { backgroundColor: colors.destructiveLight, borderColor: colors.destructive },
                  ]}
                >
                  <Ionicons name="alert-circle" size={18} color={colors.destructive} />
                  <Text style={[Typography.caption, styles.errorText, { color: colors.destructive }]}>
                    {generalError}
                  </Text>
                </View>
              ) : null}

              <Input
                label="Tên đăng nhập"
                placeholder="Nhập username của bạn"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (usernameError) setUsernameError(null);
                }}
                error={usernameError}
                autoCapitalize="none"
                leftIcon="person-outline"
                showClear
                onClear={() => setUsername('')}
              />

              <Input
                label="Mật khẩu"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError(null);
                }}
                error={passwordError}
                isPassword
                leftIcon="lock-closed-outline"
              />

              <Button
                title="Đăng Nhập"
                onPress={handleLogin}
                loading={isSubmitting}
                variant="primary"
                size="lg"
                style={styles.submitBtn}
              />

              {/* Quick Demo Explore */}
              {onDemoLogin ? (
                <Button
                  title="Khám phá nhanh (Bỏ qua đăng nhập)"
                  onPress={onDemoLogin}
                  variant="glass"
                  size="md"
                  leftIcon={<Ionicons name="flash" size={18} color={colors.warning} />}
                  style={styles.demoBtn}
                />
              ) : null}
            </View>

            {/* Footer chuyển sang Đăng ký */}
            <View style={styles.footerRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Chưa có tài khoản?{' '}
              </Text>
              <Button
                title="Đăng ký ngay"
                onPress={onNavigateToRegister}
                variant="ghost"
                size="sm"
                textStyle={styles.linkText}
              />
            </View>
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
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    width: '100%',
    maxWidth: 440,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
  card: {
    borderRadius: Radius.xxl,
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
