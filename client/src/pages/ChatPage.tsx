import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { fetchRooms, joinRoom, type Room } from '../api/rooms.api';
import {
  fetchGlobalMessages,
  fetchRoomMessages,
  fetchPrivateMessages,
  type Message,
} from '../api/messages.api';
import { TopBar } from '../components/Chat/components/TopBar';
import { Sidebar } from '../components/Chat/components/Sidebar';
import { MessageList } from '../components/Chat/components/MessageList';
import { TypingIndicator } from '../components/Chat/components/TypingIndicator';
import { MessageInput } from '../components/Chat/components/MessageInput';
import { CreateRoomModal } from '../components/Chat/components/CreateRoomModal';

type OnlineUser = {
  userId: string;
  userName: string;
  socketId: string;
};

type ActiveChat =
  | { type: 'global' }
  | { type: 'room'; roomId: string; roomName: string }
  | { type: 'private'; userId: string; username: string };

export function ChatPage() {
  const { accessToken, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChat>({ type: 'global' });
  const [isDark, setIsDark] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  // завантажуємо кімнати
  useEffect(() => {
    if (!accessToken) return;
    fetchRooms(accessToken).then(setRooms);
  }, [accessToken]);

  // завантажуємо повідомлення при зміні активного чату
  useEffect(() => {
    if (!accessToken) return;

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

    socket.on('online_users', setOnlineUsers);

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

    socket.on('room:created', (room: Room) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on('reaction:updated', (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    });

    if (socket.connected) {
      socket.emit('users:get');
    } else {
      socket.once('connect', () => socket.emit('users:get'));
    }

    return () => {
      socket.off('online_users');
      socket.off('receive_message');
      socket.off('room:message:receive');
      socket.off('private:receive');
      socket.off('typing:update');
      socket.off('room:created');
      socket.off('reaction:updated');
    };
  }, [accessToken, activeChat]);

  // приєднатись до кімнати через socket при виборі
  async function handleSelectRoom(roomId: string, roomName: string) {
    if (!accessToken) return;

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
