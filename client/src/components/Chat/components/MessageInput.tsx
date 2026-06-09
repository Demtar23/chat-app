import { useRef, useState } from 'react';
import { getSocket } from '../../../services/socket';
import type { ActiveChat } from '../../../types/chat';
import { getTheme } from '../../../styles/theme';
import { useTranslation } from 'react-i18next';

type Props = {
  onSend: (text: string) => void;
  isDark: boolean;
  activeChat: ActiveChat;
  isSending?: boolean;
  isSocketDisconnected?: boolean;
};

export function MessageInput({
  onSend,
  isDark,
  activeChat,
  isSending = false,
  isSocketDisconnected = false,
}: Props) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = getTheme(isDark);
  const { t } = useTranslation();

  function handleTyping(value: string) {
    setText(value);
    const socket = getSocket();
    if (!socket) return;

    socket.emit('typing:start', {
      type: activeChat.type,
      roomId: activeChat.type === 'room' ? activeChat.roomId : undefined,
      receiverId: activeChat.type === 'private' ? activeChat.userId : undefined,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', {
        type: activeChat.type,
        roomId: activeChat.type === 'room' ? activeChat.roomId : undefined,
        receiverId:
          activeChat.type === 'private' ? activeChat.userId : undefined,
      });
    }, 2000);
  }

  function placeholderFor(activeChat: ActiveChat) {
    if (activeChat.type === 'global') return t('messageInput.placeholderGlobal');
    if (activeChat.type === 'room') return `${t('messageInput.placeholderRoom')}${activeChat.roomName}`;
    return `${t('messageInput.placeholderPrivate')}${activeChat.username}`;
  }

  function handleSend() {
    if (!text.trim() || isSending || isSocketDisconnected) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('typing:stop', {
        type: activeChat.type,
        roomId: activeChat.type === 'room' ? activeChat.roomId : undefined,
        receiverId:
          activeChat.type === 'private' ? activeChat.userId : undefined,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onSend(text);
    setText('');
  }

  const inputDisabled = isSending || isSocketDisconnected;
  const socket = getSocket();
  const cannotSend = inputDisabled || !socket?.connected;

  return (
    <div
      className={`px-4 py-3 border-t flex items-center gap-3 flex-shrink-0 transition-colors duration-200 ${theme.bgTertiary} ${theme.border}`}
    >
      <input
        value={text}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !cannotSend && handleSend()}
        disabled={cannotSend}
        placeholder={placeholderFor(activeChat)}
        className={`flex-1 rounded-lg px-4 py-2.5 text-sm outline-none transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${theme.bgMessage} ${theme.textSecondary} placeholder:${theme.textFaint}`}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={cannotSend || !text.trim()}
        className={`text-white text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-150 ${
          cannotSend || !text.trim()
            ? 'bg-[#5865f2]/50 cursor-not-allowed'
            : 'bg-[#5865f2] hover:bg-[#4752c4] active:scale-[0.98]'
        }`}
      >
        {isSending ? (
          <>
            <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('messageInput.sending')}
          </>
        ) : (
          t('messageInput.send')
        )}
      </button>
    </div>
  );
}
