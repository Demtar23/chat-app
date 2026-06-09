import { getTheme } from '../../../styles/theme';
import type { Reaction } from '../../../types/message';

type Props = {
  reactions: Reaction[];
  currentUserId: string;
  isDark: boolean;
  onReact: (emoji: string) => void;
};

export function ReactionBar({
  reactions,
  currentUserId,
  isDark,
  onReact,
}: Props) {
  const t = getTheme(isDark);

  if (reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction) => {
        const hasReacted = reaction.users.includes(currentUserId);
        return (
          <button
            key={reaction.emoji}
            onClick={() => onReact(reaction.emoji)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
              hasReacted
                ? `bg-[#5865f2]/20 border-[#5865f2] ${t.textPrimary}`
                : `${t.bgSecondary} ${isDark ? 'border-gray-600' : 'border-gray-300'} ${t.textSecondary} hover:border-gray-400`
            }`}
          >
            <span>{reaction.emoji}</span>
            <span>{reaction.users.length}</span>
          </button>
        );
      })}
    </div>
  );
}
