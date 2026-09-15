import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, EmptyState } from '../components/common';
import {
  CURRENT_USER,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGE_REQUESTS,
  MockConversation,
} from '../constants/mockData';

interface HomeScreenProps {
  onSelectConversation: (conversation: MockConversation) => void;
  onOpenSearch: () => void;
  onOpenMessageRequests: () => void;
  onOpenFriendRequests: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectConversation,
  onOpenSearch,
  onOpenMessageRequests,
  onOpenFriendRequests,
}) => {
  const { colors } = useTheme();
  const [conversations, setConversations] = useState<MockConversation[]>(MOCK_CONVERSATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const pendingRequestsCount = MOCK_MESSAGE_REQUESTS.length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const filteredList = conversations.filter((c) => {
    if (filter === 'unread') return c.unread_count > 0;
    return true;
  });

  const renderItem = ({ item }: { item: MockConversation }) => {
    const isUnread = item.unread_count > 0;

    return (
      <Pressable
        onPress={() => onSelectConversation(item)}
        style={({ pressed }) => [
          styles.conversationItem,
          { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
        ]}
        android_ripple={{ color: colors.surfaceSecondary }}
      >
        <Avatar
          uri={item.peer.avatar_url}
          name={item.peer.username}
          size="md"
          isOnline={item.peer.is_online}
          showStatus
        />

        <View style={styles.conversationContent}>
          <View style={styles.conversationTopRow}>
            <Text
              style={[
                Typography.title,
                styles.username,
                { color: colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {item.peer.username}
            </Text>
            <Text
              style={[
                Typography.caption,
                {
                  color: isUnread ? colors.primary : colors.textSecondary,
                  fontWeight: isUnread ? '600' : '400',
                },
              ]}
            >
              {item.last_message.created_at}
            </Text>
          </View>

          <View style={styles.conversationBottomRow}>
            <Text
              style={[
                Typography.subtext,
                styles.messagePreview,
                {
                  color: isUnread ? colors.textPrimary : colors.textSecondary,
                  fontWeight: isUnread ? '600' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {item.last_message.message_type === 'image' ? '📷 Photo' : item.last_message.content}
            </Text>

            {isUnread ? (
              <View style={[styles.unreadBadge, { backgroundColor: colors.unreadBadge }]}>
                <Text style={[Typography.caption, styles.unreadText]}>
                  {item.unread_count}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerLeft}>
          <Avatar
            uri={CURRENT_USER.avatar_url}
            name={CURRENT_USER.username}
            size="sm"
            isOnline={CURRENT_USER.is_online}
            showStatus
          />
          <Text style={[Typography.headline, styles.headerTitle, { color: colors.textPrimary }]}>
            Messages
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={onOpenFriendRequests}
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceSecondary }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Friend requests"
          >
            <Ionicons name="people-outline" size={20} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            onPress={onOpenSearch}
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceSecondary }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Search users"
          >
            <Ionicons name="search-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Search Bar Entry */}
      <Pressable
        onPress={onOpenSearch}
        style={[
          styles.searchBar,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textPlaceholder} />
        <Text style={[Typography.body, { color: colors.textPlaceholder, marginLeft: Spacing.sm }]}>
          Search messages or users...
        </Text>
      </Pressable>

      {/* Message Requests Banner (if any) */}
      {pendingRequestsCount > 0 ? (
        <Pressable
          onPress={onOpenMessageRequests}
          style={[
            styles.requestBanner,
            { backgroundColor: colors.primaryLight, borderColor: colors.primary },
          ]}
        >
          <View style={styles.requestBannerLeft}>
            <View style={[styles.requestIconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[Typography.title, { fontSize: 14, color: colors.textPrimary }]}>
                Message Requests
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {pendingRequestsCount} new message from someone you may know
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      ) : null}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setFilter('all')}
          style={[
            styles.filterPill,
            filter === 'all'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Text
            style={[
              Typography.subtext,
              {
                color: filter === 'all' ? colors.onPrimary : colors.textSecondary,
                fontWeight: filter === 'all' ? '600' : '400',
              },
            ]}
          >
            All Chats
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter('unread')}
          style={[
            styles.filterPill,
            filter === 'unread'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Text
            style={[
              Typography.subtext,
              {
                color: filter === 'unread' ? colors.onPrimary : colors.textSecondary,
                fontWeight: filter === 'unread' ? '600' : '400',
              },
            ]}
          >
            Unread
          </Text>
        </Pressable>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-outline"
            title="No Conversations Yet"
            description="Start searching for contacts or friends to initiate a 1-to-1 conversation."
            actionTitle="Find People"
            onAction={onOpenSearch}
          />
        }
      />
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  requestBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  requestIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  conversationContent: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  conversationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  username: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  conversationBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messagePreview: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
