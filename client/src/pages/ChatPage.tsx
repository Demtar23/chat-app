import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import {
  fetchGlobalMessages,
  fetchRoomMessages,
  fetchPrivateMessages,
} from '../api/messages.api';
import { TopBar } from '../components/Chat/components/TopBar';
import { Sidebar } from '../components/Chat/components/Sidebar';
import { MessageList } from '../components/Chat/components/MessageList';
import { TypingIndicator } from '../components/Chat/components/TypingIndicator';
import { MessageInput } from '../components/Chat/components/MessageInput';
import { CreateRoomModal } from '../components/Chat/components/CreateRoomModal';
import type { Message } from '../types/message';
import type { OnlineUser } from '../types/socket';
import type { Room } from '../types/room';
import type { ActiveChat } from '../types/chat';
import { fetchRooms, joinRoom } from '../api/rooms.api';
import type { UserProfile } from '../types/user';
import { fetchAllUsers } from '../api/users.api';

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

  // завантажуємо кімнати
  useEffect(() => {
    if (!accessToken) {
      return;
    }
    fetchRooms(accessToken).then(setRooms);
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

    async function loadMessages() {
      setTypingUsers([]);

      if (activeChat.type === 'global') {
        const data = await fetchGlobalMessages(token);
        setMessages(data);
      }

      if (activeChat.type === 'room') {
        const data = await fetchRoomMessages(token, activeChat.roomId);

        setMessages(data);
      }

      if (activeChat.type === 'private') {
        const data = await fetchPrivateMessages(token, activeChat.userId);

        setMessages(data);

        const socket = getSocket();
        socket?.emit('messages:seen', activeChat.userId);
      }
    }

    loadMessages();
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
      if (activeChat.type === 'global') {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('room:message:receive', (message: Message) => {
      if (activeChat.type === 'room' && activeChat.roomId === message.roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('private:receive', (message: Message) => {
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
    });

    socket.on('message:deleted', (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    });

    socket.on('message:deleted:me', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
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
    };
  }, [accessToken, activeChat, user?.id]);

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
    if (!socket) return;

    if (activeChat.type === 'global') {
      socket.emit('send_message', { text });
    } else if (activeChat.type === 'room') {
      socket.emit('room:message:send', { roomId: activeChat.roomId, text });
    } else if (activeChat.type === 'private') {
      socket.emit('private:send', { receiverId: activeChat.userId, text });
    }
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
      <div className="flex flex-1 overflow-hidden">
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
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            isDark={isDark}
            currentUserId={user.id}
            onReact={handleReact}
            onEdit={handleEdit}
            onDeleteForAll={handleDeleteForAll}
            onDeleteForMe={handleDeleteForMe}
          />
          <TypingIndicator typingUsers={typingUsers} isDark={isDark} />
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
