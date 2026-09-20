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

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let isValid = true;
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setGeneralError(null);

    if (!username.trim()) {
      setUsernameError('Vui lòng nhập tên đăng nhập');
      isValid = false;
    } else if (username.trim().length < 3) {
      setUsernameError('Tên đăng nhập phải có ít nhất 3 ký tự');
      isValid = false;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Email không hợp lệ');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await register(username.trim(), email.trim(), password);
    } catch (err: any) {
      setGeneralError(err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
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
                Shadows.md,
              ]}
            >
              <Ionicons name="person-add" size={38} color={colors.primary} />
            </View>
            <Text style={[Typography.display, styles.title, { color: colors.textPrimary }]}>
              Tạo tài khoản mới
            </Text>
            <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
              Tham gia ngay để kết nối và trò chuyện cùng mọi người
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
              label="Tên đăng nhập *"
              placeholder="ví dụ: alexnguyen"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (usernameError) setUsernameError(null);
              }}
              error={usernameError}
              autoCapitalize="none"
              leftIcon="person-outline"
            />

            <Input
              label="Email (Tùy chọn)"
              placeholder="ví dụ: alex@gmail.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Mật khẩu *"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              error={passwordError}
              isPassword
              leftIcon="lock-closed-outline"
            />

            <Input
              label="Xác nhận mật khẩu *"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError(null);
              }}
              error={confirmPasswordError}
              isPassword
              leftIcon="shield-checkmark-outline"
            />

            <Button
              title="Đăng Ký Tài Khoản"
              onPress={handleRegister}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer chuyển sang Đăng nhập */}
          <View style={styles.footerRow}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Đã có tài khoản?{' '}
            </Text>
            <Button
              title="Đăng nhập ngay"
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
