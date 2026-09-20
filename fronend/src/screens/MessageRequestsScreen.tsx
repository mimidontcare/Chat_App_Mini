import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing } from '../constants/theme';
import { EmptyState, Loading, MessageRequestItem } from '../components/common';
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
  const handleAccept = async (id: number) => {
    try {
      const targetConv = requests.find((r) => r.id === id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      await api.post(`/conversations/request/${id}/accept`);

      if (Platform.OS === 'web') {
        const openNow = window.confirm('Đã chuyển cuộc trò chuyện vào hộp thư chính! Bạn có muốn mở chat ngay không?');
        if (openNow && targetConv) onOpenChat(targetConv);
      } else {
        Alert.alert('Thành công', 'Đã chuyển cuộc trò chuyện vào hộp thư chính!', [
          {
            text: 'Mở chat ngay',
            onPress: () => targetConv && onOpenChat(targetConv),
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
  const handleReject = (id: number) => {
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
      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa tin nhắn chờ này?');
      if (confirmed) doDelete();
      return;
    }

    Alert.alert(
      'Xóa tin nhắn chờ',
      'Bạn có chắc chắn muốn xóa tin nhắn chờ này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: doDelete },
      ]
    );
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
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
          accessibilityLabel="Trở về"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[Typography.headline, { color: colors.textPrimary }]}>
          Tin nhắn chờ
        </Text>
        <View style={styles.placeholderBtn} />
      </View>

      {/* Explanatory Banner (Mục 11) */}
      <View
        style={[
          styles.noticeBanner,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight },
        ]}
      >
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={[Typography.caption, styles.noticeText, { color: colors.textSecondary }]}>
          Tin nhắn từ người chưa có trong danh sách bạn bè. Họ sẽ không biết bạn đã đọc cho đến khi bạn chấp nhận.
        </Text>
      </View>

      {/* Main List */}
      {isLoading ? (
        <Loading message="Đang tải tin nhắn chờ..." />
      ) : (
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
            <MessageRequestItem
              id={item.id}
              peer={item.peer}
              lastMessage={item.last_message}
              timeAgo={formatTime(item.last_message?.created_at)}
              onOpen={() => onOpenChat(item)}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="mail-open-outline"
              title="Không có tin nhắn chờ nào"
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  placeholderBtn: {
    width: 32,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
