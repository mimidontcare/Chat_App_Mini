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
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api, { BASE_URL } from '../services/api';
import { appendImageToFormData } from '../utils/fileUpload';

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { user, updateUser } = useAuth();

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

      // Chuẩn hóa avatar url (nếu là đường dẫn static từ server)
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
          alert('Thông tin cá nhân đã được cập nhật!');
          onBack();
        } else {
          Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!', [
            { text: 'OK', onPress: onBack },
          ]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Cập nhật thất bại. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backText}>‹ Trở về</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Chỉnh Sửa Hồ Sơ</Text>
          <TouchableOpacity
            style={[styles.saveNavButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#3b82f6" size="small" />
            ) : (
              <Text style={styles.saveNavText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Avatar Pick Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
              <View style={styles.avatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={15} color="#ffffff" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên đăng nhập *</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={(val) => {
                  setUsername(val);
                  if (error) setError(null);
                }}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (error) setError(null);
                }}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Đường dẫn ảnh trực tiếp (tùy chọn)</Text>
              <TextInput
                style={styles.input}
                value={avatarUri || ''}
                onChangeText={(val) => {
                  setAvatarUri(val);
                  setIsNewImageSelected(false);
                }}
                placeholder="https://... ảnh online"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
              )}
            </TouchableOpacity>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    padding: 6,
  },
  backText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },
  saveNavButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  saveNavText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#60a5fa',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e293b',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  cameraIcon: {
    fontSize: 14,
  },
  changePhotoBtn: {
    marginTop: 12,
  },
  changePhotoText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputGroup: {
    marginBottom: 18,
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
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
