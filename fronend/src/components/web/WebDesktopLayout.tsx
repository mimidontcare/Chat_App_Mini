import React, { useState, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { WebSidebar } from './WebSidebar';
import { WebConversationList } from './WebConversationList';
import { WebChatArea } from './WebChatArea';
import { WebEmptyChat } from './WebEmptyChat';
import { WebFriendsPanel } from './WebFriendsPanel';
import { WebSearchPanel } from './WebSearchPanel';
import { WebNotificationPanel } from './WebNotificationPanel';
import { WebProfileModal } from './WebProfileModal';
import {
  WebActiveTab,
  WebConversationItemData,
  WebPeerData,
} from './types';

interface WebDesktopLayoutProps {
  user: any;
  conversations: WebConversationItemData[];
  selectedConversation: WebConversationItemData | null;
  onSelectConversation: (conv: WebConversationItemData | null) => void;
  isLoadingConversations: boolean;
  unreadMessagesCount: number;
  friendRequestsCount: number;
  unreadNotificationsCount: number;
  onUnreadNotificationsCountChange?: (count: number) => void;
  onStartChatWithPeer: (peer: WebPeerData) => void;
  onLogout: () => void;
  onConversationUpdated?: (updatedConv: any) => void;
}

export const WebDesktopLayout: React.FC<WebDesktopLayoutProps> = ({
  user,
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoadingConversations,
  unreadMessagesCount,
  friendRequestsCount,
  unreadNotificationsCount,
  onUnreadNotificationsCountChange,
  onStartChatWithPeer,
  onLogout,
  onConversationUpdated,
}) => {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<WebActiveTab>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'requests'>('all');
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // Responsive Breakpoints
  const isMobileWeb = width < 768;
  const isTablet = width >= 768 && width <= 1024;

  const middleWidth = isTablet ? 300 : 340;

  return (
    <View
      style={[
        styles.rootContainer,
        {
          backgroundColor: isDark ? '#080C14' : '#F1F5F9',
        },
      ]}
    >
      {/* 1. Left Column: Sidebar Dock */}
      {(!isMobileWeb || !selectedConversation) && (
        <WebSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          unreadMessagesCount={unreadMessagesCount}
          friendRequestsCount={friendRequestsCount}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenProfile={() => setIsProfileModalVisible(true)}
          onLogout={onLogout}
        />
      )}

      {/* 2. Middle Column: Secondary Panel (Conversations / Friends / Search / Notifications) */}
      {(!isMobileWeb || !selectedConversation) && (
        <View style={{ width: isMobileWeb ? width - 68 : middleWidth, height: '100%' }}>
          {activeTab === 'chats' && (
            <WebConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id || null}
              onSelectConversation={(conv) => onSelectConversation(conv)}
              isLoading={isLoadingConversations}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterMode={filterMode}
              onFilterChange={setFilterMode}
              onStartNewChat={() => setActiveTab('search')}
            />
          )}

          {activeTab === 'friends' && (
            <WebFriendsPanel
              onStartChat={(peer) => {
                onStartChatWithPeer(peer);
                setActiveTab('chats');
              }}
            />
          )}

          {activeTab === 'search' && (
            <WebSearchPanel
              onStartChat={(peer) => {
                onStartChatWithPeer(peer);
                setActiveTab('chats');
              }}
            />
          )}

          {activeTab === 'notifications' && (
            <WebNotificationPanel
              onOpenFriends={() => setActiveTab('friends')}
              onOpenChatWithPeer={(peerId) => {
                const targetConv = conversations.find((c) => c.peer?.id === peerId);
                if (targetConv) {
                  onSelectConversation(targetConv);
                  setActiveTab('chats');
                }
              }}
              onUnreadCountChange={onUnreadNotificationsCountChange}
              onOpenMessageRequests={() => {
                setFilterMode('requests');
                setActiveTab('chats');
              }}
            />
          )}
        </View>
      )}

      {/* 3. Right Column: Main Chat Area or Empty Chat State */}
      {(!isMobileWeb || !!selectedConversation) && (
        <View style={styles.mainContent}>
          {selectedConversation ? (
            <WebChatArea
              key={selectedConversation.id}
              conversation={selectedConversation}
              showBackButton={isMobileWeb}
              onBackPress={() => onSelectConversation(null)}
              onConversationUpdated={onConversationUpdated}
            />
          ) : (
            <WebEmptyChat
              onOpenSearch={() => setActiveTab('search')}
              onOpenFriends={() => setActiveTab('friends')}
            />
          )}
        </View>
      )}

      {/* Profile Modal */}
      <WebProfileModal
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
        onLogout={onLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          minHeight: '100vh',
          maxHeight: '100vh',
        } as any)
      : {}),
  },
  mainContent: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
});
