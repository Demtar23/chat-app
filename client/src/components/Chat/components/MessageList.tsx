import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { MessageThreadSkeleton } from './ChatSkeletons';
import type { Message, ReplyTo } from '../../../types/message';
import type { UserProfile } from '../../../types/user';

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
  isLoading?: boolean;
  onUserHover: (user: UserProfile, position: { x: number; y: number }) => void;
  onUserLeave: () => void;
  allUsers: UserProfile[];
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
  isLoading = false,
  onUserHover,
  onUserLeave,
  allUsers,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' }); // було smooth
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isLoading) return;

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
  }, [pinnedMessageIds, messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className={`messages-container flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0 transition-opacity duration-200 ease-out ${
        isDark ? 'bg-[#313338]' : 'bg-white'
      } ${isLoading ? 'opacity-95' : 'opacity-100'}`}
    >
      {isLoading ? (
        <MessageThreadSkeleton isDark={isDark} />
      ) : (
        <>
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
              onUserHover={onUserHover}
              onUserLeave={onUserLeave}
              allUsers={allUsers}
            />
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}
