import type { ReplyTo } from '../../../types/message';
import { getTheme } from '../../../styles/theme';

type Props = {
  replyTo: ReplyTo;
  isDark: boolean;
  onCancel: () => void;
};

export function ReplyPreview({ replyTo, isDark, onCancel }: Props) {
  const t = getTheme(isDark);

  return (
    <div
      className={`px-4 py-2 flex items-center gap-2 border-t ${t.bgSecondary} ${t.border}`}
    >
      <div className="flex-1 border-l-2 border-[#5865f2] pl-2">
        <p className="text-xs text-[#5865f2] font-medium mb-0.5">
          {replyTo.senderUsername}
        </p>
        <p className={`text-xs truncate ${t.textMuted}`}>{replyTo.text}</p>
      </div>
      <button
        onClick={onCancel}
        className={`text-lg ${t.textFaint} hover:${t.textSecondary}`}
      >
        ✕
      </button>
    </div>
  );
}
