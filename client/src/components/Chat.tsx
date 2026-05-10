import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { fetchMessages } from '../api/messages.api';

type Message = {
  _id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
};

type Props = {
  accessToken: string;
};

export function Chat({ accessToken }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    fetchMessages(accessToken).then((data) => setMessages(data));

    const socket = getSocket();
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [accessToken]);

  function sendMessage() {
    const socket = getSocket();
    if (!socket || !text.trim()) return;

    socket.emit('send_message', { text });
    setText('');
  }

  return (
    <div>
      {messages.map((message) => (
        <div key={message._id}>
          <span>{message.senderUsername}: </span>
          <span>{message.text}</span>
        </div>
      ))}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
