import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import type { Message, ReplyTo } from '../../../types/message';

type Props = {
  messages: Message[];
  isDark: boolean;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, text: string) => void;
  onDeleteForAll: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onReply: (replyTo: ReplyTo) => void;
  onPin: (messageId: string, isPinned: boolean) => void;
  highlightedId: string | null;
  onScrollToMessage: (messageId: string) => void;
  pinnedMessageIds: string[];
  onActivePinChange: (index: number) => void;
};

export function MessageList({
  messages,
  isDark,
  currentUserId,
  onReact,
  onEdit,
  onDeleteForAll,
  onDeleteForMe,
  onReply,
  onPin,
  highlightedId,
  onScrollToMessage,
  pinnedMessageIds,
  onActivePinChange,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });// було smooth
    });
  }, [messages]);

  // замінити весь useEffect з scroll listener
  useEffect(() => {
    if (pinnedMessageIds.length === 0) {
      onActivePinChange(0);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    function calculateActivePin() {
      const containerRect = container!.getBoundingClientRect();
      let activeIndex = 0;

      pinnedMessageIds.forEach((id, index) => {
        const el = document.getElementById(`message-${id}`);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        if (rect.top < containerRect.top + 50) {
          activeIndex = index;
        }
      });

      // якщо майже внизу — показуємо останній pin
      const isNearBottom =
        container!.scrollHeight -
          (container!.scrollTop + container!.clientHeight) <
        100;

      if (isNearBottom) {
        activeIndex = pinnedMessageIds.length - 1;
      }

      onActivePinChange(activeIndex);
    }

    setTimeout(() => calculateActivePin(), 100);

    container.addEventListener('scroll', calculateActivePin);
    return () => container.removeEventListener('scroll', calculateActivePin);
  }, [pinnedMessageIds, messages]);

  return (
    <div
      ref={containerRef}
      className={`messages-container flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 ${isDark ? 'bg-[#313338]' : 'bg-white'}`}
    >
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
          onReply={onReply}
          onPin={onPin}
          isHighlighted={highlightedId === message._id}
          onScrollToMessage={onScrollToMessage}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
