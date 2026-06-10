import type { Message } from '../../../types/message';
import { getTheme } from '../../../styles/theme';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../icons/icons';

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
  const theme = getTheme(isDark);
  const { t } = useTranslation();

  if (pinnedMessages.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, pinnedMessages.length - 1);
  const current = pinnedMessages[safeIndex];
  if (!current) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 border-b cursor-pointer transition-colors duration-200 ${theme.bgSecondary} ${theme.border} ${theme.bgHover}`}
      onClick={() => onScrollToMessage(current._id)}
    >
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

      <div className="flex-1 min-w-0">
        <p
          className={`inline-flex items-center gap-1 text-[11px] font-medium mb-0.5 ${theme.brandText}`}
        >
          <Icons.pin className="w-4 h-4 text-red-500" />
          {current.senderUsername}

          {pinnedMessages.length > 1 && (
            <span className={`ml-1 ${theme.textFaint}`}>
              {currentIndex + 1}/{pinnedMessages.length}
            </span>
          )}
        </p>

        <p className={`text-xs truncate ${theme.textMuted}`}>{current.text}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnpin(current._id);
        }}
        className={`text-xs px-2 py-1 rounded flex-shrink-0 ${theme.textFaint} ${theme.bgHover}`}
        title={t('messages.actions.unpin')}
      >
        <Icons.close
          className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
        />
      </button>
    </div>
  );
}
