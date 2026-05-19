import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import {
  fetchGlobalMessages,
  fetchRoomMessages,
  fetchPrivateMessages,
  fetchPinnedMessages,
} from '../api/messages.api';
import { TopBar } from '../components/Chat/components/TopBar';
import { Sidebar } from '../components/Chat/components/Sidebar';
import { MessageList } from '../components/Chat/components/MessageList';
import { TypingIndicator } from '../components/Chat/components/TypingIndicator';
import { MessageInput } from '../components/Chat/components/MessageInput';
import { CreateRoomModal } from '../components/Chat/components/CreateRoomModal';
import type { Message, ReplyTo } from '../types/message';
import type { OnlineUser } from '../types/socket';
import type { Room } from '../types/room';
import type { ActiveChat } from '../types/chat';
import { fetchRooms, joinRoom } from '../api/rooms.api';
import type { UserProfile } from '../types/user';
import { fetchAllUsers } from '../api/users.api';
import { ReplyPreview } from '../components/Chat/components/ReplyPreview';
import { PinnedMessageBar } from '../components/Chat/components/PinnedMessageBar';
import { PinnedMessageBarSkeleton } from '../components/Chat/components/ChatSkeletons';
import { AppLoader } from '../components/AppLoader';

function getActiveChatKey(c: ActiveChat): string {
  if (c.type === 'global') return 'global';
  if (c.type === 'room') return `room:${c.roomId}`;
  return `private:${c.userId}`;
}

