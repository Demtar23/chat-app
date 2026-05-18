import type { ReplyTo } from '../../../types/message';

type Props = {
  replyTo: ReplyTo;
  isDark: boolean;
  onCancel: () => void;
};

export function ReplyPreview({ replyTo, isDark, onCancel }: Props) {
  return (
    <div className={`px-4 py-2 flex items-center gap-2 border-t ${isDark ? 'bg-[#2b2d31] border-[#1e1f22]' : 'bg-gray-50 border-gray-200'}`}>
      <div className={`flex-1 border-l-2 border-[#5865f2] pl-2`}>
        <p className="text-xs text-[#5865f2] font-medium mb-0.5">
          {replyTo.senderUsername}
        </p>
        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {replyTo.text}
        </p>
      </div>
      <button
        onClick={onCancel}
        className={`text-lg ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
      >
        ✕
      </button>
    </div>
  );
}