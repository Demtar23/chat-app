import { useState, useEffect, useRef } from 'react';
import { ReactionBar } from './ReactionBar';
import { ReactionPicker } from './ReactionPicker';
import { MessageStatus } from './MessageStatus';
import type { Message, ReplyTo } from '../../../types/message';
import type { UserProfile } from '../../../types/user';
import { Avatar } from './Avatar';
import { getTheme } from '../../../styles/theme';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../icons/icons';

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
  onUserHover: (user: UserProfile, position: { x: number; y: number }) => void;
  onUserLeave: () => void;
  allUsers: UserProfile[];
  onOpenProfile: (user: UserProfile) => void;
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
  onUserHover,
  onUserLeave,
  allUsers,
  onOpenProfile,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const pickerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnMessage = message.senderId === currentUserId;
  const showStatus = isOwnMessage && message.type === 'private';

  const isDeleted = message.isDeleted;
  const isDeletedForMe = message.deletedFor?.includes(currentUserId);

  const { t } = useTranslation();

  const theme = getTheme(isDark);

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

  const hoverUser = allUsers.find((u) => u._id === message.senderId) ?? {
    _id: message.senderId,
    username: message.senderUsername,
  };

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
        onClick={() => {
          onOpenProfile(hoverUser);
        }}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();

          onUserHover(hoverUser, {
            x: rect.right + 12,
            y: rect.top,
          });
        }}
        onMouseLeave={onUserLeave}
        className="relative flex-shrink-0 mt-0.5 cursor-pointer"
      >
        <Avatar
          username={hoverUser.username}
          avatar={hoverUser.avatar}
          size="sm"
          isDark={isDark}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span
            onClick={() => onOpenProfile(hoverUser)}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();

              onUserHover(hoverUser, {
                x: rect.right + 12,
                y: rect.top,
              });
            }}
            onMouseLeave={onUserLeave}
            className={`text-[13px] font-medium cursor-pointer hover:underline ${theme.textPrimary}`}
          >
            {message.senderUsername}
          </span>

          <span className={`text-[11px] ${theme.textFaint}`}>
            {formatTime(message.createdAt)}
          </span>
          {message.isPinned && !isDeleted && (
            <span
              className="text-[10px] text-[#5865f2]"
              title={t('messages.system.pinned')}
            >
              <Icons.pin className="w-4 h-4 text-red-500" />
            </span>
          )}

          {message.isEdited && !isDeleted && (
            <span className={`text-[10px] ${theme.textFaintest}`}>
              {t('messages.system.edited')}
            </span>
          )}

          {showStatus && (
            <MessageStatus status={message.status} isDark={isDark} />
          )}

          {!isDeleted && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
              <button
                onClick={() => setShowPicker((prev) => !prev)}
                className="text-sm"
                title={t('messages.actions.react')}
              >
                <Icons.react
                  className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                />
              </button>

              <button
                onClick={() =>
                  onReply({
                    messageId: message._id,
                    text: message.text,
                    senderUsername: message.senderUsername,
                  })
                }
                className={`text-xs px-1 ${theme.textFaint} ${theme.bgHover}`}
                title={t('messages.actions.reply')}
              >
                <Icons.reply
                  className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className={`text-xs px-1 ${theme.textFaint} ${theme.bgHover}`}
                  title={t('messages.actions.more')}
                >
                  <Icons.more
                    className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                  />
                </button>
                {showMenu && (
                  <div
                    className={`absolute top-5 left-0 z-20 rounded-lg shadow-xl border min-w-[140px] py-1 ${theme.bgSecondary} ${theme.border}`}
                  >
                    {isOwnMessage && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditText(message.text);
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm ${theme.textSecondary} ${theme.bgHover}`}
                      >
                        <Icons.edit className="w-4 h-4" />
                        {t('messages.actions.edit')}
                      </button>
                    )}
                    {isOwnMessage && (
                      <button
                        onClick={() => {
                          onDeleteForAll(message._id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        <Icons.delete className="w-5 h-5 text-red-400" />
                        {t('messages.actions.deleteForAll')}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDeleteForMe(message._id);
                        setShowMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm ${theme.textSecondary} ${theme.bgHover}`}
                    >
                      <Icons.eyeOff className="w-4 h-4" />
                      {t('messages.actions.deleteForMe')}
                    </button>

                    <button
                      onClick={() => {
                        onPin(message._id, message.isPinned);
                        setShowMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm ${theme.textSecondary} ${theme.bgHover}`}
                    >
                      {message.isPinned ? (
                        <>
                          <Icons.unpin className="w-4 h-4" />
                          {t('messages.actions.unpin')}
                        </>
                      ) : (
                        <>
                          <Icons.pin className="w-4 h-4" />
                          {t('messages.actions.pin')}
                        </>
                      )}
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
              <p className={`text-[11px] truncate ${theme.textFaint}`}>
                {message.replyTo.text}
              </p>
            </div>
          </div>
        )}

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
              className={`flex-1 text-sm px-2 py-1 rounded outline-none border focus:border-[#5865f2] ${theme.bgMessage} ${theme.textPrimary} ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
            />
            <button
              onClick={handleEditSubmit}
              className="text-xs px-2 py-1 bg-[#5865f2] text-white rounded"
            >
              {t('messages.actions.save')}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={`text-xs px-2 py-1 rounded ${isDark ? 'text-gray-400 hover:bg-[#35373c]' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {t('messages.actions.cancel')}
            </button>
          </div>
        ) : (
          <p
            className={`text-[13px] leading-relaxed ${isDeleted ? 'italic' : ''} ${
              isDeleted ? theme.textFaintest : theme.textSecondary
            }`}
          >
            {isDeleted ? t('messages.system.deleted') : message.text}
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
