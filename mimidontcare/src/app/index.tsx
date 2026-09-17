import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.usernameText}>{user?.username || 'Người dùng'}</Text>
          </View>
        </View>

        {/* User Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông Tin Tài Khoản</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã người dùng (ID):</Text>
            <Text style={styles.infoValue}>#{user?.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên đăng nhập:</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || '(Chưa cập nhật)'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái:</Text>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeText}>Đã xác thực JWT</Text>
            </View>
          </View>
        </View>

        {/* Phase Checklist Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tiến Độ Dự Án</Text>
          <View style={styles.divider} />
          <View style={styles.taskItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.taskText}>Phase 0: Chuẩn bị môi trường & MySQL DB</Text>
          </View>
          <View style={styles.taskItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.taskText}>Phase 1: Backend Authentication (Bcrypt + JWT)</Text>
          </View>
          <View style={styles.taskItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.taskText}>Phase 2: Frontend Auth (Axios + AuthContext)</Text>
          </View>
          <View style={styles.taskItem}>
            <Ionicons name="time-outline" size={18} color="#f59e0b" />
            <Text style={styles.taskText}>Phase 3: Navigation & Profile (Tiếp theo)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  badgeText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  taskIcon: {
    fontSize: 16,
  },
  taskText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '700',
  },
});
