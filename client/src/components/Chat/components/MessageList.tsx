import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { MessageItem } from './MessageItem';
import { MessageThreadSkeleton } from './ChatSkeletons';
import type { Message, ReplyTo } from '../../../types/message';
import type { UserProfile } from '../../../types/user';
import { DateSeparator } from './DateSeparator';
import type { ActiveChat } from '../../../types/chat';
import { EmptyChat } from './EmptyChat';

type Props = {
  messages: Message[];
  isDark: boolean;
  activeChat: ActiveChat;
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
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore: () => void;
  chatKey: string;
  onUserHover: (user: UserProfile, position: { x: number; y: number }) => void;
  onUserLeave: () => void;
  allUsers: UserProfile[];
  onOpenProfile: (user: UserProfile) => void;
  isNavigatingRef: React.RefObject<boolean>;
};

export function MessageList({
  messages,
  isDark,
  activeChat,
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
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  chatKey,
  onUserHover,
  onUserLeave,
  allUsers,
  onOpenProfile,
  isNavigatingRef,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);
  const prevChatKeyRef = useRef(chatKey);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const prevScrollHeightRef = useRef(0);
  const prevFirstMessageIdRef = useRef('');

  function checkShouldLoadMore() {
    const container = containerRef.current;
    if (!container) return;

    if (isNavigatingRef.current) return;
    if (isLoadingMoreRef.current || !hasMore) return;

    const threshold = 150;

    if (container.scrollTop <= threshold) {
      onLoadMore();
    }
  }

  // оновлюємо ref в useEffect — не під час рендеру
  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  // useEffect(() => {
  //   checkShouldLoadMore();
  // }, [messages]);

  useLayoutEffect(() => {
    prevScrollHeightRef.current = containerRef.current?.scrollHeight ?? 0;
    prevFirstMessageIdRef.current = messages[0]?._id ?? '';
  });

  // відновлення позиції скролу після loadMore — синхронно
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (messages[0]?._id !== prevFirstMessageIdRef.current) {
      const diff = container.scrollHeight - prevScrollHeightRef.current;

      if (diff > 0) container.scrollTop += diff;
    }
  }, [messages]);

  // скрол вниз при зміні чату
  useEffect(() => {
    if (isLoading) return;
    if (prevChatKeyRef.current !== chatKey) {
      prevChatKeyRef.current = chatKey;
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, [isLoading, chatKey]);

  // scroll listener
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 300);

    checkShouldLoadMore();
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // pin calculation
  useEffect(() => {
    if (isLoading) return;
    if (pinnedMessageIds.length === 0) {
      onActivePinChange(0);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    function calculateActivePin() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      // знаходимо останнє видиме повідомлення (найнижче у viewport)
      const lastVisibleMessage = [...messages].reverse().find((m) => {
        const el = document.getElementById(`message-${m._id}`);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < containerRect.bottom;
      });

      let activeIndex = 0;

      pinnedMessageIds.forEach((id, index) => {
        const pinnedMsg = messages.find((m) => m._id === id);
        if (!pinnedMsg) return;

        const el = document.getElementById(`message-${id}`);

        if (el) {
          // елемент в DOM — рахуємо по позиції
          const rect = el.getBoundingClientRect();
          if (rect.top < containerRect.top + 50) activeIndex = index;
        } else if (lastVisibleMessage) {
          // елемент не в DOM — порівнюємо дати
          // якщо закріплене старіше за останнє видиме → воно вище → вже пройдено
          if (
            new Date(pinnedMsg.createdAt) <=
            new Date(lastVisibleMessage.createdAt)
          ) {
            activeIndex = index;
          }
        }
      });

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      if (isNearBottom) activeIndex = pinnedMessageIds.length - 1;

      onActivePinChange(activeIndex);
    }

    setTimeout(() => calculateActivePin(), 100);
    container.addEventListener('scroll', calculateActivePin, { passive: true });
    return () => container.removeEventListener('scroll', calculateActivePin);
  }, [pinnedMessageIds, messages, isLoading, onActivePinChange]);

  const hasScrolledInitiallyRef = useRef(false);
  useEffect(() => {
    if (!isLoading && !hasScrolledInitiallyRef.current) {
      hasScrolledInitiallyRef.current = true;
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, [isLoading]);

  // скидати при зміні chatKey
  useEffect(() => {
    hasScrolledInitiallyRef.current = false;
  }, [chatKey]);

  return (
    <div
      ref={containerRef}
      className={`messages-container flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0 ${
        isDark ? 'bg-[#313338]' : 'bg-white'
      } ${isLoading ? 'opacity-95' : 'opacity-100'}`}
    >
      {isLoading ? (
        <MessageThreadSkeleton isDark={isDark} />
      ) : messages.length === 0 ? (
        <EmptyChat
          title={
            activeChat.type === 'private'
              ? 'Початок розмови'
              : 'У кімнаті ще немає повідомлень'
          }
          description={
            activeChat.type === 'private'
              ? 'Надішли перше повідомлення та розпочни спілкування.'
              : 'Будь першим, хто напише повідомлення.'
          }
        />
      ) : (
        <>
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <span
                className={`text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Завантаження...
              </span>
            </div>
          )}

          {!hasMore && (
            <div className="flex justify-center py-2">
              <span
                className={`text-xs ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                Початок розмови
              </span>
            </div>
          )}

          {messages.map((message, index) => {
            const prev = messages[index - 1];
            const showDate =
              !prev ||
              new Date(message.createdAt).toDateString() !==
                new Date(prev.createdAt).toDateString();

            return (
              <div key={message._id}>
                {showDate && (
                  <DateSeparator date={message.createdAt} isDark={isDark} />
                )}

                <MessageItem
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
                  onOpenProfile={onOpenProfile}
                />
              </div>
            );
          })}

          <div ref={bottomRef} />
        </>
      )}

      {showScrollButton && !isLoading && (
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
          className={`fixed bottom-20 right-6 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg border transition-all ${
            isDark
              ? 'bg-[#2b2d31] border-[#1e1f22] text-white hover:bg-[#35373c]'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          ↓
        </button>
      )}
    </div>
  );
}
