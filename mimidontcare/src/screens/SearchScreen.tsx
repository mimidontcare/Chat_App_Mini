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
import { Typography, Radius, Spacing } from '../constants/theme';
import { Avatar, Button, Input, EmptyState } from '../components/common';
import { MOCK_SEARCH_USERS, MockUser } from '../constants/mockData';

interface SearchScreenProps {
  onBack: () => void;
  onStartChat: (user: MockUser) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onBack, onStartChat }) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState(MOCK_SEARCH_USERS);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddFriend = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, relation: 'pending_sent' } : u))
    );
  };

  const handleAcceptFriend = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, relation: 'friend' } : u))
    );
  };

  const renderRelationshipAction = (user: (typeof MOCK_SEARCH_USERS)[0]) => {
    switch (user.relation) {
      case 'self':
        return (
          <View style={[styles.selfBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>You</Text>
          </View>
        );

      case 'friend':
        return (
          <Button
            title="Chat"
            onPress={() => onStartChat(user)}
            variant="primary"
            size="sm"
            leftIcon={<Ionicons name="chatbubble" size={14} color="#FFFFFF" />}
          />
        );

      case 'pending_sent':
        return (
          <Button
            title="Requested"
            onPress={() => {}}
            variant="secondary"
            size="sm"
            disabled
          />
        );

      case 'pending_received':
        return (
          <Button
            title="Accept"
            onPress={() => handleAcceptFriend(user.id)}
            variant="primary"
            size="sm"
            leftIcon={<Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          />
        );

      case 'stranger':
      default:
        return (
          <Button
            title="Add Friend"
            onPress={() => handleAddFriend(user.id)}
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
            placeholder="Search by username or email..."
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

      {/* Results List */}
      <FlatList
        data={filteredUsers}
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
                {item.email}
              </Text>
            </View>

            <View style={styles.actionWrapper}>{renderRelationshipAction(item)}</View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No Users Found"
            description={`No results matching "${query}". Try searching with a different keyword.`}
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
