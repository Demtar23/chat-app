type Message = {
  _id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
};

const COLORS = [
  'text-[#5DCAA5]', 'text-[#F0997B]', 'text-[#AFA9EC]',
  'text-[#85B7EB]', 'text-[#ED93B1]',
];

const AVATAR_COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
];

function getColorIndex(str: string) {
  return str.charCodeAt(0) % COLORS.length;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

type Props = {
  message: Message;
  isDark: boolean;
};

export function MessageItem({ message, isDark }: Props) {
  const index = getColorIndex(message.senderUsername);
  const nameColor = COLORS[index];
  const avatarColor = AVATAR_COLORS[index];

  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5 ${avatarColor.bg} ${avatarColor.text}`}>
        {message.senderUsername.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className={`text-[13px] font-medium ${nameColor}`}>
            {message.senderUsername}
          </span>
          <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatTime(message.createdAt)}
          </span>
        </div>
        <p className={`text-[13px] leading-relaxed ${isDark ? 'text-[#dbdee1]' : 'text-gray-700'}`}>
          {message.text}
        </p>
      </div>
    </div>
  );
}