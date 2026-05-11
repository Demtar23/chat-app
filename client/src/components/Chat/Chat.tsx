import { useEffect, useState } from 'react';
import { fetchMessages } from '../../api/messages.api';
import { getSocket } from '../../services/socket';
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

type Props = {
  accessToken: string;
};

export function Chat({ accessToken }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    fetchMessages(accessToken).then((data) => setMessages(data));

    const socket = getSocket();
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('online_users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('receive_message');
      socket.off('online_users');
    };
  }, [accessToken]);

  function sendMessage(text: string) {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('send_message', { text });
  }

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-[#1e1f22]' : 'bg-white'}`}>
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