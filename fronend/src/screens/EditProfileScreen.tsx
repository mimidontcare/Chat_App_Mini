import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, Button, Input } from '../components/common';
import api, { BASE_URL } from '../services/api';
import { appendImageToFormData } from '../utils/fileUpload';

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url || null);
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isNewImageSelected, setIsNewImageSelected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chọn ảnh từ thư viện
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Ứng dụng cần quyền truy cập thư viện ảnh để đổi ảnh đại diện.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
        setAvatarAsset(result.assets[0]);
        setIsNewImageSelected(true);
      }
    } catch (err) {
      console.error('Lỗi khi chọn ảnh:', err);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  // Lưu thông tin
  const handleSave = async () => {
    if (!username.trim()) {
      setError('Tên đăng nhập không được để trống!');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let finalAvatarUrl = avatarUri;

      // Nếu người dùng chọn ảnh mới từ máy -> Upload lên Backend
      if (isNewImageSelected && avatarUri) {
        const formData = new FormData();
        await appendImageToFormData(formData, 'avatar', {
          uri: avatarUri,
          name: avatarAsset?.fileName,
          type: avatarAsset?.mimeType,
          file: (avatarAsset as any)?.file,
        });

        const uploadRes = await api.post('/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadRes.data?.success) {
          finalAvatarUrl = uploadRes.data.avatar_url;
        }
      }

      // Chuẩn hóa avatar url
      let resolvedAvatarUrl = finalAvatarUrl;
      if (resolvedAvatarUrl && resolvedAvatarUrl.startsWith('/uploads')) {
        const serverOrigin = BASE_URL.replace('/api', '');
        resolvedAvatarUrl = `${serverOrigin}${resolvedAvatarUrl}`;
      }

      // Cập nhật thông tin profile
      const updateRes = await api.put('/users/profile', {
        username: username.trim(),
        email: email ? email.trim() : '',
        avatar_url: resolvedAvatarUrl,
      });

      if (updateRes.data?.success && updateRes.data?.user) {
        await updateUser(updateRes.data.user);
        if (Platform.OS === 'web') {
          alert('Thông tin cá nhân đã được cập nhật thành công!');
          onBack();
        } else {
          Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!', [
            { text: 'OK', onPress: onBack },
          ]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Navigation Bar */}
        <View style={[styles.navBar, { borderBottomColor: colors.borderLight }]}>
          <Pressable
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Trở về"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={[Typography.headline, { color: colors.textPrimary }]}>
            Chỉnh Sửa Hồ Sơ
          </Text>
          <Button
            title="Lưu"
            onPress={handleSave}
            loading={isSaving}
            variant="ghost"
            size="sm"
            textStyle={styles.saveBtnText}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.destructiveLight, borderColor: colors.destructive }]}>
              <Ionicons name="alert-circle" size={18} color={colors.destructive} />
              <Text style={[Typography.caption, { color: colors.destructive, fontWeight: '600', flex: 1 }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Avatar Pick Section */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickImage} style={styles.avatarPickerWrap} accessibilityRole="button">
              <Avatar
                uri={avatarUri}
                name={username}
                size="xl"
              />
              <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </Pressable>
            <Pressable onPress={handlePickImage} style={styles.changePhotoBtn}>
              <Text style={[Typography.bodyMedium, { color: colors.primary }]}>
                Thay đổi ảnh đại diện
              </Text>
            </Pressable>
          </View>

          {/* Form Fields Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.borderLight },
              Shadows.sm,
            ]}
          >
            <Input
              label="Tên đăng nhập *"
              value={username}
              onChangeText={(val) => {
                setUsername(val);
                if (error) setError(null);
              }}
              placeholder="Nhập tên đăng nhập"
              autoCapitalize="none"
              leftIcon="person-outline"
            />

            <Input
              label="Địa chỉ Email"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (error) setError(null);
              }}
              placeholder="Nhập email của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Đường dẫn ảnh online (tùy chọn)"
              value={avatarUri || ''}
              onChangeText={(val) => {
                setAvatarUri(val);
                setIsNewImageSelected(false);
              }}
              placeholder="https://... liên kết ảnh"
              autoCapitalize="none"
              leftIcon="image-outline"
            />

            <Button
              title="Lưu Thay Đổi"
              onPress={handleSave}
              loading={isSaving}
              variant="primary"
              size="lg"
              style={styles.saveSubmitBtn}
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  saveBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  avatarPickerWrap: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoBtn: {
    marginTop: Spacing.sm,
    padding: Spacing.xs,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  saveSubmitBtn: {
    marginTop: Spacing.md,
  },
});
