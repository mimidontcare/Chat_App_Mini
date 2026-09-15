import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing } from '../constants/theme';
import { Avatar, Button, Input, EmptyState } from '../components/common';
import api from '../services/api';

export interface SearchUserItem {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  relationship: 'none' | 'friend' | 'request_sent' | 'request_received' | 'self';
  is_online?: boolean;
}

interface SearchScreenProps {
  onBack: () => void;
  onStartChat: (user: any) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onBack, onStartChat }) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SearchUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search API call (400ms)
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/users/search', {
          params: { q: query.trim() },
        });

        if (res.data?.success) {
          setUsers(res.data.users || []);
        }
      } catch (error) {
        console.error('Lỗi tìm kiếm người dùng:', error);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Xử lý gửi lời mời kết bạn
  const handleAddFriend = async (targetUser: SearchUserItem) => {
    try {
      // Cập nhật UI tức thời (Optimistic Update)
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, relationship: 'request_sent' } : u))
      );

      // Gọi API kết bạn (chuẩn bị cho Phase 5)
      await api.post('/friends/request', { receiver_id: targetUser.id }).catch(() => {
        // Nếu API Phase 5 chưa xong, state vẫn giữ nguyên để trải nghiệm không bị gián đoạn
      });
    } catch (err) {
      console.error('Lỗi gửi lời mời kết bạn:', err);
    }
  };

  // Xử lý chấp nhận lời mời kết bạn
  const handleAcceptFriend = async (targetUser: SearchUserItem) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, relationship: 'friend' } : u))
      );

      await api.post(`/friends/request/${targetUser.id}/accept`).catch(() => {});
    } catch (err) {
      console.error('Lỗi chấp nhận lời mời kết bạn:', err);
    }
  };

  // Hiển thị nút hành động tùy theo trạng thái quan hệ (Must-Have của Phase 4)
  const renderRelationshipAction = (user: SearchUserItem) => {
    switch (user.relationship) {
      case 'self':
        return (
          <View style={[styles.selfBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>Bạn</Text>
          </View>
        );

      case 'friend':
        return (
          <Button
            title="Nhắn tin"
            onPress={() => onStartChat(user)}
            variant="primary"
            size="sm"
            leftIcon={<Ionicons name="chatbubble" size={14} color="#FFFFFF" />}
          />
        );

      case 'request_sent':
        return (
          <Button
            title="Đã gửi lời mời"
            onPress={() => {}}
            variant="secondary"
            size="sm"
            disabled
          />
        );

      case 'request_received':
        return (
          <Button
            title="Chấp nhận"
            onPress={() => handleAcceptFriend(user)}
            variant="primary"
            size="sm"
            leftIcon={<Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          />
        );

      case 'none':
      default:
        return (
          <Button
            title="Kết bạn"
            onPress={() => handleAddFriend(user)}
            variant="outline"
            size="sm"
            leftIcon={<Ionicons name="person-add" size={14} color={colors.primary} />}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.borderLight }]}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to chats"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.inputWrapper}>
          <Input
            placeholder="Tìm theo username hoặc email..."
            value={query}
            onChangeText={setQuery}
            leftIcon="search-outline"
            rightIcon={query ? 'close-circle' : undefined}
            onRightIconPress={() => setQuery('')}
            containerStyle={styles.searchContainerStyle}
            autoFocus
          />
        </View>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 8 }]}>
            Đang tìm kiếm...
          </Text>
        </View>
      )}

      {/* Results List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.userCard,
              { backgroundColor: colors.surface, borderBottomColor: colors.borderLight },
            ]}
          >
            <Avatar
              uri={item.avatar_url}
              name={item.username}
              size="md"
              isOnline={item.is_online}
              showStatus
            />

            <View style={styles.userInfo}>
              <Text style={[Typography.title, styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.username}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.email || 'Chưa cập nhật email'}
              </Text>
            </View>

            <View style={styles.actionWrapper}>{renderRelationshipAction(item)}</View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            hasSearched ? (
              <EmptyState
                icon="search-outline"
                title="Không tìm thấy người dùng"
                description={`Không có kết quả nào khớp với "${query}". Hãy thử tìm với từ khóa khác.`}
              />
            ) : (
              <EmptyState
                icon="people-outline"
                title="Tìm kiếm bạn bè"
                description="Nhập tên đăng nhập hoặc địa chỉ email để tìm kiếm và kết bạn mới."
              />
            )
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    flex: 1,
  },
  searchContainerStyle: {
    marginBottom: Spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  listContent: {
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  userName: {
    marginBottom: 2,
  },
  actionWrapper: {
    justifyContent: 'center',
  },
  selfBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
});
