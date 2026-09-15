import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    if (username.trim().length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await register(username.trim(), email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Logo */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>✨</Text>
            </View>
            <Text style={styles.title}>Tạo Tài Khoản</Text>
            <Text style={styles.subtitle}>Bắt đầu trải nghiệm chat 1-1 realtime</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên đăng nhập *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: nguyenvana"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (tùy chọn)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: a@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu (ít nhất 6 ký tự) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu bí mật"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu ở trên"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Đăng Ký Tài Khoản</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchAuthContainer}>
              <Text style={styles.switchAuthText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.switchAuthLink}>Đăng nhập</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  switchAuthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  switchAuthText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  switchAuthLink: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
  },
});
