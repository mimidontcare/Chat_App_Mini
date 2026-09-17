import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, Button, EmptyState } from '../components/common';
import api from '../services/api';

export interface FriendRequestItem {
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

export interface FriendItem {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  friend_since: string;
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
  const [activeTab, setActiveTab] = useState<'requests' | 'friends'>('requests');
  const [requests, setRequests] = useState<FriendRequestItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
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

  // Chấp nhận kết bạn
  const handleAccept = async (requestId: number) => {
    try {
      // Optimistic update
      const acceptedReq = requests.find((r) => r.id === requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));

      const res = await api.post(`/friends/request/${requestId}/accept`);
      if (res.data?.success) {
        await fetchFriends();
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể chấp nhận lời mời kết bạn.');
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.backBtnPlaceholder} />
        )}
        <Text style={[Typography.headline, styles.headerTitle, { color: colors.textPrimary }]}>
          Bạn Bè
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Segmented Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.surfaceSecondary }]}>
        <Pressable
          onPress={() => setActiveTab('requests')}
          style={[styles.tabButton, activeTab === 'requests' && { backgroundColor: colors.surface }]}
        >
          <Text
            style={[
              styles.tabButtonText,
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
          style={[styles.tabButton, activeTab === 'friends' && { backgroundColor: colors.surface }]}
        >
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'friends' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'friends' ? '700' : '500',
              },
            ]}
          >
            Tất cả bạn bè ({friends.length})
          </Text>
        </Pressable>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === 'requests' ? (
        /* Requests Tab */
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.requestCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                Shadows.sm,
              ]}
            >
              <Avatar
                uri={item.sender.avatar_url}
                name={item.sender.username}
                size="md"
              />

              <View style={styles.cardContent}>
                <View style={styles.topInfoRow}>
                  <Text style={[Typography.title, styles.senderName, { color: colors.textPrimary }]}>
                    {item.sender.username}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </Text>
                </View>

                {item.sender.email ? (
                  <Text style={[Typography.caption, styles.emailText, { color: colors.textSecondary }]}>
                    {item.sender.email}
                  </Text>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.btnRow}>
                  <Button
                    title="Chấp nhận"
                    onPress={() => handleAccept(item.id)}
                    variant="primary"
                    size="sm"
                    style={styles.actionBtn}
                  />
                  <Button
                    title="Xóa"
                    onPress={() => handleReject(item.id)}
                    variant="secondary"
                    size="sm"
                    style={styles.actionBtn}
                  />
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Không có lời mời nào"
              description="Hiện tại bạn không có lời mời kết bạn nào đang chờ xử lý."
            />
          }
        />
      ) : (
        /* Friends List Tab */
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.friendCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight },
              ]}
            >
              <Avatar
                uri={item.avatar_url}
                name={item.username}
                size="md"
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
                  variant="outline"
                  size="sm"
                  leftIcon={<Ionicons name="chatbubble" size={14} color={colors.primary} />}
                />
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="person-add-outline"
              title="Chưa có bạn bè"
              description="Hãy dùng chức năng Tìm kiếm để kết nối với những người bạn mới!"
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
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  backBtnPlaceholder: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRightPlaceholder: {
    width: 32,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: 4,
    borderRadius: Radius.pill,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  tabButtonText: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  requestCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  senderName: {
    fontSize: 15,
  },
  emailText: {
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    height: 36,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  friendInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  friendName: {
    fontSize: 15,
    marginBottom: 2,
  },
});
