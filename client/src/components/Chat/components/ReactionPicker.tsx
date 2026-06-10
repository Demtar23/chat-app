import { getTheme } from '../../../styles/theme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';

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
  const t = getTheme(isDark);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';

  if (isMobile) {
    return (
      <>
        {/* overlay для закриття */}
        <div className="fixed inset-0 z-40" onClick={onClose} />
        {/* bottom sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl p-4 border-t ${t.bgSecondary} ${t.border}`}
        >
          <div className="flex justify-center mb-3">
            <div
              className={`w-10 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
            />
          </div>
          <div className="flex justify-around">
            {FIXED_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="text-2xl p-2 hover:scale-125 transition-transform rounded-lg active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`absolute top-6 left-0 z-10 rounded-lg shadow-xl p-2 border ${t.bgSecondary} ${t.border}`}
    >
      <div className="flex gap-1">
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
