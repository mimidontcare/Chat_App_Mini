import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing } from '../constants/theme';
import { Avatar, Button, Input } from '../components/common';
import { CURRENT_USER } from '../constants/mockData';

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [username, setUsername] = useState(user?.username || CURRENT_USER.username);
  const [email, setEmail] = useState(user?.email || CURRENT_USER.email);
  const [statusMessage, setStatusMessage] = useState(CURRENT_USER.status_message || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url || CURRENT_USER.avatar_url);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera roll permission is required to update your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Error selecting avatar:', e);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Success', 'Your profile information has been updated.', [
        { text: 'OK', onPress: onBack },
      ]);
    }, 700);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[Typography.headline, styles.headerTitle, { color: colors.textPrimary }]}>
          Edit Profile
        </Text>
        <Pressable onPress={handleSave} hitSlop={8} disabled={isSaving}>
          <Text style={[Typography.bodyMedium, { color: colors.primary, fontWeight: '700' }]}>
            Save
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Avatar Edit Center */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar
                uri={avatarUri}
                name={username}
                size="xl"
              />
              <Pressable
                onPress={handlePickAvatar}
                style={[styles.cameraBadge, { backgroundColor: colors.primary }]}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Choose photo"
              >
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            <Pressable onPress={handlePickAvatar} hitSlop={6}>
              <Text style={[Typography.bodyMedium, styles.changePhotoText, { color: colors.primary }]}>
                Change Profile Photo
              </Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              leftIcon="person-outline"
            />

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Status / Bio"
              value={statusMessage}
              onChangeText={setStatusMessage}
              placeholder="e.g. Available to chat 🚀"
              leftIcon="chatbox-ellipses-outline"
            />
          </View>

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isSaving}
            variant="primary"
            size="lg"
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  cameraBadge: {
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
  changePhotoText: {
    fontWeight: '600',
    marginTop: 4,
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
});
