const FIXED_EMOJIS = [
  '👍',
  '❤️',
  '😂',
  '😮',
  '😢',
  '😡',
  '🔥',
  '👏',
  '🎉',
  '💯',
  '🤔',
  '👀',
];

type Props = {
  isDark: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

export function ReactionPicker({ isDark, onSelect, onClose }: Props) {
  return (
    <div
      className={`absolute top-6 left-0 z-10 rounded-lg shadow-xl p-2 border ${
        isDark ? 'bg-[#2b2d31] border-[#1e1f22]' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex gap-1 mb-2">
        {FIXED_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="text-xl hover:scale-125 transition-transform p-1 rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