export function ChatPage() {
  const { accessToken, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChat>({ type: 'global' });
  const [isDark, setIsDark] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [activePinnedIndex, setActivePinnedIndex] = useState(0);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSocketDisconnected, setIsSocketDisconnected] = useState(false);

  const sendingFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSendingFallback = useCallback(() => {
    if (sendingFallbackRef.current) {
      clearTimeout(sendingFallbackRef.current);
      sendingFallbackRef.current = null;
    }
  }, []);

  const startSendingFallback = useCallback(() => {
    clearSendingFallback();
    setIsSending(true);
    sendingFallbackRef.current = setTimeout(() => {
      setIsSending(false);
      sendingFallbackRef.current = null;
    }, 2500);
  }, [clearSendingFallback]);

  useEffect(() => {
    return () => clearSendingFallback();
  }, [clearSendingFallback]);

  const showPinnedBar = pinnedMessages.length > 0;

  // завантажуємо кімнати
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setIsRoomsLoading(true);
      fetchRooms(accessToken)
        .then((data) => {
          if (!cancelled) {
            setRooms(data);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsRoomsLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    fetchAllUsers(accessToken).then(setAllUsers);
  }, [accessToken]);

  // завантажуємо повідомлення при зміні активного чату
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const token = accessToken;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      void loadMessages();
    });

    async function loadMessages() {
      setIsMessagesLoading(true);
      setTypingUsers([]);
      setReplyTo(null);
      setPinnedMessages([]);

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
          const socket = getSocket();
          socket?.emit('messages:seen', activeChat.userId);
        }
      } finally {
        if (!cancelled) {
          setIsMessagesLoading(false);
        }
      }
    }

    return () => {
      cancelled = true;
    };
  }, [accessToken, activeChat]);

  // socket слухачі
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const token = accessToken; // фіксуємо токен

    socket.on('online_users', setOnlineUsers);
    socket.on('room:created', (room: Room) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on('receive_message', (message: Message) => {
      if (message.senderId === user?.id) {
        clearSendingFallback();
        setIsSending(false);
      }
      if (activeChat.type === 'global') {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('room:message:receive', (message: Message) => {
      if (message.senderId === user?.id) {
        clearSendingFallback();
        setIsSending(false);
      }
      if (activeChat.type === 'room' && activeChat.roomId === message.roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('private:receive', (message: Message) => {
      if (message.senderId === user?.id) {
        clearSendingFallback();
        setIsSending(false);
      }
      if (activeChat.type === 'private') {
        const isCurrentChat =
          message.senderId === activeChat.userId ||
          message.receiverId === activeChat.userId;

        if (isCurrentChat) {
          setMessages((prev) => [...prev, message]);

          // якщо отримувач вже в цьому чаті — одразу позначаємо як seen
          if (message.senderId === activeChat.userId) {
            socket.emit('messages:seen', activeChat.userId);
          }
        }
      }
    });

    socket.on(
      'typing:update',
      ({ username, isTyping, type, roomId, receiverId }) => {
        const isRelevant =
          (activeChat.type === 'global' && type === 'global') ||
          (activeChat.type === 'room' &&
            type === 'room' &&
            roomId === activeChat.roomId) ||
          (activeChat.type === 'private' &&
            type === 'private' &&
            receiverId === user?.id);

        if (!isRelevant) {
          return;
        }

        setTypingUsers((prev) =>
          isTyping
            ? prev.includes(username)
              ? prev
              : [...prev, username]
            : prev.filter((u) => u !== username),
        );
      },
    );

    socket.on('reaction:updated', (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    });

    socket.on('messages:seen', async (data: { by: string; from: string }) => {
      if (activeChat.type === 'private' && activeChat.userId === data.by) {
        const fresh = await fetchPrivateMessages(token, data.by);
        setMessages(fresh);
      } else {
        // відправник не в приватному чаті — просто оновлюємо статус в стейті
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === user?.id && m.receiverId === data.by
              ? { ...m, status: 'seen' as const }
              : m,
          ),
        );
      }
    });

    socket.on('message:edited', (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
      setPinnedMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    });

    socket.on('message:deleted', (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
      setPinnedMessages((prev) =>
        prev.filter((m) => m._id !== updatedMessage._id),
      );
    });

    socket.on('message:deleted:me', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    socket.on('message:pinned', (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );

      // додаємо в pinnedMessages тільки якщо відповідає активному чату
      const belongsToActiveChat =
        (activeChat.type === 'global' && updatedMessage.type === 'global') ||
        (activeChat.type === 'room' &&
          updatedMessage.type === 'room' &&
          updatedMessage.roomId === activeChat.roomId) ||
        (activeChat.type === 'private' &&
          updatedMessage.type === 'private' &&
          (updatedMessage.senderId === activeChat.userId ||
            updatedMessage.receiverId === activeChat.userId));

      if (!belongsToActiveChat) {
        return;
      }

      setPinnedMessages((prev) => {
        const exists = prev.find((m) => m._id === updatedMessage._id);
        if (exists) return prev;
        return [...prev, updatedMessage].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
    });

    socket.on('message:unpinned', (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );

      // видаляємо з pinnedMessages тільки якщо є там
      setPinnedMessages((prev) => {
        const newPinned = prev.filter((m) => m._id !== updatedMessage._id);
        if (newPinned.length === prev.length) return prev; // не було в списку
        setActivePinnedIndex((i) =>
          Math.min(i, Math.max(0, newPinned.length - 1)),
        );
        return newPinned;
      });
    });

    return () => {
      socket.off('online_users');
      socket.off('room:created');
      socket.off('receive_message');
      socket.off('room:message:receive');
      socket.off('private:receive');
      socket.off('typing:update');
      socket.off('reaction:updated');
      socket.off('messages:seen');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('message:deleted:me');
      socket.off('message:pinned');
      socket.off('message:unpinned');
    };
  }, [accessToken, activeChat, user?.id, clearSendingFallback]);

  // баннер «перепідключення» після втрати socket
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const onDisconnect = () => setIsSocketDisconnected(true);
    const onConnect = () => setIsSocketDisconnected(false);

    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);

    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }, [accessToken]);

  // повторно приєднатись до room після reconnect socket
  useEffect(() => {
    if (activeChat.type !== 'room') {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const { roomId } = activeChat;

    function rejoinRoom() {
      socket?.emit('room:join', roomId);
    }

    socket.on('connect', rejoinRoom);

    if (socket.connected) {
      rejoinRoom();
    }

    return () => {
      socket.off('connect', rejoinRoom);
    };
  }, [activeChat]);

  // приєднатись до кімнати через socket при виборі
  async function handleSelectRoom(roomId: string, roomName: string) {
    if (!accessToken) {
      return;
    }

    const socket = getSocket();

    // якщо не є членом — приєднатись
    const room = rooms.find((r) => r._id === roomId);
    if (room && !room.members.includes(user!.id)) {
      const updated = await joinRoom(accessToken, roomId);
      setRooms((prev) => prev.map((r) => (r._id === roomId ? updated : r)));
    }

    socket?.emit('room:join', roomId);
    setActiveChat({ type: 'room', roomId, roomName });
  }

  function sendMessage(text: string) {
    const socket = getSocket();
    if (!socket) {
      return;
    }

    if (activeChat.type === 'global') {
      socket.emit('send_message', { text, replyTo });
    } else if (activeChat.type === 'room') {
      socket.emit('room:message:send', {
        roomId: activeChat.roomId,
        text,
        replyTo,
      });
    } else if (activeChat.type === 'private') {
      socket.emit('private:send', {
        receiverId: activeChat.userId,
        text,
        replyTo,
      });
    }

    setReplyTo(null);
    startSendingFallback();
  }

  function getTopBarTitle() {
    if (activeChat.type === 'global') return '# global';
    if (activeChat.type === 'room') return `# ${activeChat.roomName}`;
    return `@ ${activeChat.username}`;
  }

  function handleEdit(messageId: string, text: string) {
    const socket = getSocket();
    socket?.emit('message:edit', { messageId, text });
  }

  function handleDeleteForAll(messageId: string) {
    const socket = getSocket();
    socket?.emit('message:delete', { messageId });
  }

  function handleDeleteForMe(messageId: string) {
    const socket = getSocket();
    socket?.emit('message:delete:me', { messageId });
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    setPinnedMessages((prev) => prev.filter((m) => m._id !== messageId));
  }

  function handlePin(messageId: string, isPinned: boolean) {
    const socket = getSocket();
    if (isPinned) {
      socket?.emit('message:unpin', { messageId });
    } else {
      socket?.emit('message:pin', { messageId });
    }
  }

  function handleUnpinFromBar(messageId: string) {
    const socket = getSocket();
    socket?.emit('message:unpin', { messageId });
  }

  function scrollToMessage(messageId: string) {
    const element = document.getElementById(`message-${messageId}`);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' }); // було center
    setHighlightedId(messageId);
    setTimeout(() => setHighlightedId(null), 1500);
  }

  async function handleReact(messageId: string, emoji: string) {
    if (!accessToken) {
      return;
    }

    const socket = getSocket();

    socket?.emit('reaction:toggle', { messageId, emoji });
  }

  if (!accessToken || !user) {
    return null;
  }

  return (
    <div
      className={`h-screen flex flex-col ${isDark ? 'bg-[#1e1f22]' : 'bg-white'}`}
    >
      <TopBar
        title={getTopBarTitle()}
        onlineCount={onlineUsers.length}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar
          isDark={isDark}
          onlineUsers={onlineUsers}
          allUsers={allUsers}
          rooms={rooms}
          activeChat={activeChat}
          currentUserId={user.id}
          onSelectGlobal={() => setActiveChat({ type: 'global' })}
          onSelectRoom={handleSelectRoom}
          onSelectPrivate={(userId, username) =>
            setActiveChat({ type: 'private', userId, username })
          }
          onCreateRoom={() => setShowCreateRoom(true)}
          isRoomsLoading={isRoomsLoading}
        />
        <div
          key={getActiveChatKey(activeChat)}
          className="chat-main-panel relative flex flex-col flex-1 overflow-hidden min-h-0"
        >
          {isSocketDisconnected && (
            <AppLoader
              variant="overlay"
              isDark={isDark}
              label="Перепідключення до сервера…"
            />
          )}
          {isMessagesLoading ? (
            <PinnedMessageBarSkeleton isDark={isDark} />
          ) : (
            showPinnedBar && (
              <PinnedMessageBar
                pinnedMessages={pinnedMessages}
                isDark={isDark}
                onScrollToMessage={scrollToMessage}
                onUnpin={handleUnpinFromBar}
                currentIndex={activePinnedIndex}
              />
            )
          )}
          <MessageList
            messages={messages}
            isDark={isDark}
            currentUserId={user.id}
            onReact={handleReact}
            onEdit={handleEdit}
            onDeleteForAll={handleDeleteForAll}
            onDeleteForMe={handleDeleteForMe}
            onReply={setReplyTo}
            onPin={handlePin}
            highlightedId={highlightedId}
            onScrollToMessage={scrollToMessage}
            pinnedMessageIds={pinnedMessages.map((m) => m._id)}
            onActivePinChange={setActivePinnedIndex}
            isLoading={isMessagesLoading}
          />
          <TypingIndicator typingUsers={typingUsers} isDark={isDark} />

          {replyTo && (
            <ReplyPreview
              replyTo={replyTo}
              isDark={isDark}
              onCancel={() => setReplyTo(null)}
            />
          )}
          <MessageInput
            key={
              activeChat.type === 'global'
                ? 'global'
                : activeChat.type === 'room'
                  ? activeChat.roomId
                  : activeChat.userId
            }
            onSend={sendMessage}
            isDark={isDark}
            activeChat={activeChat}
            isSending={isSending}
            isSocketDisconnected={isSocketDisconnected}
          />
        </div>
      </div>

      {showCreateRoom && (
        <CreateRoomModal
          isDark={isDark}
          accessToken={accessToken}
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setRooms((prev) => [...prev, room]);
            setShowCreateRoom(false);
          }}
        />
      )}
    </div>
  );
}
