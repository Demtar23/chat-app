import { useRef, useState } from 'react';
import { getSocket } from '../../../services/socket';
import type { ActiveChat } from '../../../types/chat';

type Props = {
  onSend: (text: string) => void;
  isDark: boolean;
  activeChat: ActiveChat;
};

export function MessageInput({ onSend, isDark, activeChat }: Props) {
  const [text, setText] = useState('');

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTyping(value: string) {
    setText(value);

    const socket = getSocket();

    if (!socket) {
      return;
    }

    socket.emit('typing:start', {
      type: activeChat.type,
      roomId: activeChat.type === 'room' ? activeChat.roomId : undefined,
      receiverId: activeChat.type === 'private' ? activeChat.userId : undefined,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', {
        type: activeChat.type,
        roomId: activeChat.type === 'room' ? activeChat.roomId : undefined,
        receiverId:
          activeChat.type === 'private' ? activeChat.userId : undefined,
      });
    }, 5000); //для тестів 5 секунд, потім залишу 1-2 секунди
  }

  function handleSend() {
    if (!text.trim()) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('typing:stop', {
        type: activeChat.type,
        roomId: activeChat.type === 'room' ? activeChat.roomId : undefined,
        receiverId:
          activeChat.type === 'private' ? activeChat.userId : undefined,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    onSend(text);
    setText('');
  }

  return (
    <div
      className={`px-4 py-3 border-t flex items-center gap-3 flex-shrink-0 ${isDark ? 'bg-[#313338] border-[#1e1f22]' : 'bg-white border-gray-200'}`}
    >
      <input
        value={text}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Написати в #global"
        className={`flex-1 rounded-lg px-4 py-2.5 text-sm outline-none ${isDark ? 'bg-[#383a40] text-[#dbdee1] placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
      />
      <button
        onClick={handleSend}
        className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
      >
        Send
      </button>
    </div>
  );
}
