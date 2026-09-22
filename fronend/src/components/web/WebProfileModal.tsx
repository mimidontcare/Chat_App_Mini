import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import api from '../../services/api';
import { appendImageToFormData } from '../../utils/fileUpload';

interface WebProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const WebProfileModal: React.FC<WebProfileModalProps> = ({
  visible,
  onClose,
  onLogout,
}) => {
  const { user, updateUser } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (visible && user) {
      setEditUsername(user.username || '');
      setEditEmail(user.email || '');
      setStatusMsg(null);
      setIsEditing(false);
    }
  }, [visible, user]);

  const handlePickAvatar = async () => {
    try {
      setStatusMsg(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setIsUpdatingAvatar(true);
        const asset = result.assets[0];

        const formData = new FormData();
        await appendImageToFormData(formData, 'avatar', {
          uri: asset.uri,
          name: asset.fileName || 'avatar.jpg',
          type: asset.mimeType || 'image/jpeg',
          file: (asset as any).file,
        });

        const res = await api.post('/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.success && res.data?.user) {
          await updateUser(res.data.user);
          setStatusMsg({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
        }
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật ảnh đại diện:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Không thể cập nhật ảnh đại diện!',
      });
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setStatusMsg(null);
    const trimmedUsername = editUsername.trim();
    const trimmedEmail = editEmail.trim();

    if (!trimmedUsername) {
      setStatusMsg({ type: 'error', text: 'Tên người dùng không được để trống!' });
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.put('/users/profile', {
        username: trimmedUsername,
        email: trimmedEmail || null,
      });

      if (res.data?.success && res.data?.user) {
        await updateUser(res.data.user);
        setStatusMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật profile:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin!',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
        onLogout();
      }
    } else {
      onLogout();
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Thành viên mới';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? '#121A2B' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.9)',
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {isEditing ? 'Chỉnh sửa hồ sơ' : 'Hồ sơ cá nhân'}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ hovered }: any) => [
                styles.closeBtn,
                hovered && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9' },
              ]}
              accessibilityLabel="Đóng"
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Status Message Alert */}
          {statusMsg && (
            <View
              style={[
                styles.statusAlert,
                {
                  backgroundColor:
                    statusMsg.type === 'success'
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                  borderColor:
                    statusMsg.type === 'success'
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)',
                },
              ]}
            >
              <Ionicons
                name={statusMsg.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={statusMsg.type === 'success' ? '#10B981' : '#EF4444'}
              />
              <Text
                style={[
                  styles.statusAlertText,
                  { color: statusMsg.type === 'success' ? '#10B981' : '#EF4444' },
                ]}
              >
                {statusMsg.text}
              </Text>
            </View>
          )}

          {/* User Avatar with Edit trigger */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar
                uri={user?.avatar_url}
                name={user?.username || 'User'}
                size={84}
              />
              <Pressable
                onPress={handlePickAvatar}
                disabled={isUpdatingAvatar}
                style={[
                  styles.changeAvatarBadge,
                  { backgroundColor: colors.primary },
                ]}
                accessibilityLabel="Đổi ảnh đại diện"
              >
                {isUpdatingAvatar ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
            <Text style={[styles.avatarHint, { color: colors.textMuted }]}>
              Bấm biểu tượng máy ảnh để thay đổi avatar
            </Text>
          </View>

          {/* Form Content */}
          {isEditing ? (
            /* EDIT FORM */
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Tên người dùng (Username) *
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: isDark ? '#0B1120' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                    },
                  ]}
                >
                  <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    value={editUsername}
                    onChangeText={setEditUsername}
                    placeholder="Nhập tên đăng nhập..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Địa chỉ Email
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: isDark ? '#0B1120' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                    },
                  ]}
                >
                  <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="Nhập email..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Edit Actions: Cancel & Save */}
              <View style={styles.editActions}>
                <Pressable
                  onPress={() => {
                    setIsEditing(false);
                    setStatusMsg(null);
                    setEditUsername(user?.username || '');
                    setEditEmail(user?.email || '');
                  }}
                  style={[
                    styles.cancelBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    },
                  ]}
                  disabled={isSaving}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>
                    Hủy bỏ
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveProfile}
                  style={[
                    styles.saveBtn,
                    { backgroundColor: colors.primary },
                    isSaving && { opacity: 0.7 },
                  ]}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={17} color="#FFFFFF" />
                      <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            /* VIEW MODE */
            <>
              {/* User Name & Email */}
              <View style={styles.profileMeta}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>
                  {user?.username || 'Người dùng'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                  {user?.email || 'Chưa liên kết email'}
                </Text>

                {/* Edit Profile Button */}
                <Pressable
                  onPress={() => {
                    setStatusMsg(null);
                    setIsEditing(true);
                  }}
                  style={[
                    styles.editProfileBtn,
                    {
                      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.1)',
                      borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)',
                    },
                  ]}
                >
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                  <Text style={[styles.editProfileBtnText, { color: colors.primary }]}>
                    Chỉnh sửa thông tin
                  </Text>
                </Pressable>
              </View>

              {/* Details List */}
              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Mã ID</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>#{user?.id}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Tham gia</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{formattedDate}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Giao diện</Text>
                  <Pressable
                    onPress={toggleTheme}
                    style={[
                      styles.themeToggleBtn,
                      { backgroundColor: isDark ? '#23304B' : '#E2E8F0' },
                    ]}
                  >
                    <Ionicons
                      name={isDark ? 'moon' : 'sunny'}
                      size={14}
                      color={isDark ? '#38BDF8' : '#F59E0B'}
                    />
                    <Text style={[styles.themeToggleText, { color: colors.textPrimary }]}>
                      {isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Logout Button */}
              <Pressable
                onPress={handleConfirmLogout}
                style={({ hovered }: any) => [
                  styles.logoutBtn,
                  {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
                  },
                  hovered && { transform: [{ scale: 1.02 }] },
                ]}
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  modalCard: {
    width: 420,
    maxWidth: '95%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)' as any,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  statusAlertText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  changeAvatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#121A2B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  avatarHint: {
    fontSize: 11.5,
  },
  profileMeta: {
    alignItems: 'center',
    marginBottom: 18,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 12,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  /* Edit Form Styles */
  editForm: {
    gap: 14,
    marginBottom: 10,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#0084FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
});
