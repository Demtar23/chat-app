import type { Message } from '../../../types/message';

type Props = {
  pinnedMessages: Message[];
  isDark: boolean;
  onScrollToMessage: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
  currentIndex: number;
};

export function PinnedMessageBar({
  pinnedMessages,
  isDark,
  onScrollToMessage,
  onUnpin,
  currentIndex,
}: Props) {
   if (pinnedMessages.length === 0) return null;

  // захист від виходу за межі масиву
  const safeIndex = Math.min(currentIndex, pinnedMessages.length - 1);
  const current = pinnedMessages[safeIndex];

  if (!current) return null;

  function handleClick() {
    onScrollToMessage(current._id);
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 border-b cursor-pointer ${
        isDark
          ? 'bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c]'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
      onClick={handleClick}
    >
      {/* індикатор кількості пінів */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        {pinnedMessages.map((_, i) => (
          <div
            key={i}
            className={`w-0.5 h-2 rounded-full transition-colors ${
              i === currentIndex
                ? 'bg-[#5865f2]'
                : isDark
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* вміст */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[#5865f2] font-medium mb-0.5">
          📌 {current.senderUsername}
          {pinnedMessages.length > 1 && (
            <span
              className={`ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            >
              {currentIndex + 1}/{pinnedMessages.length}
            </span>
          )}
        </p>
        <p
          className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {current.text}
        </p>
      </div>

      {/* кнопка відкріпити */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnpin(current._id);
        }}
        className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
          isDark
            ? 'text-gray-500 hover:text-gray-300 hover:bg-[#404249]'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
        }`}
        title="Відкріпити"
      >
        ✕
      </button>
    </div>
  );
}
