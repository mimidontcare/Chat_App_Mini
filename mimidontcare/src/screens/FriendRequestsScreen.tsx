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
import { MOCK_FRIEND_REQUESTS, MockFriendRequest } from '../constants/mockData';

interface FriendRequestsScreenProps {
  onBack: () => void;
}

export const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<MockFriendRequest[]>(MOCK_FRIEND_REQUESTS);

  const handleAccept = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
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
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[Typography.headline, styles.headerTitle, { color: colors.textPrimary }]}>
          Friend Requests
        </Text>
        <View style={styles.headerRightPlaceholder} />
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
            <Avatar
              uri={item.sender.avatar_url}
              name={item.sender.username}
              size="md"
              isOnline={item.sender.is_online}
              showStatus
            />

            <View style={styles.cardContent}>
              <View style={styles.topInfoRow}>
                <Text style={[Typography.title, styles.senderName, { color: colors.textPrimary }]}>
                  {item.sender.username}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {item.created_at}
                </Text>
              </View>

              {item.mutual_friends ? (
                <Text style={[Typography.caption, styles.mutualText, { color: colors.textSecondary }]}>
                  {item.mutual_friends} mutual friends
                </Text>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <Button
                  title="Confirm"
                  onPress={() => handleAccept(item.id)}
                  variant="primary"
                  size="sm"
                  style={styles.actionBtn}
                />
                <Button
                  title="Delete"
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
            title="No Friend Requests"
            description="You have responded to all pending friend requests."
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
  listContent: {
    padding: Spacing.lg,
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
  mutualText: {
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
});
