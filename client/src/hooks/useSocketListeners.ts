import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import { fetchPrivateMessages } from '../api/messages.api';
import type { Message } from '../types/message';
import type { Room } from '../types/room';
import type { ActiveChat } from '../types/chat';
import type { UserProfile } from '../types/user';
import type { OnlineUser } from '../types/socket';

type Props = {
  accessToken: string | null;
  activeChat: ActiveChat;
  userId: string | undefined;
  isMobile: boolean;
  clearSendingFallback: () => void;
  setIsSending: (v: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPinnedMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setActivePinnedIndex: React.Dispatch<React.SetStateAction<number>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setActiveChat: React.Dispatch<React.SetStateAction<ActiveChat>>;
  setIsRoomInfoOpen: (v: boolean) => void;
  setMobileView: (v: 'sidebar' | 'chat' | 'roomInfo') => void;
  setOnlineUsers: React.Dispatch<React.SetStateAction<OnlineUser[]>>;
  setAllUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  setMyProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setSelectedProfileUser: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>;
};

export function useSocketListeners({
  accessToken,
  activeChat,
  userId,
  isMobile,
  clearSendingFallback,
  setIsSending,
  setMessages,
  setPinnedMessages,
  setActivePinnedIndex,
  setRooms,
  setActiveChat,
  setIsRoomInfoOpen,
  setMobileView,
  setOnlineUsers,
  setAllUsers,
  setMyProfile,
  setSelectedProfileUser,
  setTypingUsers,
}: Props) {
  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket();
    if (!socket) return;
    const token = accessToken;

    socket.on('online_users', setOnlineUsers);
    if (socket.connected) socket.emit('online_users:request');

    socket.on('room:created', (room: Room) => {
      setRooms((prev) => {
        const exists = prev.find((r) => r._id === room._id);
        if (exists) return prev;
        return [...prev, room].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });
    });

    socket.on('room:updated', (updatedRoom: Room) => {
      setRooms((prev) =>
        prev.map((r) => (r._id === updatedRoom._id ? updatedRoom : r)),
      );
    });

    socket.on('room:deleted', ({ roomId }: { roomId: string }) => {
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      setActiveChat((prev) => {
        if (prev.type === 'room' && prev.roomId === roomId) {
          if (isMobile) setMobileView('chat');
          return { type: 'global' };
        }
        return prev;
      });
      setIsRoomInfoOpen(false);
    });

    socket.on('receive_message', (message: Message) => {
      if (message.senderId === userId) {
        clearSendingFallback();
        setIsSending(false);
      }
      if (activeChat.type === 'global')
        setMessages((prev) => [...prev, message]);
    });

    socket.on('room:message:receive', (message: Message) => {
      if (message.senderId === userId) {
        clearSendingFallback();
        setIsSending(false);
      }
      if (activeChat.type === 'room' && activeChat.roomId === message.roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('private:receive', (message: Message) => {
      if (message.senderId === userId) {
        clearSendingFallback();
        setIsSending(false);
      }
      if (activeChat.type === 'private') {
        const isCurrentChat =
          message.senderId === activeChat.userId ||
          message.receiverId === activeChat.userId;
        if (isCurrentChat) {
          setMessages((prev) => [...prev, message]);
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
            receiverId === userId);
        if (!isRelevant) return;
        setTypingUsers((prev) =>
          isTyping
            ? prev.includes(username)
              ? prev
              : [...prev, username]
            : prev.filter((u) => u !== username),
        );
      },
    );

    socket.on('reaction:updated', (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    });

    socket.on('messages:seen', async (data: { by: string; from: string }) => {
      if (activeChat.type === 'private' && activeChat.userId === data.by) {
        const fresh = await fetchPrivateMessages(token, data.by);
        setMessages(fresh);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === userId && m.receiverId === data.by
              ? { ...m, status: 'seen' as const }
              : m,
          ),
        );
      }
    });

    socket.on('message:edited', (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
      setPinnedMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? msg : m)),
      );
    });

    socket.on('message:deleted', (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
      setPinnedMessages((prev) => prev.filter((m) => m._id !== msg._id));
    });

    socket.on('message:deleted:me', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    socket.on('message:pinned', (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
      const belongsToActiveChat =
        (activeChat.type === 'global' && msg.type === 'global') ||
        (activeChat.type === 'room' &&
          msg.type === 'room' &&
          msg.roomId === activeChat.roomId) ||
        (activeChat.type === 'private' &&
          msg.type === 'private' &&
          (msg.senderId === activeChat.userId ||
            msg.receiverId === activeChat.userId));
      if (!belongsToActiveChat) return;
      setPinnedMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
    });

    socket.on('message:unpinned', (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
      setPinnedMessages((prev) => {
        const newPinned = prev.filter((m) => m._id !== msg._id);
        if (newPinned.length === prev.length) return prev;
        setActivePinnedIndex((i) =>
          Math.min(i, Math.max(0, newPinned.length - 1)),
        );
        return newPinned;
      });
    });

    socket.on('user:updated', (updated: UserProfile) => {
      setAllUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)),
      );
      setMyProfile((prev) =>
        prev?._id === updated._id ? { ...prev, ...updated } : prev,
      );
      setSelectedProfileUser((prev) =>
        !prev || prev._id !== updated._id ? prev : updated,
      );
    });

    socket.on('user:new', (newUser: UserProfile) => {
      setAllUsers((prev) => {
        if (prev.find((u) => u._id === newUser._id)) return prev;
        return [...prev, newUser];
      });
    });

    return () => {
      [
        'online_users',
        'room:created',
        'room:updated',
        'room:deleted',
        'receive_message',
        'room:message:receive',
        'private:receive',
        'typing:update',
        'reaction:updated',
        'messages:seen',
        'message:edited',
        'message:deleted',
        'message:deleted:me',
        'message:pinned',
        'message:unpinned',
        'user:updated',
        'online_users:request',
        'user:new',
      ].forEach((e) => socket.off(e));
    };
  }, [accessToken, activeChat, userId, isMobile, clearSendingFallback]);
}
