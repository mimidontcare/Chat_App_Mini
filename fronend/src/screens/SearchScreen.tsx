import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing } from '../constants/theme';
import { Avatar, Button, SearchBar, EmptyState } from '../components/common';
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
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, relationship: 'request_sent' } : u))
      );
      await api.post('/friends/request', { receiver_id: targetUser.id }).catch(() => {});
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

  // Hiển thị nút hành động tùy theo trạng thái quan hệ
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
          <View style={styles.actionRow}>
            <Button
              title="Đã gửi lời mời"
              onPress={() => {}}
              variant="secondary"
              size="sm"
              disabled
            />
            <Button
              title="Nhắn tin"
              onPress={() => onStartChat(user)}
              variant="primary"
              size="sm"
            />
          </View>
        );

      case 'request_received':
        return (
          <View style={styles.actionRow}>
            <Button
              title="Chấp nhận"
              onPress={() => handleAcceptFriend(user)}
              variant="primary"
              size="sm"
              leftIcon={<Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            />
            <Button
              title="Nhắn tin"
              onPress={() => onStartChat(user)}
              variant="secondary"
              size="sm"
            />
          </View>
        );

      case 'none':
      default:
        return (
          <View style={styles.actionRow}>
            <Button
              title="Thêm bạn"
              onPress={() => handleAddFriend(user)}
              variant="outline"
              size="sm"
              leftIcon={<Ionicons name="person-add" size={14} color={colors.primary} />}
            />
            <Button
              title="Nhắn tin"
              onPress={() => onStartChat(user)}
              variant="primary"
              size="sm"
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.borderLight }]}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Trở về"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm bạn bè hoặc người dùng..."
            loading={isLoading}
            autoFocus
          />
        </View>
      </View>

      {/* Results Stream */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => item.relationship !== 'self' && onStartChat(item)}
            style={({ pressed }) => [
              styles.userCard,
              {
                backgroundColor: pressed ? colors.surfaceSecondary : colors.surface,
                borderBottomColor: colors.borderLight,
              },
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
                {item.email || 'Người dùng MiniChat'}
              </Text>
            </View>

            <View style={styles.actionWrapper}>{renderRelationshipAction(item)}</View>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            hasSearched ? (
              <EmptyState
                icon="search-outline"
                title="Không tìm thấy người dùng"
                description={`Không có kết quả nào khớp với "${query}". Vui lòng thử từ khóa khác.`}
              />
            ) : (
              <EmptyState
                icon="people-outline"
                title="Tìm kiếm bạn bè hoặc người dùng"
                description="Nhập tên đăng nhập để tìm kiếm bạn bè và bắt đầu trò chuyện."
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
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  searchBarWrapper: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  selfBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
});
