import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

interface HomeScreenProps {
  onSelectConversation?: (conv: any) => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenMessageRequests?: () => void;
  onOpenFriendRequests?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectConversation,
  onOpenSearch,
  onOpenProfile,
  onOpenMessageRequests,
  onOpenFriendRequests,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.avatarButton} onPress={onOpenProfile} activeOpacity={0.8}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.appTitle}>Đoạn chat</Text>
          <Text style={styles.userStatus}>Đang hoạt động</Text>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={onOpenSearch} activeOpacity={0.7}>
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bạn bè hoặc tin nhắn..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Action Badges */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionChip} activeOpacity={0.7}>
          <Text style={styles.actionChipText}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionChip, styles.actionChipInactive]} activeOpacity={0.7}>
          <Text style={styles.actionChipTextInactive}>Chưa đọc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionChip, styles.actionChipInactive]}
          onPress={onOpenMessageRequests}
          activeOpacity={0.7}
        >
          <Text style={styles.actionChipTextInactive}>Tin nhắn chờ</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State / Conversation List */}
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Text style={styles.emptyIcon}>💬</Text>
        </View>
        <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
        <Text style={styles.emptySubtitle}>
          Hãy tìm kiếm tên bạn bè để kết bạn và bắt đầu trò chuyện thời gian thực 1-1!
        </Text>
        <TouchableOpacity style={styles.startChatButton} onPress={onOpenSearch} activeOpacity={0.8}>
          <Text style={styles.startChatButtonText}>+ Bắt đầu trò chuyện mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarButton: {
    marginRight: 12,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  topBarCenter: {
    flex: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  userStatus: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconText: {
    fontSize: 18,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 14,
  },
  clearText: {
    color: '#94a3b8',
    fontSize: 16,
    paddingHorizontal: 6,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  actionChip: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionChipInactive: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionChipText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionChipTextInactive: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  startChatButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
