export interface MockUser {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  status_message?: string;
  is_online: boolean;
  last_seen?: string;
}

export interface MockMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_type: 'text' | 'image';
  content: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface MockConversation {
  id: number;
  peer: MockUser;
  last_message: {
    content: string;
    message_type: 'text' | 'image';
    sender_id: number;
    created_at: string;
    is_read: boolean;
  };
  unread_count: number;
  is_request?: boolean;
}

export interface MockFriendRequest {
  id: number;
  sender: MockUser;
  created_at: string;
  mutual_friends?: number;
}

export const CURRENT_USER: MockUser = {
  id: 0,
  username: '',
  email: '',
  avatar_url: null,
  is_online: false,
};

export const MOCK_CONVERSATIONS: MockConversation[] = [];
export const MOCK_FRIEND_REQUESTS: MockFriendRequest[] = [];
export const MOCK_MESSAGES_CONV_101: MockMessage[] = [];
export const MOCK_SEARCH_USERS: any[] = [];
