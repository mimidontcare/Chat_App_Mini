import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { WebDesktopLayout } from '../components/web/WebDesktopLayout';
import { WebAuthScreen } from '../components/web/WebAuthScreen';
import { WebConversationItemData, WebPeerData } from '../components/web/types';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const AppNavigator: React.FC = () => {
  const { user, logout } = useAuth();

  const isAuthenticated = !!user;
  const activeUser = user;

  // Conversations and badge states
  const [conversations, setConversations] = useState<WebConversationItemData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WebConversationItemData | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const selectedConversationRef = useRef(selectedConversation);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // 1. Fetch conversations & message requests from backend
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingConversations(true);
      const [convRes, reqRes] = await Promise.all([
        api.get('/conversations').catch(() => ({ data: { success: false, conversations: [] } })),
        api.get('/conversations/requests').catch(() => ({ data: { success: false, requests: [] } })),
      ]);

      const normalList: WebConversationItemData[] =
        convRes.data?.success && Array.isArray(convRes.data.conversations)
          ? convRes.data.conversations.map((c: any) => ({ ...c, is_request: false }))
          : [];

      const requestList: WebConversationItemData[] =
        reqRes.data?.success && Array.isArray(reqRes.data.requests)
          ? reqRes.data.requests.map((r: any) => ({
              ...r,
              is_request: true,
              status: 'message_request',
            }))
          : [];

      const combined = [...requestList, ...normalList].sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || (a.last_message?.created_at) || 0).getTime();
        const timeB = new Date(b.updated_at || b.created_at || (b.last_message?.created_at) || 0).getTime();
        return timeB - timeA;
      });

      setConversations(combined);
      const unreadTotal = combined.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setUnreadMessagesCount(unreadTotal);
      if (!selectedConversationRef.current && combined.length > 0) {
        setSelectedConversation(combined[0]);
      } else if (combined.length === 0) {
        setSelectedConversation(null);
      }
    } catch {
      setConversations([]);
      setUnreadMessagesCount(0);
      setSelectedConversation(null);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isAuthenticated]);

  // 2. Fetch badges
  const fetchBadges = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [notifRes, friendRes] = await Promise.all([
        api.get('/notifications/unread-count').catch(() => ({ data: { unread_count: 0 } })),
        api.get('/friends/requests').catch(() => ({ data: { requests: [] } })),
      ]);
      setUnreadNotificationsCount(notifRes.data?.unread_count || 0);
      setFriendRequestsCount(friendRes.data?.requests?.length || 0);
    } catch {
      setUnreadNotificationsCount(0);
      setFriendRequestsCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      fetchBadges();
    }
  }, [isAuthenticated, fetchConversations, fetchBadges]);

  // 3. Socket Realtime listeners for web desktop
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeMessage = (data: any) => {
      if (!data) return;
      const actualMessage = data.last_message ? data.last_message : data;
      const convId = Number(data.conversation_id || actualMessage.conversation_id);

      if (!convId || !actualMessage) return;

      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => Number(c.id) === convId);

        if (existingIndex > -1) {
          const currentConv = prev[existingIndex];
          const isCurrentActive = selectedConversationRef.current?.id === convId;
          const isFromPeer = actualMessage.sender_id !== activeUser?.id;

          const updatedConv: WebConversationItemData = {
            ...currentConv,
            last_message: actualMessage,
            updated_at: actualMessage.created_at || new Date().toISOString(),
            unread_count:
              isCurrentActive || !isFromPeer
                ? 0
                : (currentConv.unread_count || 0) + 1,
          };

          const rest = prev.filter((_, idx) => idx !== existingIndex);
          return [updatedConv, ...rest];
        } else {
          // Stranger message request or new conversation: fetch immediately
          fetchConversations();
          return prev;
        }
      });

      fetchBadges();
    };

    const handleMessagesMarkedRead = (data: { conversation_id: number }) => {
      const convId = Number(data.conversation_id);
      if (!convId) return;

      setConversations((prev) =>
        prev.map((c) =>
          Number(c.id) === convId ? { ...c, unread_count: 0 } : c
        )
      );
      setUnreadMessagesCount((prev) => Math.max(0, prev - 1));
    };

    const handleNewNotification = (notif: any) => {
      fetchBadges();
      // If notification is about a message request, reload conversations
      if (notif?.type === 'message_request' || notif?.data?.type === 'message_request') {
        fetchConversations();
      }
    };

    const handleOnlineUsersList = (onlineIds: number[]) => {
      if (!Array.isArray(onlineIds)) return;
      const idSet = new Set(onlineIds.map(Number));
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          peer: {
            ...c.peer,
            is_online: idSet.has(Number(c.peer?.id)),
          },
        }))
      );
    };

    const handleUserOnline = (data: { userId: number }) => {
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.peer?.id) === Number(data.userId)
            ? { ...c, peer: { ...c.peer, is_online: true } }
            : c
        )
      );
    };

    const handleUserOffline = (data: { userId: number }) => {
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.peer?.id) === Number(data.userId)
            ? { ...c, peer: { ...c.peer, is_online: false } }
            : c
        )
      );
    };

    socket.on('receive_message', handleRealtimeMessage);
    socket.on('conversation_updated', handleRealtimeMessage);
    socket.on('messages_marked_read', handleMessagesMarkedRead);
    socket.on('new_notification', handleNewNotification);
    socket.on('online_users_list', handleOnlineUsersList);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    socket.emit('get_online_users');

    return () => {
      socket.off('receive_message', handleRealtimeMessage);
      socket.off('conversation_updated', handleRealtimeMessage);
      socket.off('messages_marked_read', handleMessagesMarkedRead);
      socket.off('new_notification', handleNewNotification);
      socket.off('online_users_list', handleOnlineUsersList);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [activeUser?.id, fetchBadges, fetchConversations, isAuthenticated]);

  // 4. Start chat with peer action
  const handleStartChatWithPeer = async (peer: WebPeerData) => {
    const existing = conversations.find((c) => Number(c.peer?.id) === Number(peer.id));
    if (existing) {
      setSelectedConversation(existing);
      return;
    }

    try {
      const res = await api.post('/conversations/init', { peer_id: peer.id });
      if (res.data?.success && res.data?.conversation) {
        const newConv: WebConversationItemData = res.data.conversation;
        setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
        setSelectedConversation(newConv);
        return;
      }
    } catch {
      // fallback
    }

    const fallbackConv: WebConversationItemData = {
      id: Date.now(),
      peer,
      last_message: null,
      unread_count: 0,
      updated_at: new Date().toISOString(),
    };
    setConversations((prev) => [fallbackConv, ...prev]);
    setSelectedConversation(fallbackConv);
  };

  // 5. Update conversation locally
  const handleConversationUpdated = useCallback((updatedConv: any) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedConv.id);
      if (idx > -1) {
        const current = prev[idx];
        if (
          current.unread_count === updatedConv.unread_count &&
          current.last_message?.id === updatedConv.last_message?.id &&
          current.updated_at === updatedConv.updated_at &&
          current.status === updatedConv.status &&
          current.is_request === updatedConv.is_request
        ) {
          return prev;
        }
        const next = [...prev];
        next[idx] = { ...next[idx], ...updatedConv };
        return next;
      }
      return prev;
    });
  }, []);

  // Render Auth flow if not logged in
  if (!isAuthenticated) {
    return <WebAuthScreen onDemoLogin={() => {}} />;
  }

  // Render Web Desktop Workspace (Sidebar + Conversation List + Main Chat)
  return (
    <WebDesktopLayout
      user={activeUser}
      conversations={conversations}
      selectedConversation={selectedConversation}
      onSelectConversation={(conv) => setSelectedConversation(conv)}
      isLoadingConversations={isLoadingConversations}
      unreadMessagesCount={unreadMessagesCount}
      friendRequestsCount={friendRequestsCount}
      unreadNotificationsCount={unreadNotificationsCount}
      onUnreadNotificationsCountChange={(count) => setUnreadNotificationsCount(count)}
      onStartChatWithPeer={handleStartChatWithPeer}
      onLogout={logout}
      onConversationUpdated={handleConversationUpdated}
    />
  );
};
