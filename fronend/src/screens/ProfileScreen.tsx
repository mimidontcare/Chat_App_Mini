import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, Button } from '../components/common';

interface ProfileScreenProps {
  onNavigateToEditProfile?: () => void;
  onEditProfile?: () => void;
  onLogoutPress?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToEditProfile,
  onEditProfile,
  onLogoutPress,
}) => {
  const { user, logout } = useAuth();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const handleEdit = onEditProfile || onNavigateToEditProfile;

  const handleLogout = () => {
    const doLogout = async () => {
      if (onLogoutPress) onLogoutPress();
      await logout();
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?');
      if (confirmed) {
        doLogout();
      }
      return;
    }

    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: doLogout,
        },
      ]
    );
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Không rõ';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Text style={[Typography.headline, { color: colors.textPrimary }]}>
          Hồ sơ cá nhân
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card với Avatar Lớn (Mục 12) */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: colors.surface, borderColor: colors.borderLight },
            Shadows.sm,
          ]}
        >
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.avatar_url}
              name={user?.username}
              size="xl"
              showStatus
              isOnline={true}
            />
          </View>

          <Text style={[Typography.headline, styles.username, { color: colors.textPrimary }]}>
            {user?.username || 'Người dùng'}
          </Text>

          <Text style={[Typography.body, styles.email, { color: colors.textSecondary }]}>
            {user?.email || 'Chưa cập nhật email'}
          </Text>

          <View style={[styles.idBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[Typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
              Mã tài khoản: #{user?.id}
            </Text>
          </View>

          {handleEdit && (
            <Button
              title="Chỉnh sửa hồ sơ"
              onPress={handleEdit}
              variant="outline"
              size="md"
              leftIcon={<Ionicons name="create-outline" size={18} color={colors.primary} />}
              style={styles.editBtn}
            />
          )}
        </View>

        {/* Detailed Info Card */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.surface, borderColor: colors.borderLight },
            Shadows.sm,
          ]}
        >
          <Text style={[Typography.title, styles.sectionTitle, { color: colors.textPrimary }]}>
            Thông tin chi tiết
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.textSecondary }]}>Tên tài khoản</Text>
            </View>
            <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
              @{user?.username}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.textSecondary }]}>Địa chỉ Email</Text>
            </View>
            <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
              {user?.email || '(Trống)'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.textSecondary }]}>Ngày tham gia</Text>
            </View>
            <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
              {formattedDate}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.online} />
              <Text style={[Typography.body, { color: colors.textSecondary }]}>Trạng thái</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Text style={[Typography.caption, { color: colors.online, fontWeight: '700' }]}>
                Đang hoạt động
              </Text>
            </View>
          </View>
        </View>

        {/* Menu & Settings List */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.surface, borderColor: colors.borderLight },
            Shadows.sm,
          ]}
        >
          <Text style={[Typography.title, styles.sectionTitle, { color: colors.textPrimary }]}>
            Cài đặt & Tiện ích
          </Text>

          {/* Theme Selector (Mục 6: ☀️ Light / 🌙 Dark) */}
          <View style={styles.themeRow}>
            <View style={styles.menuLeft}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={isDark ? colors.warning : colors.primary}
              />
              <View style={{ marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: colors.textPrimary }]}>
                  Giao diện
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {isDark ? 'Chế độ tối (Dark)' : 'Chế độ sáng (Light)'}
                </Text>
              </View>
            </View>

            <View style={[styles.themePillsContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}>
              <Pressable
                onPress={() => setThemeMode('light')}
                style={[
                  styles.themePillBtn,
                  !isDark && [styles.activeThemePill, { backgroundColor: colors.surface }, Shadows.sm],
                ]}
                accessibilityRole="button"
                accessibilityLabel="Chuyển sang chế độ sáng"
              >
                <Ionicons
                  name="sunny"
                  size={15}
                  color={!isDark ? colors.warning : colors.textMuted}
                />
                <Text
                  style={[
                    Typography.caption,
                    {
                      color: !isDark ? colors.textPrimary : colors.textMuted,
                      fontWeight: !isDark ? '700' : '500',
                      marginLeft: 4,
                    },
                  ]}
                >
                  Sáng
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setThemeMode('dark')}
                style={[
                  styles.themePillBtn,
                  isDark && [styles.activeThemePill, { backgroundColor: colors.surfaceHover }, Shadows.sm],
                ]}
                accessibilityRole="button"
                accessibilityLabel="Chuyển sang chế độ tối"
              >
                <Ionicons
                  name="moon"
                  size={14}
                  color={isDark ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    Typography.caption,
                    {
                      color: isDark ? colors.textPrimary : colors.textMuted,
                      fontWeight: isDark ? '700' : '500',
                      marginLeft: 4,
                    },
                  ]}
                >
                  Tối
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <Pressable
            onPress={() => Alert.alert('Thông báo', 'Cài đặt thông báo đang được nâng cấp.')}
            style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.surfaceSecondary }]}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
              <Text style={[Typography.body, { color: colors.textPrimary, marginLeft: Spacing.md }]}>
                Thông báo & Âm thanh
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <Pressable
            onPress={() => Alert.alert('Thông báo', 'Tính năng bảo mật đang hoạt động an toàn với JWT.')}
            style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.surfaceSecondary }]}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} />
              <Text style={[Typography.body, { color: colors.textPrimary, marginLeft: Spacing.md }]}>
                Quyền riêng tư & Bảo mật
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <Pressable
            onPress={() => Alert.alert('MiniChat', 'Ứng dụng Chat Realtime v1.0.0 (Expo React Native)')}
            style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.surfaceSecondary }]}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textPrimary} />
              <Text style={[Typography.body, { color: colors.textPrimary, marginLeft: Spacing.md }]}>
                Về ứng dụng MiniChat
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Logout Button */}
        <Button
          title="Đăng Xuất"
          onPress={handleLogout}
          variant="destructive"
          size="lg"
          leftIcon={<Ionicons name="log-out-outline" size={20} color={colors.destructive} />}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  userCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  username: {
    marginBottom: 4,
  },
  email: {
    marginBottom: Spacing.sm,
  },
  idBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginBottom: Spacing.lg,
  },
  editBtn: {
    width: '100%',
  },
  sectionCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    marginTop: Spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  themePillsContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md - 2,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  activeThemePill: {
    //
  },
});
