import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, Button } from '../components/common';
import { CURRENT_USER } from '../constants/mockData';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onLogoutPress?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onEditProfile,
  onLogoutPress,
}) => {
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayUser = {
    username: user?.username || CURRENT_USER.username,
    email: user?.email || CURRENT_USER.email,
    avatar_url: user?.avatar_url || CURRENT_USER.avatar_url,
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              if (onLogoutPress) {
                onLogoutPress();
              } else {
                await logout();
              }
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            Shadows.sm,
          ]}
        >
          <View style={styles.avatarWrapper}>
            <Avatar
              uri={displayUser.avatar_url}
              name={displayUser.username}
              size="xl"
              isOnline
              showStatus
            />
            <Pressable
              onPress={onEditProfile}
              style={[styles.editAvatarBadge, { backgroundColor: colors.primary }]}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Edit profile picture"
            >
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text style={[Typography.headline, styles.userName, { color: colors.textPrimary }]}>
            {displayUser.username}
          </Text>
          <Text style={[Typography.subtext, { color: colors.textSecondary }]}>
            {displayUser.email}
          </Text>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <View style={[styles.onlineDot, { backgroundColor: colors.online }]} />
            <Text style={[Typography.caption, { color: colors.textPrimary }]}>
              {CURRENT_USER.status_message}
            </Text>
          </View>

          <Button
            title="Edit Profile"
            onPress={onEditProfile}
            variant="secondary"
            size="sm"
            leftIcon={<Ionicons name="pencil" size={14} color={colors.textPrimary} />}
            style={styles.editBtn}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              Shadows.sm,
            ]}
          >
            <Text style={[Typography.title, styles.statNumber, { color: colors.primary }]}>
              12
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              Friends
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              Shadows.sm,
            ]}
          >
            <Text style={[Typography.title, styles.statNumber, { color: colors.primary }]}>
              5
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              Chats
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              Shadows.sm,
            ]}
          >
            <Text style={[Typography.title, styles.statNumber, { color: colors.online }]}>
              Active
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              Realtime
            </Text>
          </View>
        </View>

        {/* Settings Group */}
        <View
          style={[
            styles.menuGroup,
            { backgroundColor: colors.surface, borderColor: colors.border },
            Shadows.sm,
          ]}
        >
          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="moon-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[Typography.title, styles.menuTitle, { color: colors.textPrimary }]}>
                Dark Mode
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {isDark ? 'Enabled' : 'Disabled (Follows System)'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>

          <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[Typography.title, styles.menuTitle, { color: colors.textPrimary }]}>
                Privacy & Security
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                Message request filters & blocked users
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>

          <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[Typography.title, styles.menuTitle, { color: colors.textPrimary }]}>
                Notifications
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                In-app sound and preview banners
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          loading={loggingOut}
          variant="destructive"
          size="md"
          leftIcon={<Ionicons name="log-out-outline" size={18} color={colors.destructive} />}
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    marginBottom: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  editBtn: {
    minWidth: 140,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 18,
    marginBottom: 2,
  },
  menuGroup: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuTitle: {
    fontSize: 15,
  },
  menuDivider: {
    height: 1,
    marginLeft: Spacing.lg + 38 + Spacing.md,
  },
  logoutBtn: {
    marginTop: Spacing.xs,
  },
});
