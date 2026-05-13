import { useState, useEffect, useRef } from 'react';
import { ReactionBar } from './ReactionBar';
import { ReactionPicker } from './ReactionPicker';

type Reaction = {
  emoji: string;
  users: string[];
};

type Message = {
  _id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
  reactions: Reaction[];
};

const COLORS = [
  'text-[#5DCAA5]',
  'text-[#F0997B]',
  'text-[#AFA9EC]',
  'text-[#85B7EB]',
  'text-[#ED93B1]',
];

const AVATAR_COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
];

function getColorIndex(str: string) {
  return str.charCodeAt(0) % COLORS.length;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Props = {
  message: Message;
  isDark: boolean;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
};

export function MessageItem({
  message,
  isDark,
  currentUserId,
  onReact,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const index = getColorIndex(message.senderUsername);
  const nameColor = COLORS[index];
  const avatarColor = AVATAR_COLORS[index];

  useEffect(() => {
    if (!showPicker) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  return (
    <div className="flex gap-3 group relative"> {/* ← прибрав onMouseLeave */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5 ${avatarColor.bg} ${avatarColor.text}`}
      >
        {message.senderUsername.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className={`text-[13px] font-medium ${nameColor}`}>
            {message.senderUsername}
          </span>
          <span
            className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            {formatTime(message.createdAt)}
          </span>

          <button
            onClick={() => setShowPicker((prev) => !prev)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-sm ml-1"
            title="Додати реакцію"
          >
            😊
          </button>
        </div>

        <p
          className={`text-[13px] leading-relaxed ${isDark ? 'text-[#dbdee1]' : 'text-gray-700'}`}
        >
          {message.text}
        </p>

        <ReactionBar
          reactions={message.reactions}
          currentUserId={currentUserId}
          isDark={isDark}
          onReact={(emoji) => onReact(message._id, emoji)}
        />

        {showPicker && (
          <div ref={pickerRef} className="relative">
            <ReactionPicker
              isDark={isDark}
              onSelect={(emoji) => {
                onReact(message._id, emoji);
                setShowPicker(false);
              }}
              onClose={() => setShowPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}