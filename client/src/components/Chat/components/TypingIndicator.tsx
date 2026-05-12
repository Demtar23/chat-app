type Props = {
  typingUsers: string[];
  isDark: boolean;
};

export function TypingIndicator({ typingUsers, isDark }: Props) {
  if (typingUsers.length === 0) {
    return null;
  }

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} друкує...`
      : `${typingUsers.join(', ')} друкують...`;

  return (
    <div
      className={`px-4 py-1 text-xs flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
    >
      <div className="flex gap-0.5 items-center">
        <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
      </div>
      {text}
    </div>
  );
}
