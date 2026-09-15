import React, { useState } from 'react';
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
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, Button, EmptyState } from '../components/common';
import { MOCK_MESSAGE_REQUESTS, MockConversation } from '../constants/mockData';

interface MessageRequestsScreenProps {
  onBack: () => void;
  onOpenChat: (conversation: MockConversation) => void;
}

export const MessageRequestsScreen: React.FC<MessageRequestsScreenProps> = ({
  onBack,
  onOpenChat,
}) => {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<MockConversation[]>(MOCK_MESSAGE_REQUESTS);

  const handleAccept = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDelete = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
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
          Message Requests
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
          People who aren't on your friends list can send message requests here. They won't know you've seen their message until you accept.
        </Text>
      </View>

      {/* Requests List */}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
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
                isOnline={item.peer.is_online}
                showStatus
              />
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={[Typography.title, styles.senderName, { color: colors.textPrimary }]}>
                    {item.peer.username}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    {item.last_message.created_at}
                  </Text>
                </View>
                <Text
                  style={[Typography.body, styles.messageContent, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {item.last_message.content}
                </Text>
              </View>
            </Pressable>

            {/* Accept / Delete Action Bar */}
            <View style={[styles.actionRow, { borderTopColor: colors.borderLight }]}>
              <Button
                title="Delete"
                onPress={() => handleDelete(item.id)}
                variant="secondary"
                size="sm"
                style={styles.actionBtn}
              />
              <Button
                title="Accept"
                onPress={() => handleAccept(item.id)}
                variant="primary"
                size="sm"
                style={styles.actionBtn}
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="mail-open-outline"
            title="No Message Requests"
            description="You don't have any incoming messages from people outside your friends list."
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
  headerRightPlaceholder: {
    width: 32,
  },
  noticeBanner: {
    flexDirection: 'row',
    margin: Spacing.lg,
    marginBottom: Spacing.sm,
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
    padding: Spacing.lg,
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
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 15,
  },
  messageContent: {
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 36,
  },
});
