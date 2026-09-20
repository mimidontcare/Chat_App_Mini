import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, Button, EmptyState, Loading, FriendRequestItem } from '../components/common';
import api from '../services/api';

export interface FriendRequestItemData {
  id: number;
  created_at: string;
  status: string;
  sender: {
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface FriendItemData {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  friend_since: string;
  is_online?: boolean;
}

interface FriendRequestsScreenProps {
  onBack?: () => void;
  onStartChat?: (user: any) => void;
}

export const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({
  onBack,
  onStartChat,
}) => {
  const { colors } = useTheme();
  const { isUserOnline } = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<'requests' | 'friends'>('requests');
  const [requests, setRequests] = useState<FriendRequestItemData[]>([]);
  const [friends, setFriends] = useState<FriendItemData[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tải danh sách lời mời kết bạn
  const fetchRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách lời mời kết bạn:', err);
    }
  };

  // Tải danh sách bạn bè
  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      if (res.data?.success) {
        setFriends(res.data.friends || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bạn bè:', err);
    }
  };

  const loadData = useCallback(async () => {
    await Promise.all([fetchRequests(), fetchFriends()]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Chấp nhận kết bạn kèm visual feedback
  const handleAccept = async (requestId: number) => {
    try {
      setAcceptedIds((prev) => [...prev, requestId]);
      const res = await api.post(`/friends/request/${requestId}/accept`);
      if (res.data?.success) {
        await fetchFriends();
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể chấp nhận lời mời kết bạn.');
      setAcceptedIds((prev) => prev.filter((id) => id !== requestId));
      await fetchRequests();
    }
  };

  // Từ chối kết bạn
  const handleReject = async (requestId: number) => {
    try {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      await api.post(`/friends/request/${requestId}/reject`);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể từ chối lời mời kết bạn.');
      await fetchRequests();
    }
  };

  const formatRequestTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Trở về"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.placeholderBtn} />
        )}
        <Text style={[Typography.headline, { color: colors.textPrimary }]}>
          Bạn bè
        </Text>
        <View style={styles.placeholderBtn} />
      </View>

      {/* Segmented Tab Switcher */}
      <View style={[styles.segmentedTabs, { backgroundColor: colors.surfaceSecondary }]}>
        <Pressable
          onPress={() => setActiveTab('requests')}
          style={[
            styles.segmentBtn,
            activeTab === 'requests' && [styles.activeSegmentBtn, { backgroundColor: colors.surface }, Shadows.sm],
          ]}
        >
          <Text
            style={[
              Typography.caption,
              styles.segmentText,
              {
                color: activeTab === 'requests' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'requests' ? '700' : '500',
              },
            ]}
          >
            Lời mời ({requests.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('friends')}
          style={[
            styles.segmentBtn,
            activeTab === 'friends' && [styles.activeSegmentBtn, { backgroundColor: colors.surface }, Shadows.sm],
          ]}
        >
          <Text
            style={[
              Typography.caption,
              styles.segmentText,
              {
                color: activeTab === 'friends' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'friends' ? '700' : '500',
              },
            ]}
          >
            Danh sách bạn bè ({friends.length})
          </Text>
        </Pressable>
      </View>

      {/* Body List */}
      {isLoading ? (
        <Loading message="Đang tải dữ liệu bạn bè..." />
      ) : activeTab === 'requests' ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <FriendRequestItem
              id={item.id}
              user={item.sender}
              timeAgo={`Đã gửi vào ${formatRequestTime(item.created_at)}`}
              isAccepted={acceptedIds.includes(item.id)}
              onAccept={handleAccept}
              onReject={handleReject}
              onStartChat={onStartChat}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="person-add-outline"
              title="Không có lời mời nào"
              description="Hiện tại bạn không có lời mời kết bạn nào đang chờ xử lý."
            />
          }
        />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.friendCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
                Shadows.sm,
              ]}
            >
              <Avatar
                uri={item.avatar_url}
                name={item.username}
                size="md"
                showStatus
                isOnline={isUserOnline(item.id)}
              />

              <View style={styles.friendInfo}>
                <Text style={[Typography.title, styles.friendName, { color: colors.textPrimary }]}>
                  {item.username}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {item.email || 'Bạn bè'}
                </Text>
              </View>

              {onStartChat && (
                <Button
                  title="Nhắn tin"
                  onPress={() => onStartChat(item)}
                  variant="primary"
                  size="sm"
                  leftIcon={<Ionicons name="chatbubble" size={14} color="#FFFFFF" />}
                />
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Chưa có bạn bè nào"
              description="Hãy tìm kiếm và kết bạn với người dùng khác để bắt đầu trò chuyện!"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
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
  placeholderBtn: {
    width: 32,
  },
  segmentedTabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    padding: 4,
    borderRadius: Radius.pill,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  activeSegmentBtn: {
    // shadow applied
  },
  segmentText: {
    fontSize: 13,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  friendInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  friendName: {
    marginBottom: 2,
  },
});
