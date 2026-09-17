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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, Button, EmptyState } from '../components/common';
import api from '../services/api';

interface MessageRequestsScreenProps {
  onBack: () => void;
  onOpenChat: (conversation: any) => void;
}

export const MessageRequestsScreen: React.FC<MessageRequestsScreenProps> = ({
  onBack,
  onOpenChat,
}) => {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Lấy danh sách tin nhắn chờ từ Backend
  const fetchMessageRequests = useCallback(async () => {
    try {
      const res = await api.get('/conversations/requests');
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách tin nhắn chờ:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessageRequests();
  }, [fetchMessageRequests]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessageRequests();
    setIsRefreshing(false);
  };

  // Chấp nhận tin nhắn chờ
  const handleAccept = async (conv: any) => {
    try {
      setRequests((prev) => prev.filter((r) => r.id !== conv.id));
      await api.post(`/conversations/request/${conv.id}/accept`);
      if (Platform.OS === 'web') {
        const openNow = window.confirm('Đã chuyển cuộc trò chuyện vào hộp thư chính! Bạn có muốn mở chat ngay không?');
        if (openNow) onOpenChat(conv);
      } else {
        Alert.alert('Thành công', 'Đã chuyển cuộc trò chuyện vào hộp thư chính!', [
          {
            text: 'Mở chat ngay',
            onPress: () => onOpenChat(conv),
          },
          { text: 'Đóng', style: 'cancel' },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể chấp nhận tin nhắn chờ.');
      await fetchMessageRequests();
    }
  };

  // Ẩn / từ chối tin nhắn chờ
  const handleDelete = (id: number) => {
    const doDelete = async () => {
      try {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        await api.post(`/conversations/request/${id}/reject`);
      } catch (err: any) {
        Alert.alert('Lỗi', err.message || 'Không thể xóa tin nhắn chờ.');
        await fetchMessageRequests();
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa tin nhắn chờ này? Lịch sử tin nhắn sẽ bị xóa vĩnh viễn.');
      if (confirmed) {
        doDelete();
      }
      return;
    }

    Alert.alert(
      'Xóa tin nhắn chờ',
      'Bạn có chắc chắn muốn xóa tin nhắn chờ này? Lịch sử tin nhắn sẽ bị xóa vĩnh viễn.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: doDelete,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[Typography.headline, styles.headerTitle, { color: colors.textPrimary }]}>
          Tin Nhắn Chờ
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Notice Banner */}
      <View
        style={[
          styles.noticeBanner,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
        ]}
      >
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={[Typography.caption, styles.noticeText, { color: colors.textSecondary }]}>
          Những người chưa có trong danh sách bạn bè sẽ xuất hiện tại đây. Họ sẽ không biết bạn đã đọc tin nhắn cho đến khi bạn bấm Chấp nhận.
        </Text>
      </View>

      {/* Loading */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        /* Requests List */
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
              <Pressable
                onPress={() => onOpenChat(item)}
                style={styles.cardHeader}
                android_ripple={{ color: colors.surfaceSecondary }}
              >
                <Avatar
                  uri={item.peer.avatar_url}
                  name={item.peer.username}
                  size="md"
                />
                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[Typography.title, styles.senderName, { color: colors.textPrimary }]}>
                      {item.peer.username}
                    </Text>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                      {item.last_message?.created_at
                        ? new Date(item.last_message.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>
                  <Text
                    style={[Typography.bodyMedium, styles.previewText, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.last_message?.content || 'Đã gửi một tin nhắn...'}
                  </Text>
                </View>
              </Pressable>

              {/* Action Buttons */}
              <View style={[styles.cardActions, { borderTopColor: colors.borderLight }]}>
                <Button
                  title="Chấp nhận"
                  onPress={() => handleAccept(item)}
                  variant="primary"
                  size="sm"
                  style={styles.actionBtn}
                />
                <Button
                  title="Xóa"
                  onPress={() => handleDelete(item.id)}
                  variant="secondary"
                  size="sm"
                  style={styles.actionBtn}
                />
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="mail-unread-outline"
              title="Không có tin nhắn chờ"
              description="Hộp thư tin nhắn chờ của bạn hiện đang trống."
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRightPlaceholder: {
    width: 32,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  requestCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 15,
  },
  previewText: {
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    height: 36,
  },
});
