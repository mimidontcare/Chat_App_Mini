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
  id: 1,
  username: 'Alex Nguyen',
  email: 'alex.nguyen@example.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  status_message: 'Available to chat',
  is_online: true,
};

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 101,
    peer: {
      id: 2,
      username: 'Sarah Miller',
      email: 'sarah.m@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      is_online: true,
      last_seen: 'Just now',
    },
    last_message: {
      content: 'Are we still meeting at 3 PM today?',
      message_type: 'text',
      sender_id: 2,
      created_at: '10:42 AM',
      is_read: false,
    },
    unread_count: 2,
  },
  {
    id: 102,
    peer: {
      id: 3,
      username: 'David Chen',
      email: 'david.c@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      is_online: false,
      last_seen: '15m ago',
    },
    last_message: {
      content: 'I sent the design mockups over.',
      message_type: 'text',
      sender_id: 1,
      created_at: '9:15 AM',
      is_read: true,
    },
    unread_count: 0,
  },
  {
    id: 103,
    peer: {
      id: 4,
      username: 'Elena Rostova',
      email: 'elena.r@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      is_online: true,
      last_seen: 'Active now',
    },
    last_message: {
      content: 'Sent a photo',
      message_type: 'image',
      sender_id: 4,
      created_at: 'Yesterday',
      is_read: true,
    },
    unread_count: 0,
  },
  {
    id: 104,
    peer: {
      id: 5,
      username: 'Marcus Vance',
      email: 'marcus.v@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      is_online: false,
      last_seen: '2 hours ago',
    },
    last_message: {
      content: 'Sounds good! See you soon.',
      message_type: 'text',
      sender_id: 5,
      created_at: 'Monday',
      is_read: true,
    },
    unread_count: 0,
  },
  {
    id: 105,
    peer: {
      id: 6,
      username: 'Chloe Bennett',
      email: 'chloe.b@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      is_online: false,
      last_seen: 'Yesterday',
    },
    last_message: {
      content: 'Can you review this pull request?',
      message_type: 'text',
      sender_id: 6,
      created_at: 'Sep 12',
      is_read: true,
    },
    unread_count: 0,
  },
];

export const MOCK_MESSAGES_CONV_101: MockMessage[] = [
  {
    id: 1,
    conversation_id: 101,
    sender_id: 2,
    message_type: 'text',
    content: 'Hi Alex! How is the chat app project going?',
    is_read: true,
    created_at: '10:30 AM',
  },
  {
    id: 2,
    conversation_id: 101,
    sender_id: 1,
    message_type: 'text',
    content: 'Hey Sarah! We just finished the UI/UX design system and it looks super clean.',
    is_read: true,
    created_at: '10:32 AM',
  },
  {
    id: 3,
    conversation_id: 101,
    sender_id: 2,
    message_type: 'text',
    content: 'Awesome! Did you add image previews and typing indicator?',
    is_read: true,
    created_at: '10:35 AM',
  },
  {
    id: 4,
    conversation_id: 101,
    sender_id: 1,
    message_type: 'image',
    content: 'Check out the mobile screen layout!',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    is_read: true,
    created_at: '10:38 AM',
  },
  {
    id: 5,
    conversation_id: 101,
    sender_id: 2,
    message_type: 'text',
    content: 'That looks fantastic! Are we still meeting at 3 PM today?',
    is_read: false,
    created_at: '10:42 AM',
  },
];

export const MOCK_FRIEND_REQUESTS: MockFriendRequest[] = [
  {
    id: 201,
    sender: {
      id: 7,
      username: 'Liam Watson',
      email: 'liam.w@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
      is_online: true,
    },
    created_at: '2 hours ago',
    mutual_friends: 4,
  },
  {
    id: 202,
    sender: {
      id: 8,
      username: 'Maya Lin',
      email: 'maya.lin@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      is_online: false,
    },
    created_at: 'Yesterday',
    mutual_friends: 1,
  },
];

export const MOCK_MESSAGE_REQUESTS: MockConversation[] = [
  {
    id: 301,
    peer: {
      id: 9,
      username: 'Oliver Vance',
      email: 'oliver.v@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
      is_online: false,
      last_seen: '1 day ago',
    },
    last_message: {
      content: 'Hello! I found your profile through the community board.',
      message_type: 'text',
      sender_id: 9,
      created_at: 'Yesterday',
      is_read: false,
    },
    unread_count: 1,
    is_request: true,
  },
];

export const MOCK_SEARCH_USERS: (MockUser & { relation: 'friend' | 'stranger' | 'pending_sent' | 'pending_received' | 'self' })[] = [
  {
    id: 1,
    username: 'Alex Nguyen',
    email: 'alex.nguyen@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    is_online: true,
    relation: 'self',
  },
  {
    id: 2,
    username: 'Sarah Miller',
    email: 'sarah.m@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    is_online: true,
    relation: 'friend',
  },
  {
    id: 7,
    username: 'Liam Watson',
    email: 'liam.w@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    is_online: true,
    relation: 'pending_received',
  },
  {
    id: 10,
    username: 'Sophia Garcia',
    email: 'sophia.g@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
    is_online: false,
    relation: 'pending_sent',
  },
  {
    id: 11,
    username: 'Lucas Martin',
    email: 'lucas.m@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    is_online: true,
    relation: 'stranger',
  },
];
