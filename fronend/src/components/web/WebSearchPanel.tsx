import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { WebSearchUserItem, WebPeerData } from './types';
import api from '../../services/api';

interface WebSearchPanelProps {
  onStartChat: (peer: WebPeerData) => void;
}

export const WebSearchPanel: React.FC<WebSearchPanelProps> = ({ onStartChat }) => {
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WebSearchUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
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
        if (res.data?.success && Array.isArray(res.data.users)) {
          setResults(res.data.users);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Send friend request
  const handleAddFriend = async (targetUser: WebSearchUserItem) => {
    try {
      setActionLoadingId(targetUser.id);
      const res = await api.post('/friends/request', {
        receiver_id: targetUser.id,
      });
      if (res.data?.success) {
        setResults((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, relationship: 'request_sent' } : u
          )
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể gửi lời mời kết bạn.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0F1626' : '#F8FAFC',
          borderRightColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(226, 232, 240, 0.9)',
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Tìm kiếm người dùng
        </Text>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? '#141D30' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
            },
          ]}
        >
          <Ionicons name="search-outline" size={17} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm theo tên đăng nhập hoặc email..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            autoFocus={true}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tìm kiếm...
          </Text>
        </View>
      ) : !hasSearched ? (
        <View style={styles.centerBox}>
          <Ionicons
            name="search"
            size={40}
            color={isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1'}
          />
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Nhập tên người dùng hoặc email để tìm kiếm bạn bè.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1'}
          />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Không tìm thấy kết quả
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Không có người dùng nào khớp với "{query}".
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listScrollView}
          contentContainerStyle={styles.listContent}
        >
          {results.map((targetUser) => {
            const isSelf = targetUser.relationship === 'self';
            const isFriend = targetUser.relationship === 'friend';
            const isRequestSent = targetUser.relationship === 'request_sent';
            const isProcessing = actionLoadingId === targetUser.id;

            return (
              <View
                key={targetUser.id}
                style={[
                  styles.userItem,
                  {
                    borderBottomColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(226, 232, 240, 0.6)',
                  },
                ]}
              >
                <Avatar
                  uri={targetUser.avatar_url}
                  name={targetUser.username}
                  size={42}
                  isOnline={targetUser.is_online}
                />

                <View style={styles.userInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.userName, { color: colors.textPrimary }]}
                  >
                    {targetUser.username}
                  </Text>
                  {targetUser.email && (
                    <Text
                      numberOfLines={1}
                      style={[styles.userEmail, { color: colors.textSecondary }]}
                    >
                      {targetUser.email}
                    </Text>
                  )}
                </View>

                {/* Relationship Action */}
                <View style={styles.actionSlot}>
                  {isSelf ? (
                    <Text style={[styles.statusTag, { color: colors.textMuted }]}>
                      (Bạn)
                    </Text>
                  ) : isFriend ? (
                    <Pressable
                      onPress={() => onStartChat(targetUser)}
                      style={({ hovered }: any) => [
                        styles.actionBtn,
                        { backgroundColor: colors.primary },
                        hovered && { transform: [{ scale: 1.05 }] },
                      ]}
                    >
                      <Ionicons name="chatbubble" size={13} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Nhắn tin</Text>
                    </Pressable>
                  ) : isRequestSent ? (
                    <View
                      style={[
                        styles.badgeStatus,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.07)'
                            : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeStatusText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Đã gửi lời mời
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.twoBtnRow}>
                      <Pressable
                        onPress={() => handleAddFriend(targetUser)}
                        disabled={isProcessing}
                        style={({ hovered }: any) => [
                          styles.actionBtn,
                          { backgroundColor: colors.primary },
                          hovered && { transform: [{ scale: 1.05 }] },
                        ]}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Ionicons name="person-add" size={13} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Kết bạn</Text>
                          </>
                        )}
                      </Pressable>

                      <Pressable
                        onPress={() => onStartChat(targetUser)}
                        style={({ hovered }: any) => [
                          styles.actionBtnSecondary,
                          {
                            borderColor: isDark
                              ? 'rgba(255, 255, 255, 0.15)'
                              : '#CBD5E1',
                          },
                          hovered && { transform: [{ scale: 1.05 }] },
                        ]}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={13}
                          color={colors.textPrimary}
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 340,
    height: '100%',
    borderRightWidth: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  clearBtn: {
    padding: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  listScrollView: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 6,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 11.5,
  },
  actionSlot: {
    alignItems: 'flex-end',
  },
  statusTag: {
    fontSize: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    gap: 4,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
        } as any)
      : {}),
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  actionBtnSecondary: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
        } as any)
      : {}),
  },
  twoBtnRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
