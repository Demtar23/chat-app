import type { Reaction } from "../../../types/message";


type Props = {
  reactions: Reaction[];
  currentUserId: string;
  isDark: boolean;
  onReact: (emoji: string) => void;
};

export function ReactionBar({ reactions, currentUserId, isDark, onReact }: Props) {
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
                ? isDark
                  ? 'bg-[#5865f2]/20 border-[#5865f2] text-white'
                  : 'bg-blue-50 border-blue-400 text-blue-700'
                : isDark
                ? 'bg-[#2b2d31] border-gray-600 text-gray-300 hover:border-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-gray-400'
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