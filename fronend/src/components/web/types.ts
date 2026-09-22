export type WebActiveTab = 'chats' | 'friends' | 'notifications' | 'search';

export interface WebPeerData {
  id: number;
  username: string;
  email?: string | null;
  avatar_url?: string | null;
  is_online?: boolean;
  last_seen?: string;
}

export interface WebConversationItemData {
  id: number;
  status?: string;
  is_request?: boolean;
  request_sender_id?: number | null;
  unread_count: number;
  updated_at?: string;
  created_at?: string;
  peer: WebPeerData;
  last_message: {
    id: number;
    content: string;
    message_type: 'text' | 'image';
    sender_id: number;
    is_read: boolean;
    created_at: string;
  } | null;
}

export interface WebChatMessageItem {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_type: 'text' | 'image';
  content: string;
  image_url: string | null;
  is_read: boolean;
  reaction?: string | null;
  reaction_user_id?: number | null;
  created_at: string;
}

export interface WebFriendItemData {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  friend_since?: string;
  is_online?: boolean;
}

export interface WebFriendRequestItemData {
  id: number;
  created_at: string;
  status: string;
  sender: {
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface WebNotificationItemData {
  id: number;
  user_id: number;
  type: 'friend_request' | 'friend_accepted' | 'message_request' | 'system' | string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface WebSearchUserItem {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  relationship: 'none' | 'friend' | 'request_sent' | 'request_received' | 'self';
  is_online?: boolean;
}
