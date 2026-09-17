/**
 * Bộ Emoji & Reactions chuẩn phong cách Messenger
 */

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Cảm xúc',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
      '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
      '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦',
      '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
      '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿',
      '💀', '💩', '🤡', '👻', '👽', '🤖',
    ],
  },
  {
    id: 'gestures',
    name: 'Cử chỉ',
    icon: '👍',
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘',
      '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
      '🖖', '👋', '🤙', '💪', '🖕', '✍️', '🙏', '🤝', '👏', '🙌',
      '👐', '🤲', '🤝', '💅', '🤳', '👂', '👃', '👀', '👁️', '👅',
    ],
  },
  {
    id: 'hearts',
    name: 'Trái tim',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌',
      '💋', '💍', '💐', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞',
    ],
  },
  {
    id: 'party',
    name: 'Ăn mừng',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀',
      '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🎮', '🎲', '🎯', '🎨',
      '🎭', '🎪', '🎫', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎷',
    ],
  },
  {
    id: 'food',
    name: 'Đồ ăn',
    icon: '🍕',
    emojis: [
      '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷', '🍸', '🍹',
      '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🍜', '🍲', '🍣',
      '🍱', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🍫', '🍬',
      '🍭', '🍎', '🍓', '🍉', '🍇', '🍌', '🥑', '🌽', '🧀', '🍗',
    ],
  },
  {
    id: 'symbols',
    name: 'Biểu tượng',
    icon: '🔥',
    emojis: [
      '🔥', '💯', '✨', '⭐', '🌟', '💥', '⚡', '🌈', '☀️', '🌙',
      '☁️', '❄️', '💎', '💡', '🚀', '✈️', '🚗', '🏠', '🔔', '📌',
      '📍', '⚠️', '❌', '✅', '❓', '❗', '⏰', '⏳', '💰', '💵',
    ],
  },
];

export interface ReactionItem {
  id: string;
  emoji: string;
  label: string;
}

// 6 Reaction kinh điển của Facebook Messenger
export const MESSENGER_REACTIONS: ReactionItem[] = [
  { id: 'like', emoji: '👍', label: 'Thích' },
  { id: 'love', emoji: '❤️', label: 'Yêu thích' },
  { id: 'haha', emoji: '😂', label: 'Haha' },
  { id: 'wow', emoji: '😮', label: 'Wow' },
  { id: 'sad', emoji: '😢', label: 'Buồn' },
  { id: 'angry', emoji: '😡', label: 'Phẫn nộ' },
];

/**
 * Kiểm tra xem tin nhắn có phải chỉ toàn Emoji không (tối đa 3 emoji).
 * Dùng để hiển thị Jumbo Emoji kích thước lớn như Messenger.
 */
export function isOnlyEmojis(text: string): { isOnly: boolean; count: number } {
  if (!text) return { isOnly: false, count: 0 };
  const trimmed = text.trim();
  if (!trimmed) return { isOnly: false, count: 0 };

  // Regex nhận diện các ký tự Emoji Unicode (kể cả ghép dính ZWJ, skin tones)
  const emojiRegex = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+$/u;
  if (!emojiRegex.test(trimmed)) {
    return { isOnly: false, count: 0 };
  }

  // Tách các cluster emoji thực tế bằng Intl.Segmenter nếu có, hoặc match regex
  let emojiList: string[] = [];
  try {
    if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
      const segmenter = new (Intl as any).Segmenter('vi', { granularity: 'grapheme' });
      for (const seg of segmenter.segment(trimmed)) {
        if (seg.segment.trim()) {
          emojiList.push(seg.segment);
        }
      }
    } else {
      const matches = trimmed.match(/\p{Extended_Pictographic}/gu);
      emojiList = matches || [];
    }
  } catch {
    const matches = trimmed.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\S/gu);
    emojiList = matches || [];
  }

  const count = emojiList.length;
  // Jumbo emoji chỉ áp dụng cho từ 1 đến 3 emoji
  if (count >= 1 && count <= 3) {
    return { isOnly: true, count };
  }

  return { isOnly: false, count: 0 };
}
