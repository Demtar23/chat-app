import { useEffect, useRef, useState } from 'react';
import {
  fetchGlobalMessages,
  fetchRoomMessages,
  fetchPrivateMessages,
  fetchPinnedMessages,
  searchMessages,
  fetchMessagesAround,
} from '../api/messages.api';
import { getSocket } from '../services/socket';
import { notify } from '../utils/toast';
import type { Message, ReplyTo } from '../types/message';
import type { ActiveChat } from '../types/chat';
import { useTranslation } from 'react-i18next';

export function useMessages(
  accessToken: string | null,
  activeChat: ActiveChat,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activePinnedIndex, setActivePinnedIndex] = useState(0);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isNavigatingRef = useRef(false);

  const { t } = useTranslation();

  function handleSearchClose() {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (!accessToken) return;

    const token = accessToken;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      void loadMessages();
    });

    async function loadMessages() {
      setIsMessagesLoading(true);
      setReplyTo(null);
      setPinnedMessages([]);
      handleSearchClose();
      setHasMore(true);

      try {
        if (activeChat.type === 'global') {
          const data = await fetchGlobalMessages(token);
          if (cancelled) return;
          setMessages(data);
          const pinned = await fetchPinnedMessages(token, 'global');
          if (cancelled) return;
          setPinnedMessages(pinned);
        }

        if (activeChat.type === 'room') {
          const data = await fetchRoomMessages(token, activeChat.roomId);
          if (cancelled) return;
          setMessages(data);
          const pinned = await fetchPinnedMessages(
            token,
            'room',
            activeChat.roomId,
          );
          if (cancelled) return;
          setPinnedMessages(pinned);
        }

        if (activeChat.type === 'private') {
          const data = await fetchPrivateMessages(token, activeChat.userId);
          if (cancelled) return;
          setMessages(data);
          const pinned = await fetchPinnedMessages(
            token,
            'private',
            undefined,
            activeChat.userId,
          );
          if (cancelled) return;
          setPinnedMessages(pinned);
          getSocket()?.emit('messages:seen', activeChat.userId);
        }
      } finally {
        if (!cancelled) setIsMessagesLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [accessToken, activeChat]);

  async function loadMore() {
    if (!accessToken || isLoadingMore || !hasMore) return;
    const firstMessage = messages[0];
    if (!firstMessage) return;

    setIsLoadingMore(true);
    try {
      let older: Message[] = [];
      if (activeChat.type === 'global') {
        older = await fetchGlobalMessages(accessToken, firstMessage._id);
      } else if (activeChat.type === 'room') {
        older = await fetchRoomMessages(
          accessToken,
          activeChat.roomId,
          firstMessage._id,
        );
      } else if (activeChat.type === 'private') {
        older = await fetchPrivateMessages(
          accessToken,
          activeChat.userId,
          firstMessage._id,
        );
      }

      if (older.length === 0) {
        setHasMore(false);
        return;
      }
      if (older.length < 30) setHasMore(false);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m._id));
        const unique = older.filter((m) => !existingIds.has(m._id));
        return [...unique, ...prev].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
    } catch {
      notify.error(t('notify.loadMessagesError'));
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function scrollToMessage(messageId: string) {
    handleSearchClose();

    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      isNavigatingRef.current = true;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(messageId);
      setTimeout(() => {
        setHighlightedId(null);
        isNavigatingRef.current = false;
      }, 1500);
      return;
    }

    if (!accessToken) return;

    try {
      const around = await fetchMessagesAround(
        accessToken,
        messageId,
        activeChat.type,
        activeChat.type === 'room' ? activeChat.roomId : undefined,
        activeChat.type === 'private' ? activeChat.userId : undefined,
      );

      const uniqueAround = Array.from(
        new Map(around.map((m) => [m._id, m])).values(),
      );

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m._id));
        const newMessages = uniqueAround.filter((m) => !existingIds.has(m._id));
        if (newMessages.length === 0) return prev;
        return [...prev, ...newMessages].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });

      setHasMore(true);

      const pinIndex = pinnedMessages.findIndex((m) => m._id === messageId);
      if (pinIndex !== -1) setActivePinnedIndex(pinIndex);

      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(`message-${messageId}`);
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedId(messageId);
          setTimeout(() => setHighlightedId(null), 1500);
        }, 100);
      });
    } catch {
      notify.error(t('notify.failedFindMessage'));
    }
  }

  async function handleSearch(query: string) {
    if (!accessToken) return;
    setIsSearching(true);
    setSearchQuery(query);
    try {
      const results = await searchMessages(
        accessToken,
        activeChat.type,
        query,
        activeChat.type === 'room' ? activeChat.roomId : undefined,
        activeChat.type === 'private' ? activeChat.userId : undefined,
      );
      setSearchResults(results);
    } catch {
      notify.error(t('notify.searchError'));
    } finally {
      setIsSearching(false);
    }
  }

  return {
    messages,
    setMessages,
    pinnedMessages,
    setPinnedMessages,
    replyTo,
    setReplyTo,
    highlightedId,
    setHighlightedId,
    activePinnedIndex,
    setActivePinnedIndex,
    isMessagesLoading,
    hasMore,
    isLoadingMore,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isNavigatingRef,
    loadMore,
    scrollToMessage,
    handleSearch,
    handleSearchClose,
    searchOpen,
    setSearchOpen,
  };
}
