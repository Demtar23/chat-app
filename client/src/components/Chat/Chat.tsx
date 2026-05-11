import { useEffect, useState } from 'react';
import { fetchMessages } from '../../api/messages.api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';

type Message = {
  _id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
};

type OnlineUser = {
  userId: string;
  userName: string;
  socketId: string;
};

export function Chat() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchMessages(accessToken).then(setMessages);

    const socket = getSocket();
    if (!socket) {
      return;
    }

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('online_users', setOnlineUsers);

    const requestUsers = () => {
      socket.emit('users:get');
    };

    socket.once('connect', requestUsers);

    if (socket.connected) {
      requestUsers();
    }

    return () => {
      socket.off('receive_message');
      socket.off('online_users');
      socket.off('connect');
    };
  }, [accessToken]);

  function sendMessage(text: string) {
    const socket = getSocket();
    if (!socket) {
      return;
    }
    socket.emit('send_message', { text });
  }

  if (!accessToken) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
        <span className="text-gray-400 text-sm">Connecting...</span>
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col ${isDark ? 'bg-[#1e1f22]' : 'bg-white'}`}
    >
      <TopBar
        onlineCount={onlineUsers.length}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar users={onlineUsers} isDark={isDark} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <MessageList messages={messages} isDark={isDark} />
          <MessageInput onSend={sendMessage} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
