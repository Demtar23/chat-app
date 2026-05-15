import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import type { Message } from '../../../types/message';

type Props = {
  messages: Message[];
  isDark: boolean;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, text: string) => void;
  onDeleteForAll: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
};

export function MessageList({
  messages,
  isDark,
  currentUserId,
  onReact,
  onEdit,
  onDeleteForAll,
  onDeleteForMe,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 ${isDark ? 'bg-[#313338]' : 'bg-white'}`}>
      {messages.map((message) => (
        <MessageItem
          key={message._id}
          message={message}
          isDark={isDark}
          currentUserId={currentUserId}
          onReact={onReact}
          onEdit={onEdit}
          onDeleteForAll={onDeleteForAll}
          onDeleteForMe={onDeleteForMe}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}