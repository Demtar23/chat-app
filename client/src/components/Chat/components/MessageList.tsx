import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';

type Message = {
  _id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
};

type Props = {
  messages: Message[];
  isDark: boolean;
};

export function MessageList({ messages, isDark }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 ${isDark ? 'bg-[#313338]' : 'bg-white'}`}>
      {messages.map((message) => (
        <MessageItem key={message._id} message={message} isDark={isDark} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}