import { useState, useEffect, useRef } from 'react';
import { ReactionBar } from './ReactionBar';
import { ReactionPicker } from './ReactionPicker';
import { MessageStatus } from './MessageStatus';
import type { Message, ReplyTo } from '../../../types/message';

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
  onEdit: (messageId: string, text: string) => void;
  onDeleteForAll: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onReply: (replyTo: ReplyTo) => void;
  isHighlighted: boolean;
  onScrollToMessage: (messageId: string) => void;
  onPin: (messageId: string, isPinned: boolean) => void;
};

export function MessageItem({
  message,
  isDark,
  currentUserId,
  onReact,
  onEdit,
  onDeleteForAll,
  onDeleteForMe,
  onReply,
  isHighlighted,
  onScrollToMessage,
  onPin,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const pickerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const index = getColorIndex(message.senderUsername);
  const nameColor = COLORS[index];
  const avatarColor = AVATAR_COLORS[index];

  const isOwnMessage = message.senderId === currentUserId;
  const showStatus = isOwnMessage && message.type === 'private';

  const isDeleted = message.isDeleted;
  const isDeletedForMe = message.deletedFor?.includes(currentUserId);

  useEffect(() => {
    if (!showPicker) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  useEffect(() => {
    if (!showMenu) {
      return;
    }
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (isDeletedForMe) {
    return null;
  }

  function handleEditSubmit() {
    if (!editText.trim() || editText === message.text) {
      setIsEditing(false);
      return;
    }
    onEdit(message._id, editText.trim());
    setIsEditing(false);
  }

  return (
    <div
      id={`message-${message._id}`}
      className={`flex gap-3 group relative rounded-md px-1 transition-colors duration-500 ${
        isHighlighted ? (isDark ? 'bg-[#5865f2]/20' : 'bg-blue-50') : ''
      }`}
    >
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
          {message.isPinned && !isDeleted && (
            <span className="text-[10px] text-[#5865f2]" title="Закріплено">
              📌
            </span>
          )}

          {message.isEdited && !isDeleted && (
            <span
              className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            >
              (edited)
            </span>
          )}

          {showStatus && (
            <MessageStatus status={message.status} isDark={isDark} />
          )}

          {/* кнопки при hover */}
          {!isDeleted && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
              <button
                onClick={() => setShowPicker((prev) => !prev)}
                className="text-sm"
                title="Додати реакцію"
              >
                😊
              </button>

              <button
                onClick={() =>
                  onReply({
                    messageId: message._id,
                    text: message.text,
                    senderUsername: message.senderUsername,
                  })
                }
                className={`text-xs px-1 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                title="Відповісти"
              >
                ↩
              </button>

              {/* меню — три крапки */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className={`text-xs px-1 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Більше"
                >
                  ···
                </button>
                {showMenu && (
                  <div
                    className={`absolute top-5 left-0 z-20 rounded-lg shadow-xl border min-w-[140px] py-1 ${isDark ? 'bg-[#2b2d31] border-[#1e1f22]' : 'bg-white border-gray-200'}`}
                  >
                    {isOwnMessage && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditText(message.text);
                          setShowMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-sm ${isDark ? 'text-gray-300 hover:bg-[#35373c]' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        ✏️ Редагувати
                      </button>
                    )}
                    {isOwnMessage && (
                      <button
                        onClick={() => {
                          onDeleteForAll(message._id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        🗑️ Видалити для всіх
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDeleteForMe(message._id);
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm ${isDark ? 'text-gray-300 hover:bg-[#35373c]' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      🙈 Видалити для мене
                    </button>

                    {/* ← pin кнопка тут, всередині меню */}
                    <button
                      onClick={() => {
                        onPin(message._id, message.isPinned);
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm ${isDark ? 'text-gray-300 hover:bg-[#35373c]' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {message.isPinned ? '📌 Відкріпити' : '📌 Закріпити'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {message.replyTo && !isDeleted && (
          <div
            className="flex items-start gap-1 mb-1 pl-2 border-l-2 border-[#5865f2] cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => onScrollToMessage(message.replyTo!.messageId)}
          >
            <div>
              <p className="text-[11px] text-[#5865f2] font-medium">
                {message.replyTo.senderUsername}
              </p>
              <p
                className={`text-[11px] truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              >
                {message.replyTo.text}
              </p>
            </div>
          </div>
        )}

        {/* текст або режим редагування */}
        {isEditing ? (
          <div className="flex gap-2 mt-1">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              className={`flex-1 text-sm px-2 py-1 rounded outline-none border focus:border-[#5865f2] ${isDark ? 'bg-[#383a40] text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
            />
            <button
              onClick={handleEditSubmit}
              className="text-xs px-2 py-1 bg-[#5865f2] text-white rounded"
            >
              Зберегти
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={`text-xs px-2 py-1 rounded ${isDark ? 'text-gray-400 hover:bg-[#35373c]' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Скасувати
            </button>
          </div>
        ) : (
          <p
            className={`text-[13px] leading-relaxed ${isDeleted ? 'italic' : ''} ${isDark ? (isDeleted ? 'text-gray-600' : 'text-[#dbdee1]') : isDeleted ? 'text-gray-400' : 'text-gray-700'}`}
          >
            {message.text}
          </p>
        )}

        {!isDeleted && (
          <ReactionBar
            reactions={message.reactions}
            currentUserId={currentUserId}
            isDark={isDark}
            onReact={(emoji) => onReact(message._id, emoji)}
          />
        )}

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
